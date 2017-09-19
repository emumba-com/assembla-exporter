// libs
import path from 'path'

// src
import conf from './configuration'
import { ensureDirectory, writeJSONFile, readJSONFile, hasFile, logger } from './utils'
import downloadAttachments from './downloadAttachments'
import requestDataBySpace from './requestDataBySpace'

const LEVEL_INIT                = 'LEVEL_INIT'
const LEVEL_DATA_BLANK          = 'LEVEL_DATA_BLANK'
const LEVEL_DATA_PARTIAL        = 'LEVEL_DATA_PARTIAL'
const LEVEL_DATA_FULL           = 'LEVEL_DATA_FULL'
const LEVEL_ATTACHMENTS_BLANK   = 'LEVEL_ATTACHMENTS_BLANK'
const LEVEL_ATTACHMENTS_PARTIAL = 'LEVEL_ATTACHMENTS_PARTIAL'
const LEVEL_ATTACHMENTS_FULL    = 'LEVEL_ATTACHMENTS_FULL'
const LEVEL_COMPLETE            = 'LEVEL_COMPLETE'

const getStateFilename = space => path.join(conf.outputDirectory, space.name, 'state.json')
const getBackupFilename = space => path.join(conf.outputDirectory, space.name, 'backup.json')

const getBackupObject = async space => {
    const filename = getBackupFilename(space)
    const backup = await hasFile( filename ) ? await readJSONFile( filename ) : { space }

    return backup
}

const getStateObject = async space => {
    const filename = getStateFilename(space)
    const state = await hasFile( filename ) ? await readJSONFile( filename ) : { level: LEVEL_INIT }

    return state
}

const persistStateObject = async (backup, state) => {
    const filename = getStateFilename(backup.space)
    await writeJSONFile(filename, state)

    return state
}

const persistBackupObject = async backup => {
    const filename = getBackupFilename(backup.space)
    await writeJSONFile(filename, backup)

    return backup
}

const transit = async (backup, nextState) => {
    // TODO implement this
    await persistStateObject(backup, nextState)
    return await handleState(backup, nextState)
}

const handleLevelInit = async (backup, state) => {
    logger.append(`[${backup.space.name}][${state.level}] Initiating download ...`)

    return await transit(backup, {...state, level: LEVEL_DATA_BLANK})
}

const handleLevelDataBlank = async (backup, state) => {
    // download all the data
    logger.append(`[${backup.space.name}][${state.level}] Downloading data ...`)

    const dataBySpace = await requestDataBySpace( backup.space )
    const nextBackup = {
        ...backup,
        ...dataBySpace
    }
    await persistBackupObject(nextBackup)

    return await transit(nextBackup, {...state, level: LEVEL_DATA_FULL})
}

const handleLevelDataPartial = handleLevelDataBlank

const handleLevelDataFull = async (backup, state) => {
    logger.append(`[${backup.space.name}][${state.level}] Data downlad is complete`)

    return await transit(backup, {...state, level: LEVEL_ATTACHMENTS_BLANK})
}

const handleLevelAttachmentsBlank = async (backup, state) => {
    logger.append(`[${backup.space.name}][${state.level}] Downlading attachments ...`)
    
    await downloadAttachments(backup)

    return await transit(backup, {...state, level: LEVEL_ATTACHMENTS_FULL})
}

const handleLevelAttachmentsPartial = handleLevelAttachmentsBlank

const handleLevelAttachmentsFull = async (backup, state) => {
    logger.append(`[${backup.space.name}][${state.level}] Attachments download is complete`)
    
    return await transit(backup, {...state, level: LEVEL_COMPLETE})
}

const handleLevelComplete = async (backup, state) => {
    logger.append(`[${backup.space.name}][${state.level}] Space data download is complete`)
}

const handleState = async ( backup, state ) => {
    switch( state.level ) {
        default:
        case LEVEL_INIT: {
            return await handleLevelInit( backup, state )
        }
        case LEVEL_DATA_BLANK: {
            return await handleLevelDataBlank( backup, state )
        }
        case LEVEL_DATA_PARTIAL: {
            return await handleLevelDataPartial( backup, state )
        }
        case LEVEL_DATA_FULL: {
            return await handleLevelDataFull( backup, state )
        }
        case LEVEL_ATTACHMENTS_BLANK: {
            return await handleLevelAttachmentsBlank( backup, state )
        }
        case LEVEL_ATTACHMENTS_PARTIAL: {
            return await handleLevelAttachmentsPartial( backup, state )
        }
        case LEVEL_ATTACHMENTS_FULL: {
            return await handleLevelAttachmentsFull( backup, state )
        }
        case LEVEL_COMPLETE: {
            return await handleLevelComplete( backup, state )
        }
    }
}

export default async space => {
    // test if data is already download
    // if yes, skip
    // if no, resume download

    await ensureDirectory( path.join(conf.outputDirectory, space.name) )
    const backup = await getBackupObject( space )
    const state = await getStateObject( space )

    await handleState( backup, state )
}
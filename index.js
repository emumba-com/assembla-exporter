// libs
import path from 'path'
import stayAwak from 'stay-awake'

// src
import { ensureDirectory, writeFile, readFile, logger, getRequestCount } from './utils'
import conf from './configuration'
import requestData from './requestData'
import downloadAttachmentsBySpace from './downloadAttachmentsBySpace'
import flatten from './flatten'

(async () => {
    try {
        stayAwak.prevent()
        const startTimestamp = Date.now()
        const root = await ensureDirectory(path.resolve(conf.outputDirectory))
        const data = await requestData()
    
        for (let space of data.spaces) {
            if ( conf.blacklist.spaces.indexOf(space.name) > -1 ) {
                continue
            }

            // create new directory for this space
            const dirSpace = await ensureDirectory(path.join(root, space.name))

            const fileOutputJSON = conf.outputStructure === 'flat' ? flatten( space ) : space

            // write data space by space
            await writeFile(path.join(dirSpace, 'backup.json'), JSON.stringify(fileOutputJSON))
            
            // download attachments
            await downloadAttachmentsBySpace(space, dirSpace)
        }
        
        stayAwak.allow()
        logger.append(`Data backup completed in ${(Date.now() - startTimestamp) / 1000} seconds with ${getRequestCount()} requests`)
    } catch (e) {
        logger.append(e)
        logger.append(e.stack)
    }
})()
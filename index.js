// libs
import path from 'path'
import stayAwak from 'stay-awake'

// src
import { ensureDirectory, writeFile, logger, getRequestCount } from './utils'
import conf from './configuration'
import requestData from './requestData'
import downloadAttachmentsBySpace from './downloadAttachmentsBySpace'

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

            // write data space by space
            await writeFile(path.join(dirSpace, 'backup.json'), JSON.stringify(space))
            
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
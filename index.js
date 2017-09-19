// src
import conf from './configuration'
import { ensureDirectory, track, getReq, logger } from './utils'
import { URI_LIST_SPACES } from './constants'
import downloadDataBySpace from './downloadDataBySpace'

const getSpaces = () => track('Spaces', getReq, URI_LIST_SPACES)

;(async () => {
    try {
        await ensureDirectory(conf.outputDirectory)
        
        const spaces = await getSpaces()

        for ( let space of spaces ) {
            if ( conf.blacklist.spaces.indexOf(space.name) > -1 ) {
                continue
            }

            await downloadDataBySpace(space)
        }
    } catch(e) {
        logger.append(e)
        logger.append(e.stack)
    }
})()
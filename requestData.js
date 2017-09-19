import { URI_LIST_SPACES } from './constants'
import { track, getReq, logger } from './utils'
import requestSpaceData from './requestSpaceData'
import conf from './configuration'

const getSpaces = () => track('Spaces', getReq, URI_LIST_SPACES)

export default async () => {
    const output = {}
    output.spaces = await getSpaces()

    // logger.append(`output.spaces:  ${JSON.stringify(output)}`)
    
    for (let space of output.spaces) {
        if ( conf.blacklist.spaces.indexOf(space.name) > -1 ) {
            continue
        }

        const data = await requestSpaceData(space)
        Object.assign(space, data)
    }

    return output
}


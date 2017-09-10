// src
import { URI_LIST_WIKI_PAGE_VERSIONS } from './constants'
import { length, getReqP, logger } from './utils'

const getWikiPageVersions   = ({ id }, { id: wiki_page_id }) => getReqP(URI_LIST_WIKI_PAGE_VERSIONS(id, wiki_page_id))

export default async (space, page, i, max) => {
    const output = {}

    const line = logger.append(`[WikiPage ${i}/${max}] Downloading resources: [versions: downloading]`)
    output.versions = await getWikiPageVersions(space, page)

    line.update(`[WikiPage  ${i}/${max}] Downloaded resources: [versions: ${length(output.versions)}]`)

    return output
}
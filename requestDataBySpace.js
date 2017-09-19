// src
import {
    URI_LIST_SPACE_TOOLS,
    URI_LIST_USERS,
    URI_LIST_TICKETS,
    URI_LIST_MILESTONES,
    URI_LIST_TICKET_STATUSES,
    URI_LIST_TICKET_ASSOCIATIONS,
    URI_LIST_TAGS,
    URI_LIST_TICKET_CUSTOM_FIELDS,
    URI_LIST_USER_ROLES,
    URI_LIST_DOCUMENTS,
    URI_LIST_WIKI_PAGES,

    URI_LIST_TICKET_COMMENTS,
    URI_LIST_TICKET_TAGS,
    URI_LIST_TICKET_ATTACHMENTS,
    URI_LIST_WIKI_PAGE_VERSIONS
} from './constants'
import { track, length, getReq, getReqP, logger } from './utils'
import requestDataByTicket from './requestDataByTicket'
import requestDataByWikiPage from './requestDataByWikiPage'

const getSpaceTools     = ({ id }) => track('SpaceTools', getReq, URI_LIST_SPACE_TOOLS(id))
const getUsers          = ({ id }) => track('Users', getReq, URI_LIST_USERS(id))
const getTickets        = ({ id }) => track('Tickets', getReqP, URI_LIST_TICKETS(id), { report: 0 })
const getMilestones     = ({ id }) => track('Milestones', getReqP, URI_LIST_MILESTONES(id))
const getTicketStatuses = ({ id }) => track('TicketStatuses', getReq, URI_LIST_TICKET_STATUSES(id))
const getTags           = ({ id }) => track('Tags', getReqP, URI_LIST_TAGS(id))
const getCustomFields   = ({ id }) => track('CustomFields', getReq, URI_LIST_TICKET_CUSTOM_FIELDS(id))
const getUserRoles      = ({ id }) => track('UserRoles', getReq, URI_LIST_USER_ROLES(id))
const getDocuments      = ({ id }) => track('Documents', getReqP, URI_LIST_DOCUMENTS(id))
const getWikiPages      = ({ id }) => track('WikiPages', getReqP, URI_LIST_WIKI_PAGES(id))

export default async space => {
    const lineSpace = logger.append(`[${space.name}] Downloading resources... `)
    const output = {}
    
    output.spaceTools     = await getSpaceTools(space)
    output.users          = await getUsers(space)
    output.tickets        = await getTickets(space)
    output.milestones     = await getMilestones(space)
    output.ticketStatuses = await getTicketStatuses(space)
    output.tags           = await getTags(space)
    output.customFields   = await getCustomFields(space)
    output.userRoles      = await getUserRoles(space)
    // output.documents      = await getDocuments(space)
    output.wikiPages      = await getWikiPages(space)
    
    output.ticketComments = []
    output.ticketTags = []
    output.ticketAssociations = []
    output.ticketAttachments = []

    output.wikiPageVersions = []

    let i = 1
    let max = output.tickets.length

    for (let ticket of output.tickets) {
        const { comments, tags, associations, attachments } = await requestDataByTicket(space, ticket, i++, max)
        // Object.assign(ticket, data)
        output.ticketComments.push( ...comments )
        output.ticketTags.push( ...tags )
        output.ticketAssociations.push( ...associations )
        output.ticketAttachments.push( ...attachments )
    }

    i = 1
    max = output.wikiPages.length

    for (let page of output.wikiPages) {
        const { versions } = await requestDataByWikiPage(space, page, i++, max)
        // Object.assign(page, data)
        output.wikiPageVersions.push( ...versions )
    }

    lineSpace.update(`[${space.name}] Resource download completed`)

    return output
}
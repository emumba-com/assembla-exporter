// src
import {
    URI_LIST_TICKET_COMMENTS,
    URI_LIST_TICKET_ASSOCIATIONS,
    URI_LIST_TICKET_TAGS,
    URI_LIST_TICKET_ATTACHMENTS
} from './constants'

import { length, getReq, getReqP, logger } from './utils'

const getTicketComments     = ({ id }, { number }) => getReqP(URI_LIST_TICKET_COMMENTS(id, number))
const getTicketAssociations = ({ id }, { number }) => getReq(URI_LIST_TICKET_ASSOCIATIONS(id, number))
const getTicketTags         = ({ id }, { number }) => getReq(URI_LIST_TICKET_TAGS(id, number))
const getTicketAttachments  = ({ id }, { number }) => getReq(URI_LIST_TICKET_ATTACHMENTS(id, number))

export default async (space, ticket, i, max) => {
    const output = {}

    const line = logger.append(`[Ticket ${i}/${max}] Downloading resources: [comments: downloading, associations: waiting, tags: waiting, attachments: waiting]`)
    output.comments = await getTicketComments(space, ticket) || []
    
    line.update(`[Ticket ${i}/${max}] Downloading resources: [comments: ${length(output.comments)}, associations: downloading, tags: waiting, attachments: waiting]`)
    output.associations = await getTicketAssociations(space, ticket) || []

    line.update(`[Ticket ${i}/${max}] Downloading resources: [comments: ${length(output.comments)}, associations: ${length(output.associations)}, tags: downloading, attachments: waiting]`)
    output.tags = await getTicketTags(space, ticket) || []

    line.update(`[Ticket ${i}/${max}] Downloading resources: [comments: ${length(output.comments)}, associations: ${length(output.associations)}, tags: ${length(output.tags)}, attachments: downloading]`)
    output.attachments = await getTicketAttachments(space, ticket) || []

    line.update(`[Ticket ${i}/${max}] Downloaded resources: [comments: ${length(output.comments)}, associations: ${length(output.associations)}, tags: ${length(output.tags)}, attachments: ${length(output.attachments)}]`)

    return output
}
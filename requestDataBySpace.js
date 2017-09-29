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
import { track, length, getReq, getReqP, getReqGP, logger } from './utils'
import requestDataByTicket from './requestDataByTicket'
import requestDataByWikiPage from './requestDataByWikiPage'

/*
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
*/

/*
async function *getEntitiesByPage(backup, state, key, uri, queryString) {
    const { status, page } = state.entities[key]
    const { space } = backup
    const entities = backup[key] ? [...backup[key]] : []
    // const line = logger.append(`[${space.name}][getEntitiesByPage] Downloading ${key} ...`)

    for await ( let result of getReqGP(uri, {...queryString, page}) ) {
        const { items, page: thisPage } = result
        Array.prototype.push.apply(entities, items)

        // line.update(`[${space.name}][getEntitiesByPage] Yielding ${entities.length} ${key} till page ${thisPage}`)
        yield { entities, page: thisPage }
    }

    // line.update(`[${space.name}][getEntitiesByPage] Downloaded ${entities.length} ${key}`)
}
*/

/*
async function *downloadEntitiesByPage(nextBackup, nextState, key, uri, queryString) {
    const line = logger.append(`[${space.name}][downloadEntitiesByPage][${key}] Initiating download ...`)

    if ( nextState.entities[key].status !== 'complete' ) {
        for await (let result of getEntitiesByPage(nextBackup, nextState, key, uri, queryString)) {
            const { entities, page } = result
            line.update(`[${space.name}][downloadEntitiesByPage][${key}] Downloading: ${entities.length} items`)

            nextBackup[key] = entities
            nextState.entities[key].page = page + 1

            yield { nextBackup, nextState }
        }

        line.update(`[${space.name}][downloadEntitiesByPage][${key}] Downloaded ${nextBackup[key].length} items`)

        nextState.entities[key].status = 'complete'

        yield { nextBackup, nextState }
    } else {
        line.update(`[${space.name}][downloadEntitiesByPage][${key}] Already downloaded`)
    }
}
*/

/*
async function *downloadEntities(nextBackup, nextState, key, uri, queryString) {
    const line = logger.append(`[${space.name}][downloadEntities][${key}] Initiating download ...`)

    if ( nextState.entities[key].status !== 'complete' ) {
        nextBackup[key] = await getReq(uri)
        nextState.entities[key].status = 'complete'
        line.update(`[${space.name}][downloadEntities][${key}] Downloaded ${nextBackup[key].length} items`)

        yield { nextBackup, nextState }
    } else {
        line.update(`[${space.name}][downloadEntities][${key}] Already downloaded`)
    }
}
*/

async function *requestEntities(nextBackup, nextState, key, uri, options) {
    const { space } = nextBackup
    // const line = logger.append(`[${space.name}][requestEntities][${key}] Downloading ...`)
    // const entities = nextBackup[key] || []
    let entities
    let page

    if ( options.multiPage ) {
        // for await (let result of getEntitiesByPage(nextBackup, nextState, key, uri, options.queryString)) {
        page = nextState.entities[key].page
        // entities =  nextBackup[key] || []
        // nextBackup[key] = nextBackup[key] || []

        for await (let result of getReqGP(uri, {...options.queryString, page })) {
            const { items, page: thisPage } = result

            // Array.prototype.push.apply(entities, items)
            // line.update(`[${space.name}][requestEntities][${key}] Downloading: ${entities.length} items, from ${thisPage + 1} page(s)`)

            // nextState.entities[key].page = thisPage + 1

            yield { entities: items, page: thisPage + 1 }
        }
    } else {
        entities = await getReq(uri) || []
        yield { entities, page }
    }

    // line.update(`[${space.name}][requestEntities][${key}] Downloaded ${entities.length} items`)
    // options.onComplete(nextBackup, nextState)
    
    // yield { nextBackup, nextState }
    
}

async function *downloadEntities(nextBackup, nextState, key, uri, pOptions = {}) {
    const { space } = nextBackup
    const line = logger.append(`[${space.name}][downloadEntities][${key}] Initiating download ...`)

    const options = {
        multiPage: false,
        queryString: {},
        onComplete: (nextBackup, nextState) => {
            nextState.entities[key].status = 'complete'
        },
        ...pOptions
    }

    if ( nextState.entities[key].status === 'complete' ) {
        line.update(`[${space.name}][downloadEntities][${key}] Already downloaded`)
        return
    }

    if ( !options.parentEntityKey ) {
        // yield *requestEntities(nextBackup, nextState, key, uri, options)
        const entities = nextBackup[key] || []

        line.update(`[${space.name}][downloadEntities][${key}] Downloading [count=${entities.length}]`)
        for await (let result of requestEntities(nextBackup, nextState, key, uri, options)) {
            const { entities: entitiesByPage = [], page } = result
            
            Array.prototype.push.apply(entities, entitiesByPage)
            nextBackup[key] = entities
            nextState.entities[key].page = page

            line.update(`[${space.name}][downloadEntities][${key}] Downloading [count=${entities.length}]`)

            yield { nextBackup, nextState }
        }

        line.update(`[${space.name}][downloadEntities][${key}] Downloaded [count=${entities.length}]`)
        nextState.entities[key].status = 'complete'
        yield { nextBackup, nextState }

        return
    }

    const parentEntities = nextBackup[options.parentEntityKey].slice(nextState.entities[key].parentIndex)
    const entities = nextBackup[key] || []
    // nextState.entities[key].parentIndex = 0

    for (let p of parentEntities) {
        line.update(`[${space.name}][downloadEntities][${key}] Downloading [parentEntityKey=${options.parentEntityKey}][parentIndex=${nextState.entities[key].parentIndex}][count=${entities.length}]`)
        for await (let result of requestEntities(nextBackup, nextState, key, uri(nextBackup, p), options)) {
            // const { nextBackup, nextState } = result
            // Array.prototype.push.apply(entities, nextBackup[key])
            const { entities: entitiesByPage, page } = result
            Array.prototype.push.apply(entities, entitiesByPage)
            nextBackup[key] = entities
            nextState.entities[key].page = page

            line.update(`[${space.name}][downloadEntities][${key}] Downloading [parentEntityKey=${options.parentEntityKey}][parentIndex=${nextState.entities[key].parentIndex}][count=${entities.length}]`)

            yield { nextBackup, nextState }
        }

        line.update(`[${space.name}][downloadEntities][${key}] Downloading [parentEntityKey=${options.parentEntityKey}][parentIndex=${nextState.entities[key].parentIndex}][count=${entities.length}]`)

        nextState.entities[key].page = 1
        nextState.entities[key].parentIndex++
        yield { nextBackup, nextState }
    }

    line.update(`[${space.name}][downloadEntities][${key}] Downloaded [parentEntityKey=${options.parentEntityKey}][parentIndex=${nextState.entities[key].parentIndex}][count=${entities.length}]`)

    nextBackup[key] = entities
    nextState.entities[key].status = 'complete'
    yield { nextBackup, nextState }
}

export default async function* (backup, state) {
    const { space } = backup
    const lineSpace = logger.append(`[${space.name}] Downloading resources... `)
    const nextBackup = { ...backup }
    const nextState = JSON.parse(JSON.stringify(state))
    
    async function *downloadEntitiesC(key, uri, options) {
        yield *downloadEntities(nextBackup, nextState, key, uri, options)
    }
    /*
    yield *downloadEntities(nextBackup, nextState, 'spaceTools', URI_LIST_SPACE_TOOLS(nextBackup.space.id))
    yield *downloadEntities(nextBackup, nextState, 'users', URI_LIST_USERS(nextBackup.space.id))
    yield *downloadEntitiesByPage(nextBackup, nextState, 'tickets', URI_LIST_TICKETS(nextBackup.space.id), { report: 0 })
    yield *downloadEntitiesByPage(nextBackup, nextState, 'milestones', URI_LIST_MILESTONES(nextBackup.space.id), { report: 0 })
    yield *downloadEntities(nextBackup, nextState, 'ticketStatuses', URI_LIST_TICKET_STATUSES(nextBackup.space.id))
    yield *downloadEntitiesByPage(nextBackup, nextState, 'tags', URI_LIST_TAGS(nextBackup.space.id))
    yield *downloadEntities(nextBackup, nextState, 'customFields', URI_LIST_TICKET_CUSTOM_FIELDS(nextBackup.space.id))
    yield *downloadEntities(nextBackup, nextState, 'userRoles', URI_LIST_USER_ROLES(nextBackup.space.id))
    yield *downloadEntitiesByPage(nextBackup, nextState, 'wikiPages', URI_LIST_WIKI_PAGES(nextBackup.space.id))
    */

    // new code
    yield *downloadEntitiesC('spaceTools', URI_LIST_SPACE_TOOLS(space.id))
    yield *downloadEntitiesC('users', URI_LIST_USERS(space.id))
    yield *downloadEntitiesC('tickets', URI_LIST_TICKETS(space.id), {
        multiPage: true,
        queryString: { report: 0 }
    })
    yield *downloadEntitiesC('milestones', URI_LIST_MILESTONES(space.id), {
        multiPage: true
    })
    yield *downloadEntitiesC('ticketStatuses', URI_LIST_TICKET_STATUSES(space.id))
    yield *downloadEntitiesC('tags', URI_LIST_TAGS(space.id), {
        multiPage: true
    })
    yield *downloadEntitiesC('customFields', URI_LIST_TICKET_CUSTOM_FIELDS(space.id))
    yield *downloadEntitiesC('userRoles', URI_LIST_USER_ROLES(space.id))
    yield *downloadEntitiesC('wikiPages', URI_LIST_WIKI_PAGES(space.id), {
        multiPage: true
    })
    yield *downloadEntitiesC('documents', URI_LIST_DOCUMENTS(space.id), {
        multiPage: true
    })

    yield *downloadEntitiesC('ticketComments', (nextBackup, ticket) => URI_LIST_TICKET_COMMENTS(space.id, ticket.number), {
        multiPage: true,
        parentEntityKey: 'tickets'
    })

    yield *downloadEntitiesC('ticketTags', (nextBackup, ticket) => URI_LIST_TICKET_TAGS(space.id, ticket.number), {
        parentEntityKey: 'tickets'
    })

    yield *downloadEntitiesC('ticketAssociations', (nextBackup, ticket) => URI_LIST_TICKET_ASSOCIATIONS(space.id, ticket.number), {
        parentEntityKey: 'tickets'
    })

    yield *downloadEntitiesC('ticketAttachments', (nextBackup, ticket) => URI_LIST_TICKET_ATTACHMENTS(space.id, ticket.number), {
        parentEntityKey: 'tickets'
    })

    yield *downloadEntitiesC('wikiPageVersions', (nextBackup, wikiPage) => URI_LIST_WIKI_PAGE_VERSIONS(space.id, wikiPage.id), {
        parentEntityKey: 'wikiPages'
    })
}

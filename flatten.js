export default pSpace => {
    const {
        spaceTools,
        users,
        tickets: pTickets,
        milestones,
        ticketStatuses,
        tags,
        customFields,
        userRoles,
        wikiPages: pWikiPages,

        ...space
    } = pSpace

    const tickets = []
    const ticketComments = []
    const ticketAssociations = []
    const ticketAttachments = []
    const ticketTags = []

    // comments
    // associations
    // attachments
    // tags
    for ( let pTicket of pTickets ) {
        const {
            comments = [],
            associations = [],
            attachments = [],
            tags = [],

            ...ticket
        } = pTicket

        tickets.push( ticket )
        Array.prototype.push.apply(ticketComments, comments)
        Array.prototype.push.apply(ticketAssociations, associations)
        Array.prototype.push.apply(ticketAttachments, attachments)
        Array.prototype.push.apply(ticketTags, tags)
    }

    const wikiPages = []
    const wikiPageVersions = []

    // wiki versions
    for ( let pWikiPage of pWikiPages ) {
        const { versions = [], ...wikiPage } = pWikiPage

        wikiPages.push( wikiPage )
        Array.prototype.push.apply(wikiPageVersions, versions)
    }

    return {
        space,
        spaceTools,
        users,
        tickets,
        ticketComments,
        ticketAssociations,
        ticketAttachments,
        ticketTags,
        milestones,
        ticketStatuses,
        tags,
        customFields,
        userRoles,
        wikiPages,
        wikiPageVersions
    }
}
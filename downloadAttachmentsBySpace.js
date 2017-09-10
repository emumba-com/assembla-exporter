// libs
import path from 'path'

// src
import { download, ensureDirectory, logger } from './utils'

export default async (space, outputDir) => {
    // create directory for attachments
    
    if ( !space.tickets ) {
        return
    }

    const dirAttachments = await ensureDirectory(path.join(outputDir, '/attachments'))
    const attachmentsAll = space.tickets.reduce((attachments, ticket) => ticket && ticket.attachments ? attachments.concat(ticket.attachments) : attachments, [])
    
    let i = 0

    for ( let ticket of space.tickets ) {
        if ( !ticket.attachments ) {
            continue
        }

        for ( let attachment of ticket.attachments ) {
            const line = logger.append(`[Attachment ${++i}/${attachmentsAll.length}] Downloading ...`)
            const filename = `Ticket#${ticket.number}__${attachment.filename}`
            await download( attachment.url, path.join(dirAttachments, filename) )
            line.update(`[Attachment ${i}/${attachmentsAll.length}] Downloaded`)
        }
    }
}
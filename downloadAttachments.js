// libs
import path from 'path'

// src
import { download, ensureDirectory, logger, hasFile } from './utils'
import conf from './configuration'

export default async backup => {
    // create directory for attachments
    const { space, ticketAttachments: attachments } = backup

    if ( !attachments || !attachments.length ) {
        logger.append(`[${space.name}] No attachments are found`)
        // logger.append(JSON.stringify(attachments))
        return
    }

    const dirAttachments = await ensureDirectory(path.join(conf.outputDirectory, space.name, '/attachments'))
    
    let i = 0

    for ( let attachment of attachments ) {
        const line = logger.append(`[Attachment ${++i}/${attachments.length}] Downloading ...`)
        const filename = `__TicketID ${attachment.ticket_id}__${attachment.filename}`

        if ( await hasFile(path.join(dirAttachments, filename)) ) {
            line.update(`[Attachment ${i}/${attachments.length}] Already downloaded`)
        } else {
            await download( attachment.url, path.join(dirAttachments, filename) )
            line.update(`[Attachment ${i}/${attachments.length}] Downloaded`)
        }
    }
}
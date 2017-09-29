// libs
import path from 'path'

// src
import { download, ensureDirectory, logger, hasFile } from './utils'
import conf from './configuration'

const DIR_DOWNLOADS = '/attachments'
const KEY_ENTITY = 'documents'

export default async backup => {
    // create directory for attachments
    const { space } = backup
    const attachments = backup[KEY_ENTITY]

    if ( !attachments || !attachments.length ) {
        logger.append(`[${space.name}] No attachments are found`)
        // logger.append(JSON.stringify(attachments))
        return
    }

    const dirAttachments = await ensureDirectory(path.join(conf.outputDirectory, space.name, DIR_DOWNLOADS))
    
    let i = 0
    const line = logger.append(`[${space.name}][downloadAttachments][Attachment ${i}/${attachments.length}] Downloading ...`)

    for ( let attachment of attachments ) {
        const filename = attachment.ticket_id
            ? `__TicketID ${attachment.ticket_id}__${attachment.filename}`
            : `__ID ${attachment.id}__${attachment.filename}`

        if ( await hasFile(path.join(dirAttachments, filename)) ) {
            // line.update(`[Attachment ${i}/${attachments.length}] Already downloaded`)
        } else {
            await download( attachment.url, path.join(dirAttachments, filename) )
            // line.update(`[Attachment ${i}/${attachments.length}] Downloaded`)
        }

        line.update(`[${space.name}][downloadAttachments][Attachment ${++i}/${attachments.length}] Downloading ...`)
    }

    line.update(`[${space.name}][downloadAttachments] Downloaded [count=${i}]`)
}
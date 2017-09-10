// pagination: false
export const URI_LIST_SPACES = '/v1/spaces'

export const URI_LIST_SPACE_TOOLS          = space_id => `/v1/spaces/${space_id}/space_tools`
export const URI_LIST_USERS                = space_id => `/v1/spaces/${space_id}/users`
export const URI_LIST_USER_ROLES           = space_id => `/v1/spaces/${space_id}/user_roles`
export const URI_LIST_MILESTONES           = space_id => `/v1/spaces/${space_id}/milestones/all`
export const URI_LIST_TAGS                 = space_id => `/v1/spaces/${space_id}/tags`
export const URI_LIST_DOCUMENTS            = space_id => `/v1/spaces/${space_id}/documents`
export const URI_LIST_WIKI_PAGES           = space_id => `/v1/spaces/${space_id}/wiki_pages`
export const URI_LIST_TICKETS              = space_id => `/v1/spaces/${space_id}/tickets`
export const URI_LIST_TICKET_STATUSES      = space_id => `/v1/spaces/${space_id}/tickets/statuses`
export const URI_LIST_TICKET_CUSTOM_FIELDS = space_id => `/v1/spaces/${space_id}/tickets/custom_fields`

export const URI_LIST_TICKET_ASSOCIATIONS  = (space_id, ticket_number) => `/v1/spaces/${space_id}/tickets/${ticket_number}/ticket_associations`
export const URI_LIST_TICKET_COMMENTS      = (space_id, ticket_number) => `/v1/spaces/${space_id}/tickets/${ticket_number}/ticket_comments`
export const URI_LIST_TICKET_TAGS          = (space_id, ticket_number) => `/v1/spaces/${space_id}/tickets/${ticket_number}/tags`
export const URI_LIST_TICKET_ATTACHMENTS   = (space_id, ticket_number) => `/v1/spaces/${space_id}/tickets/${ticket_number}/attachments`

export const URI_LIST_WIKI_PAGE_VERSIONS   = (space_id, wiki_page_id) => `/v1/spaces/${space_id}/wiki_pages/${wiki_page_id}/versions`
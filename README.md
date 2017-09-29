# Assembla Exporter
Create a full backup of your data, including attachments and user lists.

## Problem Statement
Assembla has two built-in data export methods, but both of those methods download only a subset of data, which is not enough.

## This Project
This project uses Assembla API to extract following information:
- spaces
- spaceTools
- users
- tickets
- milestones
- ticketStatuses
- tags
- customFields
- userRoles
- documents
- wikiPages
- ticketComments
- ticketTags
- ticketAssociations
- ticketAttachments
- wikiPageVersions

It respects Assembla's API limits, and lets you download your data in multiple sessions (by keeping track of progress).

## Dependencies
You need to have Node and NPM installed in your system.

## Getting Started
- Clone this project
- Run `npm install`
- Rename `configuration.template.js` to `configuration.js`
- Set your Assembla API `key`, `secret` and path to output directory in `configuration.js`.
- Run `npm start`

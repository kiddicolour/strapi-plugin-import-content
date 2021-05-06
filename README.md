# Strapi plugin import-content

A quick description of import-content.


# HERE BE DRAGONS
_This repo is far from production ready, but works optimiscally_

Import data into Strapi, as seen on the Strapi Community Blog Posts (4 in total)
https://strapi.io/blog/how-to-create-an-import-content-plugin-part-1-4
This project is written based on the Blog Post above, using the current Strapi methods
and converting to functional React components.

This Blog Post itself is based on the work of https://github.com/jbeuckm/strapi-plugin-import-content
Sadly enough this project seems unmaintained and is not working at all with Strapi
as it currently stands.

An earlier attempt to start off a forked version - https://github.com/4levels/strapi-plugin-import-content
resulted in ... not much

The following additions were done:

### Internationalization support
Imported data containing values in multiple languages are correctly inserted and linked,
allowing the Strapi backend to function properly.

### Relation support
Optimistically try to map related id's contained in a single cell to their related Content Types
by a selectable field, splittable by a configurable separator.
Relations to internationalized records are linked to their translated counterparts.
Handles nested data via parent/children as long as the imported data is sorted properly.
Optionally and limited try to create missing related records.
Works best if the related records are created first though, from leaf to branch so to speak.

### Create and Update support
Allow the selection of an imported field value to be used to match an existing record property,
to allow repeated imports of the same record, updating instead of creating.  Optionally ignore 
records not found in the imported data

### Markdown & URL remapping support
Optionally convert to markdown and parse urls.
Rewrite imported content to accomodate for routing changes.  Currently this is 
hardcoded and tailored to the specific needs of Kiddicolor.

### Fieldmapping guessing
Optimistically guess the field name and language from the imported field names
and the selected target Content Type.

### Date & Workflow support
Validate dates and set created_at and updated_at timestamps of imported records.
If the Draft / Publish feature is enabled, adds the updated_at column as well

## Requirements
For this to work, the Content Type needs to have an extra column to hold any external id,

## Caveats - dragons
This code is only tested running locally using Strapi and online using Platform.sh in a 
development environment.
There's at least one glitch in the mappig table where blurring an input field forces a scroll up.
There's definitely much bigger issues to be found as well, this is merely an attempt to make a
usable import feature and move on afterwards as this is a one off operation.



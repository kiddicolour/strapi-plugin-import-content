const { replace } = require("lodash");
const striptags = require("striptags");
const { addParams } = require("./utils");

/**
 * importFields
 * Creates a single record or an set of records in case multiple languages are defined.
 * If many records are returned, the first record will be the full record
 * the others will be limited to only the localized field values.
 *
 * Reason: Strapi needs the id of the initial record to add translations
 * as the creation procedure accepts only a single language at a time
 *
 */
const importFields = async (sourceItem, fieldMapping, options) => {

  const { locales, saveAsDraft, update } = options || {}
  const defaultLocale = locales && locales.filter(locale => locale.default).pop().value
  const importedItems = [];
  const importLocales = getLocales(fieldMapping, defaultLocale)

  // console.log('importFields with sourceItem', sourceItem, 'fieldMapping', fieldMapping, 'options', options)

  const baseRecord = await importAllFields(sourceItem, fieldMapping, defaultLocale, saveAsDraft)
  // console.log('baseRecord', baseRecord)
  // always import all fields first
  importedItems.push(baseRecord)

  if (importLocales.length) {
    for (const locale of importLocales) {
      const localizedRecord = {
        ...baseRecord,
        ...await importLocalizedFields(sourceItem, fieldMapping, locale, saveAsDraft)
      }
      importedItems.push(localizedRecord)
    }
  }

  return importedItems;
};

const importAllFields = async (sourceItem, fieldMapping, defaultLocale, saveAsDraft) => {

  // console.log('importAllFields with sourceItem', sourceItem, 'fieldMapping', fieldMapping, 'defaultLocale', defaultLocale)
  const importedItem = {}

  // console.log('importAllfields', fieldMapping)
  for (const sourceField of Object.keys(fieldMapping)) {
    const { targetField, useLocale, relatedModel, parseUrls, toMarkdown, stripTags } = fieldMapping[sourceField];
    // console.log(`field: ${sourceField}, target: ${targetField}`, options)
    if (!targetField || targetField === "none") {
      continue;
    }

    if (relatedModel) {
      // console.log('foundRelatedModel', relatedModel, sourceItem, sourceField, 'with options', options)
      importedItem[targetField] = await processRelation(sourceItem, sourceField, { ...fieldMapping[sourceField], useLocale: useLocale || defaultLocale })
    } else {
      // console.log(`no related model, useLocale: ${useLocale}, defaultLocale: ${defaultLocale} `, targetField, 'options', options, 'relatedModel', relatedModel)
      if (!useLocale || (defaultLocale && useLocale == defaultLocale)) {
        importedItem[targetField] = await processField(sourceItem, sourceField, stripTags, toMarkdown, parseUrls, useLocale || defaultLocale)
      }
    }

    // console.log('importAllFields targetField:', targetField, 'options', options, 'relatedModel', relatedModel)

  };

  // if saveAsDraft is enabled, clear published__publicationState: "preview"
  // add published_at = null instead
  if (saveAsDraft && !importedItem.published_at) {
    importedItem.published_at = null
  }

  return importedItem;
}

const importLocalizedFields = async (sourceItem, fieldMapping, locale, saveAsDraft) => {
  // console.log('importLocalizedFields with sourceItem', sourceItem, 'fieldMapping', fieldMapping, 'locale', locale)
  // initialize localizedItem with id so we can detect and fill it during import
  const importedItem = { id: null }

  for (const sourceField of Object.keys(fieldMapping)) {
    const { targetField, useLocale, relatedModel, toMarkdown, parseUrls, stripTags } = fieldMapping[sourceField];
    // console.log('process localized fiueld ', sourceField, 'useLocale', useLocale, 'targetField', targetField)
    if (!targetField || targetField === "none") {
      continue
    }

    if (relatedModel) {
      importedItem[targetField] = await processRelation(sourceItem, sourceField, { ...fieldMapping[sourceField], useLocale: useLocale || locale, saveAsDraft })
      // console.log(`importLocalized relation result for `, importedItem[targetField], 'with options', {...options, useLocale: options.useLocale || locale})
    } else {
      if (useLocale && useLocale === locale) {
        importedItem[targetField] = await processField(sourceItem, sourceField, stripTags, toMarkdown, parseUrls, locale)
      }
    }

  };

  // force set locale
  importedItem.locale = locale

  // if saveAsDraft is enabled, add _publicationState: "preview"
  if (saveAsDraft && !importedItem.published_at) {
    importedItem.published_at = null
  }

  // console.log('localized item:', importedItem)

  return importedItem;

}



const processRelation = async (item, field, options) => {
  const {
    relatedModel,
    relationType,
    useSeparator = " ",
    useLocale,
    useIdentifier = "id",
    createMissing = false,
    saveAsDraft
  } = options || {};

  let params = {}
  const toOne = relationType && relationType.indexOf("ToOne") > 2

  // console.log('related options', options)

  // treat single relation type differently
  if (toOne) {
    params = addParams({ [useIdentifier]: item[field] }, useLocale)
    const relatedRecord = await strapi.query(relatedModel).findOne(params)
    // console.log('fetch toOne with params', params, 'with result', relatedRecord && relatedRecord.id || "none")
    if (relatedRecord) {
      return relatedRecord.id
    }
    // no creation of single relation types, sort your import files up front as workaround
  }

  const values = item[field].split(useSeparator)
  params = addParams({ [useIdentifier]: values }, useLocale)
  const relatedRecords = await strapi.query(relatedModel).find(params)
  // console.log('fetch toMany with params', params, 'with many results: ', relatedRecords && relatedRecords.length || "none")

  // console.log('found relatedRecords', relatedRecords)
  // if we found all records, get their id's and call it a day
  if (relatedRecords.length === values.length) {
    return relatedRecords.map(record => record.id)
  }

  // now the tricky part: if one or more records is missing and createMissing is true,
  // we have to create the missing records, and only the missing records
  if (createMissing) {

    let relatedIds = [];

    // loop through all values without using forEach due to async generator effects
    for (const value of values) {
      // i love reducers
      const existingId = relatedRecords.reduce(
        (result, record) => result = result || record[useIdentifier] == value ? record.id : false,
        false
      )

      /* why not try with find?
      const existingRecord = relatedRecords.find(record => record[useIdentifier] === value)
      const existingId = existingRecord.id
      */

      if (existingId) {
        relatedIds.push(existingId)
      } else {
        // create record and use id

        // console.log(`Creating new ${relatedModel} with ${useIdentifier}: ${value}`)
        params = addParams({ [useIdentifier]: value }, useLocale, saveAsDraft)
        const result = await strapi.query(relatedModel).create(params)
        relatedIds.push(result.id)
      }
    }

    if (relatedIds.length) {
      return relatedIds
    }
  }
}

const processField = async (sourceItem, sourceField, stripTags, toMarkdown, parseUrls, locale) => {
  const originalValue = sourceItem[sourceField];

  let result = originalValue

  // striptags will remove all tags, so not compatible with parseUrls & toMarkdown
  if (toMarkdown || parseUrls) {
    //result = toMarkdown && toMarkdown(result) || result
    result = parseUrls && replaceurls(result, locale) || result
    console.log('toMarkdown or parseUrls on', parseUrls), result
  } else {
    result = stripTags && striptags(results, ['a', 'ul', 'li', 'em', 'strong', 'b', 'i']) || result
  }

  return result
  // return stripTags
  //   ? striptags(originalValue)
  //   : originalValue
}

const getLocales = (fieldMapping, defaultLocale) => {
  const locales = [];
  Object.values(fieldMapping).forEach( mapping => {
    if (mapping && mapping.useLocale && (!defaultLocale || mapping.useLocale !== defaultLocale)) {
      locales.push(mapping.useLocale)
    }
  })
  return locales.filter(
    (locale, index, self) => locale && self.indexOf(locale) === index
  )
}

const replaceurls = (text, locale) => {

  if (typeof text !== "string") {
    return text
  }

  const urlMap = [{
    original: '/\\?kleurprent-type=([a-z0-9-/]+)"',
    target: '/type/$1"',
    model: "application::type.type",
    identifier: "slug"
  }, {
    original: '/\\?thema=([a-z0-9-/]+)"',
    target: '/theme/$1"',
    model: "application::theme.theme",
    identifier: "slug",
    // add localizations
    // localizations: {
    //   nl: '/thema/$1"',
    //   fr: '/thema/$1"',
    //   de: '/thema/$1"',
    //   es: '/thema/$1"',
    //   sv: '/thema/$1"',
    //   pl: '/thema/$1"',
    //   ru: '/thema/$1"',
    // }
  }]

  // console.log('urlMap', urlMap)

  const replacements = urlMap.map(({ original, target, localizations, model, identifier }) => {

    const pattern = new RegExp(original, 'g')
    // // if text contains a replacement and locale is set, retrieve replacement translation
    // not needed ATM, oooof
    // if (text.match(pattern) && locale) {
    //   // find rest of the url
    // }

    return [
      pattern,
      localizations && localizations[locale] || target
    ]
  })

  return replacements.reduce((result, current) => {
    result = result.replace(current[0], current[1])
    return result
  }, text)

  for (const replacement of replacements) {
    // console.log('calling replace', replacement[0], 'with', replacement[1])
    text = text.replace(replacement[0], replacement[1])
  }
  // console.log('replacements from urlMap', replacements, 'with result text', text, ' for locale', locale)

  return text
}

module.exports = importFields;

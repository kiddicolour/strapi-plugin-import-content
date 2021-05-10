import React from "react";
import PropTypes from "prop-types";

import TargetFieldSelect from "./TargetFieldSelect";
import RelationFieldSelect from "./RelationFieldSelect";
import LocaleSelect from "./LocaleSelect";
import SeparatorInput from "./SeparatorInput";
import { Label, Checkbox, Flex } from "@buffetjs/core";
import { Globe } from "@buffetjs/icons";

const MappingOptions = ({ stat, handleFocus, active, handleChange, targetField, targetModel, locales, mapping, models }) => {

  const { schema: { attributes, pluginOptions: { i18n: { localized } } } } = targetModel
  const fieldAttributes = attributes[targetField]
  const hasLocalizedOptions = fieldAttributes?.pluginOptions?.i18n?.localized || false
  const relationType = fieldAttributes?.nature
  const relatedModel = models.find(model => model.uid === fieldAttributes?.target) || null
  const { useSeparator, useIdentifier, useLocale, toMarkdown, stripTags, parseUrls, createMissing, importMediaToField } = mapping || {}
  const defaultLocale = locales.find(locale => locale.default)

  // global options
  // locales, targetModel, models

  // global targetModel options
  // localized

  // global targetField options
  // hasLocalizedOptions, relationIdentifier, relationType, relatedModel

  // const [locale, setLocale] = useState(locales.reduce(
  //   (result, locale) => 
  //     result = result || (locale.default ? locale.value : false)))
  // const [separator, setSeparator] = useState("|")
  // const [relationIdentifier, setRelationIdentifier] = useState()
  // const [toMarkdown, setToMarkdown] = useState()
  // const [parseUrls, setParseUrls] = useState()
  // const [stripTags, setStripTags] = useState()
  // const [createMissing, setCreateMissing] = useState()
  // const [importMediaToField, setImportMediaToField] = useState()

  // state imported field options
  // locale, separator, relationIdentifier, toMarkdown, stripTags, parseUrls, 
  // createMissing, importMediaToField, relationType

  // const localized = targetModel.schema.pluginOptions?.i18n?.localized
  // const hasLocalizedOptions = localized && targetField && targetModel.schema.attributes[targetField]?.pluginOptions?.i18n?.localized || false
  // const locale = targetField && mapping?.options?.useLocale || null
  // const separator = targetField && mapping?.options?.useSeparator || null
  // const relationIdentifier = targetField && mapping?.options?.useIdentifier || null
  // const toMarkdown = targetField && mapping?.options?.toMarkdown || null
  // const stripTags = targetField && mapping?.options?.stripTags || null
  // const parseUrls = targetField && mapping?.options?.parseUrls || null
  // const createMissing = targetField && mapping?.options?.createMissing || null
  // const importMediaToField = targetField && mapping?.options?.importMediaToField || null
  // const relationType = targetField && targetModel.schema.attributes[targetField]?.nature || false
  // const relatedModelName = relationType && targetModel.schema.attributes[targetField]?.collection || null
  // const relatedModel = targetField && models.find(model => model.uid === targetModel.schema.attributes[targetField]?.target) || null
  // const relatedModelFields = relatedModel && relatedModel[0]?.attributes?.map(attribute => (
  //   { label: attribute, value: attribute}
  // ))

  const toOne = typeof relationType === "string" && relationType.indexOf("ToOne") > 2

  // console.log('MappingOptions models', models, 'relatedModel', relatedModel, 'targetField', targetField, 'targetModel', targetModel)
  // console.log("MappingOptions stat", stat, "targetModel", targetModel, "locales", locales)
  return (
    <div>
      {stat.format === "xml" && (
        <Flex flexDirection="column">
          {/* <Checkbox
            message={"Strip Tags"} 
            name={`${stat.fieldName}_stripCheckbox`}
            value={stripTags}
            onChange={e => handleChange({ stripTags: e?.target.value })}
          /> */}
          <Checkbox
            message={"To Markdown"}
            name={`${stat.fieldName}_markdownCheckbox`}
            value={toMarkdown}
            onChange={e => handleChange({ toMarkdown: e?.target.value })}
          />
          <Checkbox
            message={"Parse Urls"}
            name={`${stat.fieldName}_parseCheckbox`}
            value={parseUrls}
            onChange={e => handleChange({ parseUrls: e?.target.value })}
          />
        </Flex>
      )}
      {stat.hasMediaUrls && (
        <Flex alignItems="center" justifyContent="flex-start">
          <Label
            htmlFor={`${stat.fieldName}_mediaTargetSelect`}
            message={"Import Media"}
          />
          <TargetFieldSelect
            name={`${stat.fieldName}_mediaTargetSelect`}
            targetModel={targetModel}
            value={importMediaToField}
            handleChange={field =>
              handleChange({ importMediaToField: field })
            }
          />
        </Flex>
      )}
      {hasLocalizedOptions && (
        <Flex alignItems="center" justifyContent="flex-start">
          <Globe fill={defaultLocale?.value === useLocale || !useLocale ? 'green' : 'silver'} style={{ width: '2rem' }} />
          <LocaleSelect
            name={`${stat.fieldName}_mediaTargetSelect`}
            value={useLocale}
            locales={locales}
            handleChange={locale =>
              handleChange({ useLocale: locale })
            }
          />
        </Flex>
      )}
      {relationType && (
        <>
          { !toOne &&
            <Flex alignItems="center" justifyContent="flex-start">
              <Label
                htmlFor={`${stat.fieldName}_relationSeparatorInput`}
                message={"Use separator: "}
              />
              <SeparatorInput
                name={`${stat.fieldName}_relationSeparatorInput`}
                value={useSeparator}
                autoFocus={active}
                onFocus={() => handleFocus(stat.fieldName)}
                handleChange={separator =>
                  handleChange({ useSeparator: separator })
                }
              />
            </Flex>
          }
          <Flex alignItems="center" justifyContent="flex-start">
            <Label
              htmlFor={`${stat.fieldName}_relationIdentifierSelect`}
              message={"Use identifier: "}
            />
            <RelationFieldSelect
              name={`${stat.fieldName}_relationIdentifierSelect`}
              targetModel={relatedModel}
              value={useIdentifier}
              handleChange={field =>
                handleChange({ useIdentifier: field })
              }
            />
          </Flex>
          {
            !toOne && <Checkbox
              message={"Create missing"}
              name={`${stat.fieldName}_createMissingCheckbox`}
              value={createMissing}
              onChange={e => handleChange({ createMissing: e?.target.value })}
            />
          }
        </>
      )}
    </div>
  );
};

MappingOptions.propTypes = {
  stat: PropTypes.object.isRequired,
  targetField: PropTypes.string.isRequired,
  targetModel: PropTypes.object,
  handleChange: PropTypes.func,
  locales: PropTypes.array,
  mapping: PropTypes.object,
  models: PropTypes.array,
};

export default MappingOptions;

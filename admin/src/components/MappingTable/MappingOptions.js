import React from "react";
import PropTypes from "prop-types";

import TargetFieldSelect from "./TargetFieldSelect";
import RelationFieldSelect from "./RelationFieldSelect";
import LocaleSelect from "./LocaleSelect";
import SeparatorInput from "./SeparatorInput";
import { Label, Checkbox, Flex } from "@buffetjs/core";

const MappingOptions = ({ stat, handleChange, targetModel, locales, options, models }) => {

  const selectedField = options && options[stat.fieldName]?.targetField

  if (!selectedField) {
    return null
  }
  const modelLocalized = targetModel.schema.pluginOptions?.i18n?.localized
  const hasLocalizedOptions = modelLocalized && selectedField && targetModel.schema.attributes[selectedField]?.pluginOptions?.i18n?.localized || false
  const locale = selectedField && options[stat.fieldName]?.options?.useLocale || null
  const separator = selectedField && options[stat.fieldName]?.options?.useSeparator || null
  const relationIdentifier = selectedField && options[stat.fieldName]?.options?.useIdentifier || null
  const toMarkdown = selectedField && options[stat.fieldName]?.options?.toMarkdown || null
  const stripTags = selectedField && options[stat.fieldName]?.options?.stripTags || null
  const parseUrls = selectedField && options[stat.fieldName]?.options?.parseUrls || null
  const createMissing = selectedField && options[stat.fieldName]?.options?.createMissing || null
  const importMediaToField = selectedField && options[stat.fieldName]?.options?.importMediaToField || null
  const relationType = selectedField && targetModel.schema.attributes[selectedField]?.nature || false
  const relatedModelName = relationType && targetModel.schema.attributes[selectedField]?.collection || null
  const relatedModel = selectedField && models.filter(model => model.uid === targetModel.schema.attributes[selectedField]?.target).pop() || null
  const relatedModelFields = relatedModel && relatedModel[0]?.attributes?.map(attribute => (
    { label: attribute, value: attribute}
  ))
  
  const toOne = typeof relationType === "string" && relationType.indexOf("ToOne") > 2

  // console.log('MappingOptions models', models, 'relatedModel', relatedModel, 'selectedField', selectedField, 'targetModel', targetModel)
  // console.log("MappingOptions stat", stat, "targetModel", targetModel, "locales", locales)
  return (
    <>
      {stat.format === "xml" && (
        <>
          <Checkbox
            message={"Strip Tags"} 
            name={`${stat.fieldName}_stripCheckbox`}
            value={stripTags}
            onChange={e => handleChange({ stripTags: e?.target.value })}
          />
          <Checkbox
            message={"Convert to Markdown"}
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
        </>
      )}
      {stat.hasMediaUrls && (
        <div style={{ paddingTop: 8, paddingBottom: 8 }}>
          <Label
            htmlFor={`${stat.fieldName}_mediaTargetSelect`}
            message={"Import Media to Field"}
          />
          <TargetFieldSelect
            name={`${stat.fieldName}_mediaTargetSelect`}
            targetModel={targetModel}
            value={importMediaToField}
            handleChange={targetField =>
              handleChange({ importMediaToField: targetField })
            }
          />
        </div>
      )}
      {hasLocalizedOptions && (
        <>
          <Label
            htmlFor={`${stat.fieldName}_localeTargetSelect`}
            message={"Use Locale for Field"}
          />
          <LocaleSelect
            name={`${stat.fieldName}_mediaTargetSelect`}
            value={locale}
            locales={locales}
            handleChange={locale =>
              handleChange({ useLocale: locale })
            }
          />
        </>        
      )}
      {relationType && (
          <>
            { !toOne && 
              <>
                <Label
                  htmlFor={`${stat.fieldName}_relationSeparatorInput`}
                  message={"Use separator: "}
                />
                <SeparatorInput
                  name={`${stat.fieldName}_relationSeparatorInput`}
                  value={separator}
                  style={{width: "3em"}}
                  handleChange={separator =>
                    handleChange({ useSeparator: separator })
                  }
                />
              </>
            }
            <Label
              htmlFor={`${stat.fieldName}_relationIdentifierSelect`}
              message={"Use identifier: "}
            />
            <RelationFieldSelect
              name={`${stat.fieldName}_relationIdentifierSelect`}
              targetModel={relatedModel}
              value={relationIdentifier}
              handleChange={targetField =>
                handleChange({ useIdentifier: targetField })
              }
            />
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
    </>
  );
};

MappingOptions.propTypes = {
  stat: PropTypes.object.isRequired,
  targetModel: PropTypes.object,
  handleChange: PropTypes.func,
  locales: PropTypes.array,
  options: PropTypes.object,
  models: PropTypes.array,
};

export default MappingOptions;

import React, { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import MappingOptions from "./MappingOptions";
import TargetFieldSelect from "./TargetFieldSelect";
import Row from "../Row";
import { Table } from "@buffetjs/core";
import {
  Bool as BoolIcon,
  Json as JsonIcon,
  Text as TextIcon,
  NumberIcon,
  Email as EmailIcon,
  Calendar as DateIcon,
  RichText as XmlIcon
} from "@buffetjs/icons";

const MappingTable = ({ analysis, targetModel, handleChange, options, updateTargetField, updateSourceField }) => {

  const { locales, models } = options
  const [mapping, setMapping] = useState({})
  const [currentField, setCurrentField] = useState()
  const fieldNameSeparator = "_"

  useEffect(() => {
    const newMapping = {
      ...mapping,
      ...guessMappings()
    }
    setMapping(newMapping)
    handleChange(newMapping)
  }, [analysis, targetModel, updateSourceField, updateTargetField])

  const detectFieldnameSeparator = (name) => {
    return name.indexOf(fieldNameSeparator) > 0 ? fieldNameSeparator : false
    // somehow this only works with 1 separator :mindblown:
    // const separators = ["_", "-", " "]
    // return separators.reduce(
    //   (result, separator) => 
    //     result = result || name.indexOf(separator) > 0 ? separator : false
    //   , false
    // )
  }

  const getFieldNameDetails = (fieldName) => {
    const nameParts = getFieldnameParts(fieldName)
    const lastPart = nameParts?.length > 1 && nameParts.pop() || false
    const baseName = lastPart ? nameParts.join(fieldNameSeparator) : null
    if (lastPart) {
      // find locale
      const locale = locales.find(locale => locale.value === lastPart)
      if (locale) {
        return {
          fieldName,
          baseName,
          locale: locale.value
        }
      }
    }
    return {
      fieldName
    }
  }

  const getFieldnameParts = (name, separator) => {
    if (!separator) {
      separator = detectFieldnameSeparator(name)
    }
    if (!name || !name.length > 2 || !separator) return
    return name.split(separator)
  }

  const guessMappings = () => {
    if (!analysis?.fieldStats || !targetModel) {
      return
    }
    const newMapping = mapping || {}

    for (const stat of analysis.fieldStats) {
      const { fieldName, baseName, locale } = getFieldNameDetails(stat.fieldName)

      if (fieldName) {
        if (!newMapping[fieldName]) {
          newMapping[fieldName] = {}
        }

        if (fieldName === updateSourceField && updateTargetField && updateTargetField !== "none") {
          newMapping[fieldName].targetField = updateTargetField
        }

        if (baseName) {
          if (!newMapping[fieldName]) {
            newMapping[fieldName] = {}
          }
          newMapping[fieldName].targetField = baseName
          if (locale) {
            newMapping[fieldName].useLocale = mapping[fieldName]?.useLocale || locale
          }
        }

        if (!baseName && Object.keys(targetModel.schema.attributes).indexOf(fieldName) >= 0) {
          newMapping[fieldName].targetField = fieldName
        }

        // if we guessed a relational field, make sure to set the relatedModel and relationType
        const relationType = targetModel.schema.attributes[fieldName]?.nature || false
        const relatedModelName = relationType && targetModel.schema.attributes[fieldName]?.collection || null
        const relatedModel = models.find(model => model.uid === targetModel.schema.attributes[fieldName]?.target) || null

        if (relatedModel) {
          newMapping[fieldName].useIdentifier = mapping[fieldName]?.useIdentifier || "id"
          newMapping[fieldName].relatedModel = relatedModel.uid
          newMapping[fieldName].relationType = relationType
        }
      }
    }

    return newMapping
  }

  // const changeMappingOptions = (stat) => (options) => {

  //   const newMapping = {
  //     ...mapping,
  //     [stat.fieldName]: {
  //       ...mapping[stat.fieldName],
  //       ...options
  //     }
  //   }

  //   setMapping(newMapping)
  //   handleChange(newMapping)
  // };

  const setMappingOptions = (source, targetField, opts, clear) => {

    // try to guess language from fieldName
    const { fieldName, locale } = getFieldNameDetails(source)

    // merge existing options if not clear
    const newOptions = Object.assign(clear ? {} : (mapping[fieldName] || {}), opts || {})
    console.log(`setMappingOptions for ${source} -> ${targetField} with opts`, opts, 'clear', clear, 'newOptions', newOptions)

    if (fieldName) {
      const newMapping = {
        ...mapping,
        [fieldName]: {
          ...newOptions,
          targetField: targetField || mapping[fieldName]?.targetField,
        }
      }

      if (locale) {
        newMapping[source].useLocale = newMapping[source].useLocale || locale
      }

      // console.log('newMapping', newMapping)

      setMapping(newMapping)
      handleChange(newMapping)
    }

  };

  const CustomRow = ({ row }) => {
    const { fieldName, count, format, minLength, maxLength, meanLength } = row;
    const active = currentField === fieldName
    const targetField = mapping[fieldName]?.targetField
    const showMapping = targetField && targetField !== "none"
    return (
      <tr onClick={() => setCurrentField(fieldName)} key={`row_${fieldName}`} style={{ paddingTop: 18 }}>
        <td>{fieldName}</td>
        <td>
          <p>{count}</p>
        </td>
        <td>
          {format === "string" && <TextIcon fill="#fdd835" />}
          {format === "number" && <NumberIcon fill="#fdd835" />}
          {format === "boolean" && <BoolIcon fill="#fdd835" />}
          {format === "object" && <JsonIcon fill="#fdd835" />}
          {format === "email" && <EmailIcon fill="#fdd835" />}
          {format === "date" && <DateIcon fill="#fdd835" />}
          {format === "xml" && <XmlIcon fill="#fdd835" />} <p>{format}</p>
        </td>
        <td>
          <span>{minLength}</span>
        </td>
        <td>
          <p>{maxLength}</p>
        </td>
        <td>
          <p>{meanLength}</p>
        </td>
        <td>
          {showMapping && (
            <MappingOptions
              targetModel={targetModel}
              targetField={targetField}
              active={active}
              stat={row}
              handleFocus={(field => setCurrentField(field))}
              handleChange={(opts) => setMappingOptions(fieldName, targetField, opts)}
              locales={locales}
              mapping={mapping[fieldName]}
              models={models}
            />
          )}
        </td>
        <td>
          {targetModel && (
            <TargetFieldSelect
              targetModel={targetModel}
              name={`${fieldName}TargetField`}
              value={targetField || (updateSourceField == fieldName && updateTargetField) || ''}
              handleChange={(field, options) => setMappingOptions(fieldName, field, options, true)}
            />
          )}
        </td>
      </tr>
    );
  };

  const info = {
    title: "Field Mapping",
    subtitle:
      "Configure the Relationship between CSV Fields and Content type Fields"
  };
  const headers = [
    { name: "Field", value: "fieldName" },
    { name: "Count", value: "count" },
    { name: "Format", value: "format" },
    { name: "Min Length", value: "minLength" },
    { name: "Max Length", value: "maxLength" },
    { name: "Mean Length", value: "meanLength" },
    { name: "Options", value: "options" },
    { name: "Destination", value: "destination" }
  ];
  const items = [...analysis.fieldStats];
  return (
    <Table
      {...info}
      headers={headers}
      rows={items}
      customRow={CustomRow}
    />
  );
}

MappingTable.propTypes = {
  analysis: PropTypes.object.isRequired,
  targetModel: PropTypes.object,
  handleChange: PropTypes.func,
  options: PropTypes.object,
  targetField: PropTypes.string,
  sourceField: PropTypes.string,
};

export default memo(MappingTable);

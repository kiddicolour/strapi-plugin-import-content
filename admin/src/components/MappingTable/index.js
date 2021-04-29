import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import MappingOptions from "./MappingOptions";
import TargetFieldSelect from "./TargetFieldSelect";
import _ from "lodash";
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

const MappingTable = ({ analysis, targetModel, handleChange }) => {
  const [mapping, setMapping] = useState({})

  // useEffect(() => {
  //   strapi.notification.toggle({type: 'info', message: 'useEffect mapping ' + JSON.stringify(mapping)})
  //   handleChange(mapping)
  // }, [mapping])

  const changeMappingOptions = (stat) => (options) => {
    //let newMapping = _.cloneDeep(mapping)
    // const newMapping = {
    //   ...mapping,
    //   ...Object.entries(options).reduce((res, v, k) => {
    //     res[stat.fieldName][k] = v
    //     return res
    //   })
    // }

    const newMapping = {
      ...mapping,
      [stat.fieldName]: {
        ...mapping[stat.fieldName],
        options
      }
    }

    console.log("changeMappingOptions", {
      ...mapping,
      [stat.fieldName]: {
        ...mapping[stat.fieldName],
        options
      }
    })

    setMapping(newMapping)
    handleChange(newMapping)
    strapi.notification.toggle({ type: 'warning', message: 'changeMappingOptions ' + JSON.stringify(newMapping) })
//    console.log('changeMappingOptions newMapping', newMapping)
    // for (let key in options) {
    //   newMapping[stat.fieldName][key] = options[key]
    //   //_.set(newState, `mapping[${stat.fieldName}][${key}]`, options[key]);
    // }

    // let newState = _.cloneDeep(this.state);
    // for (let key in options) {
    //   _.set(newState, `mapping[${stat.fieldName}][${key}]`, options[key]);
    // }
    //this.setState(newState, () => this.props.handleChange(this.state.mapping));
    //setMapping(newMapping)
    //handleChange(newMapping)
  };

  const setMappingOptions = (source, targetField) => {
    const newMapping = {
      ...mapping,
      [source]: {
        ...mapping[source],
        targetField
      }
    }

    setMapping(newMapping)

    console.log("setMappingOptions", newMapping)

    handleChange(newMapping)
    //handleChange(newMapping)
    // const state = _.set(
    //   this.state,
    //   `mapping[${source}]['targetField']`,
    //   targetField
    // );
    // this.setState(state, () => this.props.onChange(this.state.mapping));
    //strapi.notification.toggle({type: 'warning', message: 'log ' + JSON.stringify(mapping)})

    // console.log('setMappingOptions newMapping', newMapping);
  };

  const CustomRow = ({ row }) => {
    const { fieldName, count, format, minLength, maxLength, meanLength } = row;

    return (
      <tr style={{ paddingTop: 18 }}>
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
          <MappingOptions
            targetModel={targetModel}
            stat={row}
            handleChange={changeMappingOptions(row)}
          />
        </td>
        <td>
          {targetModel && (
            <TargetFieldSelect
              targetModel={targetModel}
              value={mapping[fieldName]?.targetField}
              handleChange={(targetField) => setMappingOptions(fieldName, targetField)}
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
  console.log("Table items", items)
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
};

export default memo(MappingTable);

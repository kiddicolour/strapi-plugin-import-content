import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";
import { get } from "lodash";
import { StrapiProvider } from 'strapi-helper-plugin';

const RelationFieldSelect = ({ handleChange, targetModel, value, name }) => {

  // const [selectedRelation, setSelectedRelation] = useState("")

  // useEffect(
  //   () => {
  //     const options = fillOptions()
  //     setSelectedRelation(options && options[0])
  //   },
  //   []
  // )

  // useEffect(
  //   () => {
  //     handleChange && handleChange(selectedRelation)
  //   },
  //   [selectedRelation]
  // )

  const handleChanges = ({ target: { value } }) => {
    // strapi.notification.toggle({type: 'warning', message: 'RelationFieldSelect handleChanges ' + JSON.stringify(value)})
    // setSelectedRelation(value);
    handleChange(value);
  }

  const fillOptions = () => {
    const schemaAttributes = get(targetModel, ["schema", "attributes"], {});
    const options = Object.keys(schemaAttributes)
      .map(fieldName => {
        const attribute = get(schemaAttributes, [fieldName], {});
        if (attribute.type) {
          return { label: fieldName, value: fieldName };
        }
        if (attribute.nature) {
          return { label: `[${fieldName}]`, value: fieldName };
        }
      })
      .filter(obj => obj !== undefined);
    //console.log('fillOptions options', options)
    return [{ label: "id", value: "id" }, ...options];
  }

  // console.log("selectedRelation", selectedRelation)

  return (
    <Select
      name={name}
      value={value || "none"}
      options={fillOptions()}
      onChange={handleChanges}
    />
  );
}

RelationFieldSelect.propTypes = {
  targetModel: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
};

export default memo(RelationFieldSelect);

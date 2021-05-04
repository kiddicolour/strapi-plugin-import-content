import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";
import { get } from "lodash";
import { StrapiProvider } from 'strapi-helper-plugin';

const TargetFieldSelect = ({ handleChange, targetModel, value, name }) => {

  // const [selectedTarget, setSelectedTarget] = useState("")

  // useEffect(
  //   () => {
  //     const options = fillOptions()
  //     setSelectedTarget(options && options[0])
  //   },
  //   []
  // )

  // useEffect(
  //   () => {
  //     handleChange && handleChange(selectedTarget)
  //   },
  //   [selectedTarget]
  // )

  const handleChanges = ({ target: { value } }) => {
    // console.log('targetFieldSelect handleChanges', value, targetModel.schema.attributes)
    const options = targetModel.schema.attributes[value]?.nature
      ? { 
        relatedModel: targetModel.schema.attributes[value].target,
        relationType: targetModel.schema.attributes[value].nature
      } 
      : null
    // strapi.notification.toggle({type: 'warning', message: 'TargetFieldSelect handleChanges ' + JSON.stringify(value) + 'options: ' + JSON.stringify(options)})
    // setSelectedTarget(value);
    handleChange(value, options);
  }

  const fillOptions = () => {
    const { schema: { attributes, draftAndPublish }} = targetModel;
    const options = Object.keys(attributes)
      .map(fieldName => {
        const { type, nature } = attributes[fieldName];
        if (type) {
          return { label: fieldName, value: fieldName };
        }
        if (nature) {
          return { label: `[${fieldName}]`, value: fieldName };
        }
      })
      .filter(obj => obj !== undefined);

    options.push({label: "created_at", value: "created_at"}) 
    options.push({label: "updated_at", value: "updated_at"})

    if (draftAndPublish) {
      options.push({label: "published_at", value: "published_at"}) 
    }

    //console.log('fillOptions options', options)
    return [{ label: "None", value: "none" }, ...options];
  }

  // console.log("selectedTarget", selectedTarget)

  return (
    <Select
      name={name}
      value={value || "none"}
      options={fillOptions()}
      onChange={handleChanges}
    />
  );
}

TargetFieldSelect.propTypes = {
  targetModel: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
};

export default memo(TargetFieldSelect);

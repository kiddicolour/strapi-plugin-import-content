import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";
import { get } from "lodash";
import { StrapiProvider } from 'strapi-helper-plugin';

const TargetFieldSelect = ({ handleChange, targetModel, value }) => {

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
    strapi.notification.toggle({type: 'warning', message: 'TargetFieldSelect handleChanges ' + JSON.stringify(value)})
    // setSelectedTarget(value);
    handleChange(value);
  }

  const fillOptions = () => {
    const schemaAttributes = get(targetModel, ["schema", "attributes"], {});
    const options = Object.keys(schemaAttributes)
      .map(fieldName => {
        const attribute = get(schemaAttributes, [fieldName], {});
        return attribute.type && { label: fieldName, value: fieldName };
      })
      .filter(obj => obj !== undefined);
    //console.log('fillOptions options', options)
    return [{ label: "None", value: "none" }, ...options];
  }

  // console.log("selectedTarget", selectedTarget)

  return (
    <Select
      name={"targetField"}
      value={value || "none"}
      options={fillOptions()}
      onChange={handleChanges}
    />
  );
}

TargetFieldSelect.propTypes = {
  targetModel: PropTypes.object,
  handleChange: PropTypes.func
};

export default memo(TargetFieldSelect);

import React, { memo } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";

const SourceFieldSelect = ({ handleChange, analysis, value, name }) => {

  const { fieldStats } = analysis;

  const handleChanges = ({ target: { value } }) => {
    // console.log('targetFieldSelect handleChanges', value, targetModel.schema.attributes)
    const options = analysis?.fieldStats.find(stat => stat.fieldName === value)
      ? {
        updateSourceField: value,
      }
      : null
    // strapi.notification.toggle({type: 'warning', message: 'SourceFieldSelect handleChanges ' + JSON.stringify(value) + 'options: ' + JSON.stringify(options)})
    // setSelectedSource(value);
    handleChange(value, options);
  }

  const sourceFields = fieldStats.map(stat => {
      const { fieldName } = stat;
      if (fieldName) {
        return { label: fieldName, value: fieldName };
      }
    })
    .filter(obj => obj !== undefined);

  // console.log("selectedSource", selectedSource)

  return (
    <Select
      name={name}
      value={value || "none"}
      options={[{ label: "None", value: "none" }, ...sourceFields]}
      onChange={handleChanges}
    />
  );
}

SourceFieldSelect.propTypes = {
  analysis: PropTypes.object,
  handleChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
};

export default memo(SourceFieldSelect);

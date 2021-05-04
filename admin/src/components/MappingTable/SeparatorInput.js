import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { InputText} from "@buffetjs/core";

const SeparatorInput = ({ handleChange, value, name, ...props }) => {

  // const [selectedLocale, setSelectedLocale] = useState("en")

  // useEffect(
  //   () => {
  //     const options = fillOptions()
  //     setSelectedLocale(options && options[0])
  //   },
  //   []
  // )

  // useEffect(
  //   () => {
  //     handleChange && handleChange(selectedLocale)
  //   },
  //   [selectedLocale]
  // )

  const handleChanges = ({ target: { value } }) => {
    // strapi.notification.toggle({type: 'warning', message: 'SeparatorInput handleChanges ' + JSON.stringify(value)})
    // setSelectedLocale(value);
    handleChange(value);
  }

  // console.log("selectedLocale", selectedLocale)

  return (
    <InputText
      name={name}
      value={value || ""}
      onChange={handleChanges}
      {...props}
    />
  );
}

SeparatorInput.propTypes = {
  handleChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
};

export default memo(SeparatorInput);

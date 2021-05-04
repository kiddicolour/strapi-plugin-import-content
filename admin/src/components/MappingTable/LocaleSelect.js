import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";

const LocaleSelect = ({ handleChange, locales, value }) => {

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
    // strapi.notification.toggle({type: 'warning', message: 'LocaleSelect handleChanges ' + JSON.stringify(value)})
    // setSelectedLocale(value);
    handleChange(value);
  }

  const defaultLocale = locales.filter(locale => locale.default).pop()

  const fillOptions = () => {
    const options = locales.map(locale => {
      return { label: locale.label, value: locale.value }
    })
    // console.log('fillOptions locales', options, defaultLocale)
    return [...options];
  }

  // console.log("selectedLocale", selectedLocale)

  return (
    <Select
      name={"locale"}
      value={value || defaultLocale.value}
      options={fillOptions()}
      onChange={handleChanges}
    />
  );
}

LocaleSelect.propTypes = {
  locales: PropTypes.array,
  handleChange: PropTypes.func,
  value: PropTypes.string,
};

export default memo(LocaleSelect);

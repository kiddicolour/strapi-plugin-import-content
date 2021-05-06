import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Select } from "@buffetjs/core";

const LocaleSelect = ({ handleChange, locales, name, value }) => {

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

  const defaultLocale = locales.find(locale => locale.default)

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
      name={name}
      value={value || defaultLocale.value}
      options={fillOptions()}
      onChange={handleChanges}
    />
  );
}

LocaleSelect.propTypes = {
  name: PropTypes.string.isRequired,
  locales: PropTypes.array,
  handleChange: PropTypes.func,
  value: PropTypes.string,
};

export default memo(LocaleSelect);

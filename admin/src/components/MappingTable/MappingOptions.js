import React from "react";
import PropTypes from "prop-types";

import TargetFieldSelect from "./TargetFieldSelect";
import { Label } from "@buffetjs/core";

const MappingOptions = ({ stat, handleChange, targetModel }) => {
  return (
    <div>
      {stat.format === "xml" && (
        <div>
          <Label htmlFor={"stripCheckbox"} message={"Strip Tags"} />
          <input
            name={"stripCheckbox"}
            type="checkbox"
            onChange={e => handleChange({ stripTags: e.target.checked })}
          />
        </div>
      )}
      {stat.hasMediaUrls && (
        <div style={{ paddingTop: 8, paddingBottom: 8 }}>
          <Label
            htmlFor={"mediaTargetSelect"}
            message={"Import Media to Field"}
          />
          <TargetFieldSelect
            name={"mediaTargetSelect"}
            targetModel={targetModel}
            handleChange={targetField =>
              handleChange({ importMediaToField: targetField })
            }
          />
        </div>
      )}
    </div>
  );
};

MappingOptions.propTypes = {
  stat: PropTypes.object.isRequired,
  targetModel: PropTypes.object,
  handleChange: PropTypes.func
};

export default MappingOptions;

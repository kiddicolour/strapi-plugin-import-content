import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "@buffetjs/core";
import moment from "moment";
import { LoadingIndicator, PopUpWarning } from "strapi-helper-plugin";

const HistoryTable = ({ configs, deleteImport, undoImport }) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUndoModal, setShowUndoModal] = useState(false)
  const [importToDelete, setImportToDelete] = useState(null)
  const [importToUndo, setImportToUndo] = useState(null)

  const setDeleteImport = (id) => {
    setShowDeleteModal(true)
    setImportToDelete(id)
  };

  const setUndoImport = (id) => {
    setShowUndoModal(true)
    setImportToUndo(id)
  };

  const CustomRow = ({ row }) => {
    const { id, contentType, importedCount, ongoing, updated_at } = row;
    const updatedAt = moment(updated_at);
    let source;
    switch (row.source) {
      case "upload":
        source = row.options.filename;
        break;
      case "url":
        source = row.options.url;
        break;
      default:
        source = "unknown";
    }
    return (
      <tr style={{ paddingTop: 18 }}>
        <td>{source}</td>
        <td>{contentType}</td>
        <td>{updatedAt.format("LLL")}</td>
        <td>{importedCount}</td>
        <td>{ongoing ? <LoadingIndicator /> : <span>Ready</span>}</td>
        <td>
          <div className={"row"}>
            <div
              style={{
                marginRight: 18,
                marginLeft: 18
              }}
              onClick={() => setUndoImport(id)}
            >
              <i className={"fa fa-undo"} role={"button"} />
            </div>
            <div onClick={() => setDeleteImport(id)}>
              <i className={"fa fa-trash"} role={"button"} />
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const info = {
    title: "Import History",
    subtitle: "Manage the Initiated Imports"
  };
  const headers = [
    { name: "Source", value: "source" },
    { name: "Content Type", value: "contentType" },
    { name: "Updated At", value: "updatedAt" },
    { name: "Items", value: "items" },
    { name: "Progress State", value: "progress" },
    { name: "Actions", value: "actions" }
  ];
  const items = [...configs];

  return (
    <div className={"col-md-12"} style={{ paddingTop: 12 }}>
      <PopUpWarning
        isOpen={showDeleteModal}
        toggleModal={() => setShowDeleteModal(false)}
        content={{
          title: `Please confirm`,
          message: `Are you sure you want to delete this entry?`
        }}
        popUpWarningType="danger"
        onConfirm={async () => {
          importToDelete && (await deleteImport(importToDelete));
        }}
      />
      <PopUpWarning
        isOpen={showUndoModal}
        toggleModal={() => setShowUndoModal(false)}
        content={{
          title: `Please confirm`,
          message: `Are you sure you want to undo this entry?`
        }}
        popUpWarningType="danger"
        onConfirm={async () => {
          importToUndo && (await undoImport(importToUndo));
        }}
      />
      <Table
        {...info}
        headers={headers}
        rows={items}
        customRow={CustomRow}
      />
    </div>
  );

}

HistoryTable.propTypes = {
  configs: PropTypes.array.isRequired,
  deleteImport: PropTypes.func,
  undoImport: PropTypes.func
};

export default HistoryTable;

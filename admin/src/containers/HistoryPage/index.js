/**
 *
 *
 * HistoryPage
 *
 */

import React, { useEffect, useState } from "react";
import {
  HeaderNav,
  LoadingIndicator,
  PluginHeader,
  request
} from "strapi-helper-plugin";

import pluginId from "../../pluginId";
import Row from "../../components/Row";
import Block from "../../components/Block";

import HistoryTable from "../../components/HistoryTable";


const getUrl = to =>
  to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`;

const HistoryPage = () => {

  const [isLoading, setIsLoading] = useState(false)
  const [importConfigs, setImportConfigs ] = useState([])

  let fetchInterval = null

  useEffect(() => {
    getConfigs().then(res => {
      setImportConfigs(res)
      setIsLoading(false)
    });
    setTimeout(() => {
      fetchInterval = setInterval(() => getImportConfigs(), 4000);
    }, 200);
    return function cleanup() {
      clearInterval(fetchInterval)
    }
  }, [] )

  const getConfigs = async () => {
    try {
      const response = await request("/import-content", { method: "GET" });
      return response;
    } catch (e) {
      strapi.notification.error(`${e}`);
      return [];
    }
  };

  const getImportConfigs = () => {
    if (!isLoading) {
      getConfigs().then(res => {
        setImportConfigs(res)
      });
    }
  }

  const deleteImport = async id => {
    setIsLoading(true)

    try {
      await request(`/import-content/${id}`, { method: "DELETE" });
      setImportConfigs(importConfigs.filter(imp => imp.id !== id))
      setIsLoading(false)
      strapi.notification.success(`Deleted`);
    } catch (e) {
      setIsLoading(false)
      strapi.notification.error(`${e}`);
      strapi.notification.error(`Delete Failed`);
    }
  };

  const undoImport = async id => {
    setIsLoading(true)

    await request(`/import-content/${id}/undo`, { method: "POST" });
    setIsLoading(false)

    strapi.notification.info(`Undo Started`);

};

  return (
    <div className={"container-fluid"} style={{ padding: "18px 30px" }}>
      <PluginHeader
        title={"Import Content"}
        description={"Import CSV and RSS-Feed into your Content Types"}
      />
      <HeaderNav
          links={[
            {
              name: "Import Data",
              to: getUrl("")
            },
            {
              name: "Import History",
              to: getUrl("history")
            }
          ]}
          style={{ marginTop: "4.4rem" }}
      />
      <div className="row">
 		   <Block
          title="General"
          description="Manage the Initiated Imports"
          style={{ marginBottom: 12 }}
        >
          {isLoading && <LoadingIndicator />}
          {!isLoading && importConfigs && (
            <Row className={"row"}>
              <HistoryTable
                undoImport={undoImport}
                deleteImport={deleteImport}
                configs={importConfigs}
              />
            </Row>
          )}
        </Block>
      </div>
    </div>
  );

}

export default HistoryPage;

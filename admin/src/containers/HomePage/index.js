/**
 *
 * HomePage
 *
 */

import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

import {
  HeaderNav,
  LoadingIndicator,
  PluginHeader,
  request
} from "strapi-helper-plugin";
import { Button, Select, Label } from "@buffetjs/core";
import { get, has, isEmpty, pickBy, set } from "lodash";

import Row from "../../components/Row";
import Block from "../../components/Block";
import UploadFileForm from "../../components/UploadFileForm";
import ExternalUrlForm from "../../components/ExternalUrlForm";
import RawInputForm from "../../components/RawInputForm";
import MappingTable from "../../components/MappingTable";

const getUrl = (to) =>
  to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`;


const HomePage = () => {

  const importSources = [
    { label: "External URL ", value: "url" },
    { label: "Upload file", value: "upload" },
    { label: "Raw text", value: "raw" }
  ];

  const [isLoading, setIsLoading] = useState(true)
  const [modelOptions, setModelOptions] = useState([])
  const [models, setModels] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [importSource, setImportSource] = useState("upload")
  const [analysis, setAnalysis] = useState(null)
  const [analysisConfig, setAnalysisConfig] = useState({})
  const [selectedContentType, setSelectedContentType] = useState("")
  const [fieldMapping, setFieldMapping] = useState({})

  useEffect(() => {
    getModels().then(res => {
      const { modelsFound, modelOptionsFound } = res;
      //console.log(modelsFound, modelOptionsFound)
      setModels(modelsFound)
      setModelOptions(modelOptionsFound)
      setSelectedContentType(modelOptionsFound ? modelOptionsFound[0].value : "")
    })
  }, [])

  const onSaveImport = async () => {
    setIsSaving(true)
    const importConfig = {
      ...analysisConfig,
      contentType: selectedContentType,
      fieldMapping
    };
    console.log("onSaveImport config", importConfig)
    try {
      await request("/import-content", { method: "POST", body: importConfig });
      setIsSaving(false)
      strapi.notification.toggle({ type: "info", message: "Import started" });
    } catch (e) {
      strapi.notification.toggle({ type: "error", message: `${e}` });
    }
  };

  const getModels = async () => {
    setIsLoading(true);
    try {
	    const response = await request("/content-type-builder/content-types", {
        method: "GET"
      });

      // Remove non-user content types from models
      const modelsFound = get(response, ["data"], []).filter(
        obj => !has(obj, "plugin")
      );
      const modelOptionsFound = modelsFound.map(model => {
        return {
          label: get(model, ["schema", "name"], ""), // (name is used for display_name)
          value: model.uid // (uid is used for table creations)
        };
      });

      setIsLoading(false);

      return { modelsFound, modelOptionsFound };
    } catch (e) {
      setIsLoading(false)
      strapi.notification.toggle({ type: 'error', message: `${e}` });
    }
    return [];
  };

  const onRequestAnalysis = async (config) => {
    setIsAnalyzing(true)
    setAnalysisConfig(config)
    try {
      const response = await request("/import-content/preAnalyzeImportFile", {
        method: "POST",
        body: config
      });
      setAnalysis(response)
      setIsAnalyzing(false)
      strapi.notification.toggle({ type: 'success', message: `Analyzed Successfully` });
    } catch (e) {
      setIsAnalyzing(false)
      strapi.notification.toggle({ type: 'error', message: `Analyze Failed, try again` });
      strapi.notification.toggle({ type: 'error', message: `${e}` });
    }
  };

  const selectImportSource = (importSource) => {
    setImportSource(importSource);
  };

  const selectImportDestination = (selectedContentType) => {
    setSelectedContentType(selectedContentType);
  };

  const getTargetModel = () => {
    if (!models) return null;
    return models.find(model => model.uid === selectedContentType);
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
          description="Configure the Import Source & Destination"
          style={{ marginBottom: 12 }}
        >
          <Row className={"row"}>
            <div className={"col-4"}>
              <Label htmlFor="importSource">Import Source</Label>
              <Select
                name="importSource"
                options={importSources}
                value={importSource}
                onChange={({ target: { value } }) =>
                  selectImportSource(value)
                }
              />
            </div>
            <div className={"col-4"}>
              <Label htmlFor="importDest">Import Destination</Label>
              <Select
                value={selectedContentType}
                name="importDest"
                options={modelOptions}
                onChange={({ target: { value } }) =>
                  selectImportDestination(value)
                }
              />
            </div>
          </Row>
			    <Row>
            {importSource === "upload" && (
              <UploadFileForm
                onRequestAnalysis={onRequestAnalysis}
                loadingAnalysis={isAnalyzing}
              />
            )}
            {importSource === "url" && (
              <ExternalUrlForm
                onRequestAnalysis={onRequestAnalysis}
                loadingAnalysis={isAnalyzing}
              />
            )}
            {importSource === "raw" && (
              <RawInputForm
                onRequestAnalysis={onRequestAnalysis}
                loadingAnalysis={isAnalyzing}
              />
            )}
          </Row>
        </Block>
      </div>
      {analysis && (
        <Row className="row">
          <MappingTable
            analysis={analysis}
            targetModel={getTargetModel()}
            handleChange={setFieldMapping}
          />
          <Button
            style={{ marginTop: 12 }}
            label={"Run the Import"}
            onClick={onSaveImport}
          />
        </Row>
      )}
    </div>
  )
}

export default memo(HomePage)

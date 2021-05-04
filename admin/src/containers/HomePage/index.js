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
import { Button, Checkbox, Select, Text, Label } from "@buffetjs/core";
import { Fail, Success } from "@buffetjs/icons"
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
  const [localeOptions, setLocaleOptions] = useState([])
  const [locales, setLocales] = useState([])
  const [saveAsDraft, setSaveAsDraft] = useState(true)
  const [targetModel, setTargetModel] = useState()
  const [hasWorkflow, setHasWorkflow] = useState(false)
  const [defaultLocale, setDefaultLocale] = useState("en")
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
      // console.log('modelsFound, modelOptionsFound', modelsFound, modelOptionsFound)
      setModels(modelsFound)
      setModelOptions(modelOptionsFound)
      setTargetModel(modelsFound[0])
      setSelectedContentType(modelOptionsFound[0]?.value)
      setHasWorkflow(modelOptionsFound[0]?.workflow)
    })
  }, [])

  useEffect(() => {
    setTargetModel(models.find(model => 
      model.uid === selectedContentType
    ))
    setHasWorkflow(!!modelOptions.find(model => 
      model.value === selectedContentType && model.workflow
    ))
  }, [selectedContentType])

  useEffect(() => {
    getLocales().then(res => {
      const { localesFound, localeOptionsFound } = res;
      setLocales(localesFound)
      setLocaleOptions(localeOptionsFound)
      setDefaultLocale(localeOptionsFound.filter(locale => locale.default))
    })
  }, [])

  const onSaveImport = async () => {
    setIsSaving(true)
    const importConfig = {
      ...analysisConfig,
      contentType: selectedContentType,
      fieldMapping,
      options: { saveAsDraft, locales: localeOptions }
    };
    // console.log("onSaveImport config", importConfig)
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
          value: model.uid, // (uid is used for table creations)
          workflow: model.schema?.draftAndPublish,
          localized: model.schema?.pluginOptions?.i18n?.localized,
        };
      });

      setIsLoading(false);

      // console.log('modelsFound', modelsFound, 'vs models', models)

      return { modelsFound, modelOptionsFound };
    } catch (e) {
      setIsLoading(false)
      strapi.notification.toggle({ type: 'error', message: `${e}` });
    }
    return [];
  };

  const getLocales = async () => {
    setIsLoading(true);
    try {
	    const localesFound = await request("/i18n/locales", {
        method: "GET"
      });
      const localeOptionsFound = localesFound.map(locale => {
        return {
          label: locale.name,
          value: locale.code,
          default: locale.isDefault
        };
      });

      setIsLoading(false);

      return { localesFound, localeOptionsFound };
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
          description="Configure the Import Source &amp; Destination"
          style={{ marginBottom: 12 }}
        >
          <Row className={"row"}>
            <div className={"col-3"}>
              <Label htmlFor="importSource">Import Source</Label>
              <Select
                name="importSource"
                options={importSources}
                value={importSource}
                onChange={({ target: { value } }) =>
                  setImportSource(value)
                }
              />
            </div>
            <div className={"col-3"}>
              <Label htmlFor="importDest">Import Destination</Label>
              <Select
                value={selectedContentType}
                name="importDest"
                options={modelOptions}
                onChange={({ target: { value } }) =>
                  setSelectedContentType(value)
                }
              />
            </div>
            <div className={"col-3"}>
              <Label htmlFor="locales">Active Locales</Label>
              {localeOptions.map(locale => <Text key={`locale_${locale.value}`}>
                {locale.label}
                {locale.default && <Success fill="green"/>}
              </Text>)}
            </div>
            { selectedContentType && (
              <div className={"col-3"}>
                <Label htmlFor="workflow">Workflow enabled {
                  hasWorkflow ? <Success fill="green" /> : <Fail color="silver" /> 
                }
                </Label>
                { hasWorkflow && 
                  <Checkbox
                    message="Save imported items as Draft"
                    name="saveAsDraft"
                    value={saveAsDraft} onChange={e => setSaveAsDraft(e.target.value)} />
                }
              </div>
            )}
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
            targetModel={targetModel}
            handleChange={setFieldMapping}
            options={{
              locales: localeOptions,
              models,
              saveAsDraft
            }}
          />
          <Button
            style={{ marginTop: 12 }}
            label={"Run the Import"}
            onClick={onSaveImport}
            isLoading={isLoading}
          />
        </Row>
      )}
    </div>
  )
}

export default HomePage

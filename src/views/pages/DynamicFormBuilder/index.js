import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Select, Switch, Drawer, Row, Col, message } from 'antd';
import DynamicForm from '../DynamicForm';
import { widgetConfigs } from './widgets';
// import JSONInput from 'react-json-editor-ajrm';
// import locale from 'react-json-editor-ajrm/locale/en';
import { supabase } from 'api/supabaseClient';
// import { QueryFilter } from './QueryBuilder';
// import { QueryFilter } from './QueryBuilderStatic';
import AceEditor from 'react-ace';
import "ace-builds/webpack-resolver";
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai'; // Choose your preferred theme
import 'ace-builds/src-noconflict/mode-json'; // For JSON mode
import 'ace-builds/src-noconflict/worker-json'; // Import the JSON worker

const FormBuilder = ({ masterObjectInit }) => {


  console.log("mod", masterObjectInit);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [dataConfig, setDataConfig] = useState([])
  const [editItem, setEditItem] = useState({})
  const [dataSchema, setDataSchema] = useState({
    type: "object",
    properties: {},
    required: [],
  });
  const [uiSchema, setUiSchema] = useState({});
  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState({
    title: "",
    description: "",
    fieldName: '',
    fieldType: 'text',
    uiOrder: '0',
    required: false,
    readonly: false,
    hidden: false,
    options: [],
    placeholder: '',
    lookupTable: '',
    lookupColumn: '',
    acceptedFileTypes: '.pdf'
  });
  const currentConfig = widgetConfigs[fieldInput.fieldType];
  const showOptions = currentConfig?.requiresOptions;
  const showFileOptions = currentConfig?.hasFileOptions;
  // let showLookup = currentConfig?.requiresLookup;
  const [showLookup, setShowLookup] = useState(currentConfig?.requiresLookup)

  const handleFieldChange = (key, value) => {
    setFieldInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFieldNameChange = (value) => {
    // setFieldInput(prev => ({
    //   ...prev,
    //   fieldName: value
    // }));

    if (masterObjectInit) {
      const selectedField = masterObjectInit?.find(item => item.key === value);
      console.log("sfd", selectedField);
      setDataConfig(prevConfig => {
        const updatedConfig = prevConfig?.filter(item => item.key !== fieldInput.fieldName); // Use fieldInput.fieldName
        if (selectedField) {
          return [...updatedConfig, selectedField];
        }
        return updatedConfig; // Return the filtered array if no selected field is found
      });
      // Update lookup table and column based on selected field
      if (selectedField && selectedField?.foreign_key) {
        setFieldInput(prev => ({
          ...prev,
          fieldName: value,
          fieldType: "SelectMulti",
          lookupTable: selectedField?.foreign_key?.source_table,
          lookupColumn: selectedField?.foreign_key?.display_column
        }));
        setShowLookup(true)
      } else {
        setFieldInput(prev => ({
          ...prev,
          fieldName: value,
          lookupTable: '',
          lookupColumn: ''
        }));
        setShowLookup(false)
      }
    }
  };

  const handleAddField = () => {
    if (!fieldInput.fieldName.trim()) {
      message.error("Enter Field Name");
      return;
    }
    if (showLookup && !(fieldInput.lookupTable && fieldInput.lookupColumn)) {
      message.error("Enter LookUp Details");
      return;
    }
    fieldInput.fieldTitle = fieldInput?.fieldName
    fieldInput.fieldName = fieldInput?.fieldName?.trim()?.replaceAll(" ", "_")//?.toLowerCase();
    const newField = {
      ...fieldInput,
      uiOrder: parseInt(fieldInput.uiOrder),
      options: fieldInput.options.length ? fieldInput.options : undefined,
      lookupTable: fieldInput.lookupTable || undefined,
      lookupColumn: fieldInput.lookupColumn || undefined,
      // title: fieldInput?.title || "",
      // description: fieldInput?.description || ""
    };

    setFields(prev => [...prev, newField]);
    updateSchemas([...fields, newField]);

    setFieldInput({
      title: fieldInput?.title || "",
      description: fieldInput?.description || "",
      fieldName: '',
      fieldType: 'text',
      uiOrder: String(fields.length + 1),
      required: false,
      readonly: false,
      hidden: false,
      options: [],
      placeholder: '',
      lookupTable: '',
      lookupColumn: '',
      acceptedFileTypes: '.pdf'
    });

    // const updatedSchemas = generateSchemas([...fields, newField]);
    // setDataSchema(updatedSchemas.data_schema);
    // setUiSchema(updatedSchemas.ui_schema);
  };

  // const generateSchemas = () => {
  //   const dataSchema = {
  //     type: "object",
  //     title: fieldInput?.title,
  //     description: fieldInput?.description,
  //     required: [],
  //     properties: {}
  //   };

  //   const uiSchema = {};

  //   fields.forEach(field => {
  //     const config = widgetConfigs[field.fieldType];
  //     if (!config) return;

  //     // Build data schema
  //     const fieldDataSchema = { ...config.dataSchema, title: field.fieldName };

  //     // Handle enums and lookups
  //     if (config.requiresOptions && field.options?.length) {
  //       fieldDataSchema.enum = field.options;
  //     } else if (config.requiresLookup && field.lookupTable && field.lookupColumn) {
  //       fieldDataSchema.enum = {
  //         table: field.lookupTable,
  //         column: field.lookupColumn
  //       };
  //     }

  //     dataSchema.properties[field.fieldName] = fieldDataSchema;

  //     // Build UI schema
  //     const fieldUiSchema = { ...config.uiSchema };

  //     if (field.placeholder) {
  //       fieldUiSchema["ui:placeholder"] = field.placeholder;
  //     }

  //     if (config.hasFileOptions && field.acceptedFileTypes) {
  //       fieldUiSchema["ui:options"] = {
  //         ...fieldUiSchema["ui:options"],
  //         accept: field.acceptedFileTypes
  //       };
  //     }

  //     fieldUiSchema["ui:order"] = field.uiOrder;
  //     uiSchema[field.fieldName] = fieldUiSchema;

  //     if (field.required) {
  //       dataSchema.required.push(field.fieldName);
  //     }
  //   });

  //   return { data_schema: dataSchema, ui_schema: uiSchema };
  // };

  // const schemas = generateSchemas();

  const updateSchemas = (updatedFields) => {
    const newDataSchema = {
      type: "object",
      title: fieldInput?.title,
      description: fieldInput?.description,
      required: [],
      properties: {},
      definitions: {}
    };
    const newUiSchema = {
      "ui:submitButtonOptions": {
        "props": {
          "disabled": false,
          "className": "ant-btn-variant-solid ant-btn-block"
        },
        "norender": false,
        "submitText": "Save"
      }
    };
    // "className": "ant-btn css-dev-only-do-not-override-1stfoss ant-btn-submit ant-btn-primary ant-btn-color-primary ant-btn-variant-solid ant-btn-block"

    const gridStructure = []; // Array for building ui:grid structure
    const orderMap = {}; // Map to group fields by ui:order

    // Sort fields by uiOrder
    const sortedFields = [...updatedFields]?.sort((a, b) => a.uiOrder - b.uiOrder);

    sortedFields?.forEach(field => {
      const config = widgetConfigs[field.fieldType];
      if (!config) return;

      // Handle enums and lookups
      const fieldDataSchema = { ...config.dataSchema, title: field.fieldTitle };

      if (config.requiresOptions && field.options?.length) {
        fieldDataSchema.enum = field.options;
      } else if (config.requiresLookup && field.lookupTable && field.lookupColumn) {
        fieldDataSchema.enum = {
          table: field.lookupTable,
          column: field.lookupColumn,
        };
      }

      // Merge definitions if available
      if (config.dataSchema.definitions) {
        newDataSchema.definitions = {
          ...newDataSchema.definitions,
          ...config.dataSchema.definitions
        };
        delete fieldDataSchema.definitions; // Remove definitions from the field object
      }
      // delete config.dataSchema.definitions

      newDataSchema.properties[field.fieldName] = fieldDataSchema;
      if (field.required) {
        newDataSchema.required.push(field.fieldName);
      }

      const fieldUiSchema = { ...config.uiSchema };
      if (field.placeholder) {
        fieldUiSchema["ui:placeholder"] = field.placeholder;
      }
      if (config.hasFileOptions && field.acceptedFileTypes) {
        fieldUiSchema["ui:options"] = {
          ...fieldUiSchema["ui:options"],
          accept: field.acceptedFileTypes
        };
      }
      if (field.readonly) {
        fieldUiSchema["ui:readonly"] = true;
      }
      if (field.hidden) {
        fieldUiSchema["ui:widget"] = "hidden";
      }
      fieldUiSchema["ui:order"] = field.uiOrder;
      newUiSchema[field.fieldName] = fieldUiSchema;

      if (!orderMap[field.uiOrder]) {
        orderMap[field.uiOrder] = [];
      }
      orderMap[field.uiOrder].push(field.fieldName);
    });

    // Build ui:grid with a total of 24 for each index
    Object.keys(orderMap).sort((a, b) => a - b).forEach(order => {
      const fieldsInOrder = orderMap[order];
      const rowObject = {};
      const fieldCount = fieldsInOrder.length;
      const baseWidth = Math.floor(24 / fieldCount);
      let remainingWidth = 24;

      fieldsInOrder.forEach((fieldName, index) => {
        const width = index === fieldCount - 1 ? remainingWidth : baseWidth;
        rowObject[fieldName] = width;
        remainingWidth -= width;
      });

      gridStructure.push(rowObject);
    });

    newUiSchema["ui:grid"] = gridStructure;

    // Add ui:order property based on sorted field names
    newUiSchema["ui:order"] = sortedFields.map(field => field.fieldName);

    setDataSchema(newDataSchema);
    setUiSchema(newUiSchema);
  };

  useEffect(() => {
    updateSchemas(fields);
  }, [fields]);

  const onFinish = (values) => {
    console.log("Form Data", values);
    //  setIsDrawerVisible(false)
    const payload = {
      data_schema: dataSchema,
      ui_schema: uiSchema,
      data_config: dataConfig,
    }
    if (editItem) {
      console.log("Update Schema Payload", payload);
    } else {
      console.log("Create Schema Payload", payload);
    }
  }

  // Fetch forms from Supabase
  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('id, name, data_schema, ui_schema, data_config');
      if (error) throw error;
      setForms(data);
    } catch (error) {
      message.error(`Error fetching forms: ${error.message}`);
    }
  };

  // Handle form selection
  const handleFormChange = (formId) => {
    const form = forms?.find((form) => form?.id === formId);
    if (form) {
      setSelectedForm(formId);
      setEditItem(form)
      setDataSchema(form?.data_schema);
      setDataConfig(form?.data_config);
      setUiSchema(form?.ui_schema);
      console.log("ccc", form);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const initData = {
    "details2.companyname": "TDD",
    "details2.web": "gdgdgdrgd"
  }

  return (<div className="space-y-6">
    {/* <QueryFilter /> */}
    <Row gutter={16}>
      <Col span={8}>
        <Row gutter={4}>
          <Col span={12}>
            <Input placeholder="Title" value={fieldInput?.title}
              onChange={(e) => handleFieldChange('title', e.target.value)} />
          </Col>
          <Col span={12}>
            <Input placeholder="Description" value={fieldInput?.description}
              onChange={(e) => handleFieldChange('description', e.target.value)} />
          </Col>
        </Row>
        <Card title="Add Form Field">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Row gutter={4}>
                <Col span={12}>
                  {/* <Input placeholder="Field Name" value={fieldInput?.fieldName}
                    onChange={(e) => handleFieldChange('fieldName', e.target.value)} /> */}
                  {masterObjectInit ? ( // Conditional rendering for fieldName input
                    <Select
                      showSearch
                      style={{ width: '100%' }}
                      placeholder="Select Field Name"
                      optionFilterProp="children"
                      onChange={handleFieldNameChange}
                      value={fieldInput.fieldName}
                    >
                      {masterObjectInit?.map(item => (
                        <Select.Option key={item.key} value={item.key}>
                          {item.key}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      placeholder="Field Name"
                      value={fieldInput?.fieldName}
                      onChange={(e) => handleFieldChange('fieldName', e.target.value)}
                    />
                  )}
                </Col>
                <Col span={12}>
                  <Select style={{ width: "100%" }} value={fieldInput?.fieldType} placeholder="Select type"
                    onChange={(value) => handleFieldChange('fieldType', value)} >
                    {Object.keys(widgetConfigs)?.map(type => (
                      <Select.Option key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Row gutter={4} className='mt-2'>
                <Col span={6}>
                  <Input type="number" placeholder="UI Order" value={fieldInput?.uiOrder}
                    onChange={(e) => handleFieldChange('uiOrder', e.target.value)} />
                </Col>
                <Col span={6}>
                  {/* <div className="flex items-center gap-2 col-span-2"> */}
                  <Switch checked={fieldInput?.required}
                    onChange={(checked) => handleFieldChange('required', checked)} />
                  <label>Req</label>
                  {/* </div> */}
                </Col>
                <Col span={6}>
                  <Switch
                    checked={fieldInput?.readonly}
                    onChange={(checked) => handleFieldChange('readonly', checked)}
                  />
                  <label>Readonly</label>
                </Col>
                <Col span={6}>
                  <Switch
                    checked={fieldInput?.hidden}
                    onChange={(checked) => handleFieldChange('hidden', checked)}
                  />
                  <label>Hidden</label>
                </Col>
              </Row>

              <Input className='mt-2' placeholder="Placeholder Text" value={fieldInput?.placeholder}
                onChange={(e) => handleFieldChange('placeholder', e.target.value)} />

              {showOptions && (
                <Input.TextArea className='mt-2' placeholder="Enter options (comma-separated)" rows={3}
                  // value={fieldInput?.options?.join(', ')}
                  onChange={(e) => handleFieldChange('options', e.target.value.split(',').map(opt => opt.trim()).filter(Boolean))}
                />
              )}

              {showLookup && (
                <Row gutter={4} className='mt-2'>
                  <Col span={12}>
                    <Input placeholder="Lookup Table" value={fieldInput?.lookupTable}
                      onChange={(e) => handleFieldChange('lookupTable', e.target.value)} />
                  </Col>
                  <Col span={12}>
                    <Input placeholder="Lookup Column" value={fieldInput?.lookupColumn}
                      onChange={(e) => handleFieldChange('lookupColumn', e.target.value)} />
                  </Col>
                </Row>
              )}
              {showFileOptions && (
                <Input className='mt-2' placeholder="Accepted File Types" value={fieldInput?.acceptedFileTypes}
                  onChange={(e) => handleFieldChange('acceptedFileTypes', e.target.value)} />
              )}
            </div>
            <Button onClick={handleAddField} type="primary" block className='mt-2'>
              Add Field
            </Button>
          </div>
        </Card>

        <Card title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Fields</span>
            <Select className='ml-1 mr-1'
              style={{ width: '100%' }}
              placeholder="Select a form"
              onChange={handleFormChange}
              value={selectedForm}
            >
              {forms.map((form) => (
                <Select.Option key={form.id} value={form.id}>
                  {form.name}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={() => setIsDrawerVisible(true)} type="primary">
              Show Form
            </Button>
          </div>
        } >
          <div className="space-y-2">
            {fields?.map((field, index) => (
              <div key={index} className="flex justify-between items-center p-1 bg-slate-50 rounded">
                <div className="flex gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-medium">{field.fieldName} ( {field.fieldType} , {field.uiOrder} ) </span>
                  <Button danger size="small" onClick={() => setFields(prev => prev.filter((_, i) => i !== index))} >
                    X
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <AceEditor
          mode="json"
          theme="monokai"
          value={JSON.stringify(dataConfig, null, 2)}
          onChange={(value) => {
            try {
              const parsedSchema = JSON.parse(value);
              setDataConfig(parsedSchema);
            } catch (error) {
              message.error("Invalid JSON in Data Config");
            }
          }}
          editorProps={{ $blockScrolling: true }} // Prevents console error
          setOptions={{
            tabSize: 2,
            useSoftTabs: true,
          }}
          style={{ width: "100%", height: "200px" }}
        />
      </Col>
      <Col span={16}>

        <Card title="">
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <h3 className="font-medium mb-1">Data Schema:</h3>
              <pre className="bg-slate-50 p-2 rounded overflow-auto max-h-96">
                {/* {JSON.stringify(schemas?.data_schema, null, 2)} */}
                {/* <JSONInput waitAfterKeyPress={5000} style={{ body: { fontSize: '14px' } }} id="data_schema_editor" locale={locale} height="600px" width="100%"
                  onChange={(e) => e.jsObject && setDataSchema(e.jsObject)} placeholder={dataSchema} // placeholder={schemas?.data_schema}
                /> */}
                <AceEditor
                  mode="json"
                  theme="monokai"
                  value={JSON.stringify(dataSchema, null, 2)} // Use stringified schema
                  onChange={(value) => {
                    try {
                      const parsedSchema = JSON.parse(value);
                      setDataSchema(parsedSchema);
                    } catch (error) {
                      message.error("Invalid JSON in Data Schema");
                    }
                  }}
                  editorProps={{ $blockScrolling: true }} // Prevents console error
                  setOptions={{
                    tabSize: 2,
                    useSoftTabs: true,
                  }}
                  style={{ width: "100%", height: "600px" }} // Set width and height
                />
              </pre>
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="font-medium mb-1">UI Schema:</h3>
              <pre className="bg-slate-50 p-2 rounded overflow-auto max-h-96">
                {/* {JSON.stringify(schemas?.ui_schema, null, 2)} */}
                {/* <JSONInput waitAfterKeyPress={5000} style={{ body: { fontSize: '14px' } }} id="ui_schema_editor" locale={locale} height="600px" width="100%"
                  onChange={(e) => e.jsObject && setUiSchema(e.jsObject)} placeholder={uiSchema} // placeholder={schemas?.ui_schema}
                /> */}
                <AceEditor
                  mode="json"
                  theme="monokai"
                  value={JSON.stringify(uiSchema, null, 2)} // Use stringified schema
                  onChange={(value) => {
                    try {
                      const parsedSchema = JSON.parse(value);
                      setUiSchema(parsedSchema);
                    } catch (error) {
                      message.error("Invalid JSON in UI Schema");
                    }
                  }}
                  editorProps={{ $blockScrolling: true }} // Prevents console error
                  setOptions={{
                    tabSize: 2,
                    useSoftTabs: true,
                  }}
                  style={{ width: "100%", height: "600px" }} // Set width and height
                />
              </pre>
            </div>
          </div>
        </Card>
      </Col>
    </Row>

    <Drawer width="50%" title={'Form Fields'} visible={isDrawerVisible} onClose={() => setIsDrawerVisible(false)} footer={null} >
      <DynamicForm initialFormData={initData} schemas={{ data_schema: dataSchema, ui_schema: uiSchema, data_config: dataConfig }} onFinish={onFinish}
      // schemas={schemas}
      />
    </Drawer>
  </div>
  )
};

export default FormBuilder;

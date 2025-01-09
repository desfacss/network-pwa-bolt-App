import React, { useState } from 'react';
import { Card, Button, Input, Select, Switch, Drawer, Row, Col } from 'antd';
import DynamicForm from '../DynamicForm';
import { widgetConfigs } from './widgets';

const FormBuilder = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState({
    title: "",
    description: "",
    fieldName: '',
    fieldType: 'text',
    uiOrder: '0',
    required: false,
    options: [],
    placeholder: '',
    lookupTable: '',
    lookupColumn: '',
    acceptedFileTypes: '.pdf'
  });

  const handleFieldChange = (key, value) => {
    setFieldInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddField = () => {
    if (!fieldInput.fieldName.trim()) {
      return;
    }

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

    // Reset form
    setFieldInput({
      title: fieldInput?.title || "",
      description: fieldInput?.description || "",
      fieldName: '',
      fieldType: 'text',
      uiOrder: String(fields.length + 1),
      required: false,
      options: [],
      placeholder: '',
      lookupTable: '',
      lookupColumn: '',
      acceptedFileTypes: '.pdf'
    });
  };

  const generateSchemas = () => {
    const dataSchema = {
      type: "object",
      title: fieldInput?.title,
      description: fieldInput?.description,
      required: [],
      properties: {}
    };

    const uiSchema = {};

    fields.forEach(field => {
      const config = widgetConfigs[field.fieldType];
      if (!config) return;

      // Build data schema
      const fieldDataSchema = { ...config.dataSchema, title: field.fieldName };

      // Handle enums and lookups
      if (config.requiresOptions && field.options?.length) {
        fieldDataSchema.enum = field.options;
      } else if (config.requiresLookup && field.lookupTable && field.lookupColumn) {
        fieldDataSchema.enum = {
          table: field.lookupTable,
          column: field.lookupColumn
        };
      }

      dataSchema.properties[field.fieldName] = fieldDataSchema;

      // Build UI schema
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

      fieldUiSchema["ui:order"] = field.uiOrder;
      uiSchema[field.fieldName] = fieldUiSchema;

      if (field.required) {
        dataSchema.required.push(field.fieldName);
      }
    });

    return { data_schema: dataSchema, ui_schema: uiSchema };
  };

  const currentConfig = widgetConfigs[fieldInput.fieldType];
  const showOptions = currentConfig?.requiresOptions;
  const showLookup = currentConfig?.requiresLookup;
  const showFileOptions = currentConfig?.hasFileOptions;

  const schemas = generateSchemas();

  return (<div className="space-y-6">
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
                  <Input placeholder="Field Name" value={fieldInput?.fieldName}
                    onChange={(e) => handleFieldChange('fieldName', e.target.value)} />
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
                <Col span={12}>
                  <Input type="number" placeholder="UI Order" value={fieldInput?.uiOrder}
                    onChange={(e) => handleFieldChange('uiOrder', e.target.value)} />
                </Col>
                <Col span={12}>
                  {/* <div className="flex items-center gap-2 col-span-2"> */}
                  <Switch checked={fieldInput?.required}
                    onChange={(checked) => handleFieldChange('required', checked)} />
                  <label>Required</label>
                  {/* </div> */}
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
                <Input className='mt-2'
                  placeholder="Accepted File Types"
                  value={fieldInput?.acceptedFileTypes}
                  onChange={(e) => handleFieldChange('acceptedFileTypes', e.target.value)}
                />
              )}
            </div>
            <Button onClick={handleAddField} type="primary" block className='mt-2'>
              Add Field
            </Button>
          </div>
        </Card>

        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Current Fields</span>
              <Button onClick={() => setIsDrawerVisible(true)} type="primary">
                Show Form
              </Button>
            </div>
          }
        >
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                <div className="flex gap-4">
                  <span className="font-medium">{field.fieldName}</span>
                  <span className="text-slate-600">Type: {field.fieldType}</span>
                  <span className="text-slate-600">Order: {field.uiOrder}</span>
                  {field.required && (
                    <span className="text-red-500">Required</span>
                  )}
                  {field.options?.length > 0 && (
                    <span className="text-slate-600">Options: {field.options.join(', ')}</span>
                  )}
                </div>
                <Button danger size="small" onClick={() => setFields(prev => prev.filter((_, i) => i !== index))} >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </Col>
      <Col span={16}>

        <Card title="">
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <h3 className="font-medium mb-1">Data Schema:</h3>
              <pre className="bg-slate-50 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(schemas?.data_schema, null, 2)}
              </pre>
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="font-medium mb-1">UI Schema:</h3>
              <pre className="bg-slate-50 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(schemas?.ui_schema, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      </Col>
    </Row>

    <Drawer width="50%" title={'Form Fields'} visible={isDrawerVisible} onClose={() => setIsDrawerVisible(false)} footer={null} >
      {schemas && <DynamicForm schemas={schemas} />}
    </Drawer>
  </div>
  )
};

export default FormBuilder;

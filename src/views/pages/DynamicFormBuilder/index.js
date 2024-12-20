import React, { useState } from 'react';
// import { Card, Card.Header, Card.Title, Card.Content } from 'antd';
// import { Button, Card, notification, Tabs } from 'antd';
import { Card, Button, Input, Select, Switch } from 'antd';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, Select.SelectContent, Select.SelectItem, Select.SelectTrigger, Select.SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import { Input.Textarea } from '@/components/ui/Input.Textarea';

const widgetConfigs = {
  "text": {
    dataSchema: {
      type: "string",
    },
    uiSchema: {
      "ui:widget": "text",
      "ui:placeholder": "Enter text"
    },
    requiresOptions: false
  },
  "Input.Textarea": {
    dataSchema: {
      type: "string",
    },
    uiSchema: {
      "ui:widget": "Input.Textarea",
      "ui:placeholder": "Enter description"
    },
    requiresOptions: false
  },
  "select": {
    dataSchema: {
      type: "string",
      enum: []
    },
    uiSchema: {
      "ui:widget": "select",
      "ui:placeholder": "Select an option"
    },
    requiresOptions: true
  },
  "radio": {
    dataSchema: {
      type: "string",
      enum: []
    },
    uiSchema: {
      "ui:widget": "radio"
    },
    requiresOptions: true
  },
  "checkboxes": {
    dataSchema: {
      type: "array",
      items: {
        type: "string"
      }
    },
    uiSchema: {
      "ui:widget": "checkboxes"
    },
    requiresOptions: true
  },
  "date": {
    dataSchema: {
      type: "string",
      format: "date"
    },
    uiSchema: {
      "ui:widget": "date"
    },
    requiresOptions: false
  },
  "datetime": {
    dataSchema: {
      type: "string",
      format: "date-time"
    },
    uiSchema: {
      "ui:widget": "date-time"
    },
    requiresOptions: false
  },
  "datetime-range": {
    dataSchema: {
      type: "array",
      items: {
        type: "string",
        format: "date-time"
      }
    },
    uiSchema: {
      "ui:widget": "DateTimeRangePickerWidget"
    },
    requiresOptions: false
  },
  "file": {
    dataSchema: {
      type: "string",
      format: "data-url"
    },
    uiSchema: {
      "ui:widget": "file",
      "ui:options": {
        "accept": ".pdf"
      }
    },
    requiresOptions: false,
    hasFileOptions: true
  },
  "hidden": {
    dataSchema: {
      type: "string"
    },
    uiSchema: {
      "ui:widget": "hidden"
    },
    requiresOptions: false
  },
  "readonly-datetime": {
    dataSchema: {
      type: "string",
      format: "date-time",
      readOnly: true
    },
    uiSchema: {
      "ui:widget": "date-time",
      "ui:readonly": true
    },
    requiresOptions: false
  },
  "lookup-select": {
    dataSchema: {
      type: "string",
      enum: {
        table: "",
        column: ""
      }
    },
    uiSchema: {
      "ui:widget": "select",
      "ui:placeholder": "Select from lookup"
    },
    requiresLookup: true
  }
};

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState({
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
      lookupColumn: fieldInput.lookupColumn || undefined
    };

    setFields(prev => [...prev, newField]);

    // Reset form
    setFieldInput({
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

    return { dataSchema, uiSchema };
  };

  const currentConfig = widgetConfigs[fieldInput.fieldType];
  const showOptions = currentConfig?.requiresOptions;
  const showLookup = currentConfig?.requiresLookup;
  const showFileOptions = currentConfig?.hasFileOptions;

  const { dataSchema, uiSchema } = generateSchemas();

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Add Form Field</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Field Name"
                value={fieldInput.fieldName}
                onChange={(e) => handleFieldChange('fieldName', e.target.value)}
              />
              
              <Select
                value={fieldInput.fieldType}
                onValueChange={(value) => handleFieldChange('fieldType', value)}
              >
                <Select.SelectTrigger>
                  <Select.SelectValue placeholder="Select type" />
                </Select.SelectTrigger>
                <Select.SelectContent>
                  {Object.keys(widgetConfigs).map(type => (
                    <Select.SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Select.SelectItem>
                  ))}
                </Select.SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="UI Order"
                value={fieldInput.uiOrder}
                onChange={(e) => handleFieldChange('uiOrder', e.target.value)}
              />

              <Input
                placeholder="Placeholder Text"
                value={fieldInput.placeholder}
                onChange={(e) => handleFieldChange('placeholder', e.target.value)}
              />

              {showOptions && (
                <Input.Textarea
                  placeholder="Enter options (comma-separated)"
                  value={fieldInput.options.join(', ')}
                  onChange={(e) => handleFieldChange('options', e.target.value.split(',').map(opt => opt.trim()).filter(Boolean))}
                  className="col-span-2"
                />
              )}

              {showLookup && (
                <>
                  <Input
                    placeholder="Lookup Table"
                    value={fieldInput.lookupTable}
                    onChange={(e) => handleFieldChange('lookupTable', e.target.value)}
                  />
                  <Input
                    placeholder="Lookup Column"
                    value={fieldInput.lookupColumn}
                    onChange={(e) => handleFieldChange('lookupColumn', e.target.value)}
                  />
                </>
              )}

              {showFileOptions && (
                <Input
                  placeholder="Accepted File Types"
                  value={fieldInput.acceptedFileTypes}
                  onChange={(e) => handleFieldChange('acceptedFileTypes', e.target.value)}
                />
              )}

              <div className="flex items-center gap-2 col-span-2">
                <Switch
                  id="required"
                  checked={fieldInput.required}
                  onCheckedChange={(checked) => handleFieldChange('required', checked)}
                />
                <label htmlFor="required">Required Field</label>
              </div>
            </div>

            <Button onClick={handleAddField} className="w-full">
              Add Field
            </Button>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Current Fields</Card.Title>
        </Card.Header>
        <Card.Content>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setFields(prev => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Generated Schema</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Data Schema:</h3>
              <pre className="bg-slate-50 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(dataSchema, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">UI Schema:</h3>
              <pre className="bg-slate-50 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(uiSchema, null, 2)}
              </pre>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default FormBuilder;

export const widgetConfigs = {
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
    "Textarea": {
        dataSchema: {
            type: "string",
        },
        uiSchema: {
            "ui:widget": "textarea",
        },
        requiresOptions: false
    },
    "Number": {
        dataSchema: {
            type: "number",
        },
        uiSchema: {
            "ui:widget": "updown",
        }
    },
    "Phone": {
        dataSchema: {
            type: "string",
        },
        uiSchema: {
            "ui:options": {
                "inputType": "tel"
            }
        }
    },
    "Password": {
        dataSchema: {
            type: "string",
        },
        uiSchema: {
            "ui:widget": "password",
        }
    },
    "Select": {
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
    "Select-Filters": {
        dataSchema: {
            "enum": {
                "table": "users",
                "column": "user_name",
                "filters": [
                    {
                        "key": "role_type",
                        "value": [
                            "hr",
                            "manager",
                            "admin"
                        ],
                        "operator": "in"
                    },
                    {
                        "key": "is_active",
                        "value": true,
                        "operator": "eq"
                    }
                ]
            },
            "type": "string",
        },
        uiSchema: {
            "ui:widget": "select",
        },
        requiresOptions: true
    },
    "Multi-Select": {
        dataSchema: {
            "type": "array",
            "items": {
                "type": "string"
            },
            "title": "Tags",
        },
        uiSchema: {
            "ui:widget": "TagsWidget"
        },
        requiresOptions: true,
    },
    "radio": {
        dataSchema: {
            "type": "boolean",
        },
        uiSchema: {
            "ui:widget": "radio"
        },
        requiresOptions: true
    },
    "checkboxes": {
        dataSchema: {
            "type": "boolean",
        },
        uiSchema: {
            // "ui:widget": "checkboxes"
        },
    },
    "range": {
        dataSchema: {
            "type": "integer",
            "minimum": 0,
            "maximum": 100
        },
        uiSchema: {
            "ui:widget": "range"
        },
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
    },
    "table": {
        dataSchema: {
            "type": "array",
            "items": {
                "$ref": "#/definitions/Users"
            },
            "title": "A list with a minimal number of items",
            "definitions": {
                "Users": {
                    "type": "object",
                    "properties": {
                        "day": {
                            "type": "string",
                            "field_": "start_date",
                            "format": "date-time",
                            "title_": "Start Date"
                        },
                        "name": {
                            "enum": {
                                "table": "users",
                                "column": "user_name"
                            },
                            "type": "string",
                            "default": "Default name"
                        }
                    }
                }
            },

        },
        uiSchema: {
            "ui:widget": "EditableTableWidget",
            "ui:options": {
                "addable": true,
                "orderable": true,
                "removable": true
            }
        }
    }
};
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
    "SelectMulti": {
        dataSchema: {
            type: "string",
            enum: []
        },
        uiSchema: {
            "ui:widget": "SelectWidget",
            "ui:placeholder": "Select an option",
            "ui:options": {
                "allowClear": true,
                "mode": "multiple",
                "showSearch": true
            }
        },
        requiresLookup: true
    },
    "SelectMultiTags": {
        dataSchema: {
            type: "string",
            enum: []
        },
        uiSchema: {
            "ui:widget": "SelectWidget",
            "ui:placeholder": "Select an option",
            "ui:options": {
                "allowClear": true,
                "mode": "tags",
                "showSearch": true
            }
        },
        requiresLookup: true
    },
    "SelectSingle": {
        dataSchema: {
            type: "string",
            enum: []
        },
        uiSchema: {
            "ui:widget": "SelectWidget",
            "ui:options": {
                "allowClear": false,
                "showSearch": false,
                "mode": "single"
            },
            "ui:placeholder": "Select an option"
        },
        requiresLookup: true
    },
    "multipleChoicesList": {
        dataSchema: {
            "type": "array",
            "title": "A multiple choices list",
            "items": {
                "type": "string",
                // enum: []
                "enum": [
                    "f2427a1e-9a2e-47c0-8bdd-26168a237490",
                    "a23481a8-bd96-4dff-b59a-5e5b1216af8e",
                    "ba3a518b-b8e7-4cf7-b32f-ea7bb00f4202",
                    "8162d716-2c44-4bf4-8ff6-9a509b64c09a",
                    "8ecc7ede-b694-4b4e-b59e-f84083facc9b",
                    "ef002980-f878-4fb0-8675-e27b1e4c8769",
                    "23f7aa36-d889-41a9-8b1a-3f8c0867eb01",
                    "5b88f0d8-ae94-487b-83c3-d595e12cccd3",
                    "deae1015-7b7c-41c0-93ae-7c42a8b6295b"
                ],
                "enumNames": [
                    "IBCN",
                    "Arvind Alagappan Rajkumar",
                    "Meena Sevugen",
                    "Meena Ravi",
                    "Deivarayan S",
                    "Palaniappan Cho",
                    "Ramanathan L",
                    "Vayeravan vairavan",
                    "Ganesh Raikar"
                ]
            },
            "uniqueItems": true,
        },
        uiSchema: {
            "ui:widget": "SelectableTags"
        },
        // requiresLookup: true
    },
    "multipleChoices2": {
        dataSchema: {
            "type": "array",
            "title": "Selectable Tags",
            "items": {
                "type": "string"
            },
            "uniqueItems": true,
            "options": {
                "enumOptions": [
                    { "value": "tag1", "label": "Tag 1" },
                    { "value": "tag2", "label": "Tag 2" },
                    { "value": "tag3", "label": "Tag 3" },
                    { "value": "tag4", "label": "Tag 4" },
                    { "value": "tag5", "label": "Tag 5" }
                    // ... more tags
                ],
                "maxItems": 3, // Example: Maximum 3 tags can be selected
                "title": "Select your tags" // Example: Title for the widget
            }
        },
        uiSchema: {
            "ui:widget": "selectableTags", // Use the registered name
            "ui:options": {
                enumOptions: [ /* ... your enumOptions ...*/], // Important!
                maxItems: 3,
                title: "Select your tags"
            }
        },
        // requiresLookup: true
    },
    "SelectableTags": {
        dataSchema: {
            type: "string",
            enum: []
        },
        uiSchema: {
            "ui:widget": "SelectableTags"
        },
        requiresLookup: true
    },
    "Select-Filters": {//This is Static for now,need to make filters addable to any select widget
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
    // "Multi-Select": {
    //     dataSchema: {
    //         "type": "array",
    //         "items": {
    //             "type": "string"
    //         },
    //         "title": "Tags",
    //         "options": [
    //             "option1",
    //             "option2",
    //             "option3"
    //         ]
    //     },
    //     uiSchema: {
    //         "ui:widget": "TagsWidget"
    //     },
    //     requiresOptions: true,
    // },
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
    "Web Widget": {
        dataSchema: {
            "type": "string",
            "title": "Website"

        },
        uiSchema: {
            "website": {
                "ui:widget": "WebWidget"
            }

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
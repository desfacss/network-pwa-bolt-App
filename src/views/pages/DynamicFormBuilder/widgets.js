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
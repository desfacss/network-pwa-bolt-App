export const schema2 = {
    title: "Ant Design Form with All Input Types",
    type: "object",
    properties: {
        datetime: {
            type: "string",
            format: "date-time"
        },
        date: {
            type: "string",
            format: "date"
        },
        time: {
            type: "string",
            format: "time"
        },
        textInput: {
            title: "Text Input",
            type: "string",
        },
        passwordInput: {
            title: "Password Input",
            type: "string",
        },
        numberInput: {
            title: "Number Input",
            type: "number",
        },
        selectInput: {
            title: "Select Input",
            type: "string",
            enum: ["Option 1", "Option 2", "Option 3"],
        },
        dateInput: {
            title: "Date Picker",
            type: "string",
            format: "date",
        },
        // rangePickerInput: {
        //     title: "Range Picker",
        //     type: "array",
        //     items: {
        //         type: "string",
        //         format: "date",
        //     },
        // },
        checkboxInput: {
            title: "Checkbox Input",
            type: "boolean",
        },
        radioInput: {
            title: "Radio Group",
            type: "string",
            enum: ["Radio 1", "Radio 2", "Radio 3"],
        },
        textareaInput: {
            title: "Text Area",
            type: "string",
        },
        switchInput: {
            title: "Switch",
            type: "boolean",
        },
        sliderInput: {
            title: "Slider",
            type: "number",
            minimum: 0,
            maximum: 100,
        },
        fileUpload: {
            title: "File Upload",
            type: "string",
            format: "data-url",
        },
    },
};
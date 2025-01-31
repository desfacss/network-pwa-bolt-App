import React, { useState } from 'react';
import { Form, Button, Radio, Slider } from 'antd';
import { Form as RJSF, withTheme } from '@rjsf/core';
import { Theme as AntDTheme } from '@rjsf/antd';
import validator from "@rjsf/validator-ajv8";

const FormWithAntDTheme = withTheme(AntDTheme);

// Example usage:
const schema = {
    type: "object",
    properties: {
        "field1": { "type": "string", "title": "Field 1" },
        "field2": { "type": "number", "title": "Field 2" },
        "field3": {
            "type": "string",
            "title": "Choose an option",
            "enum": ["Option 1", "Option 2", "Option 3"]
        },
        "field4": { "type": "boolean", "title": "Field 4" },
        "field5": { "type": "string", "title": "Field 5" }
    },
    required: ["field1", "field3"]
};

const uiSchema = {
    "field3": {
        "ui:widget": "radio"
    }
};

export const SurveyForm = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const fields = Object.keys(schema.properties);

    // Transform schema to show only one field at a time
    const currentSchema = {
        type: 'object',
        properties: {
            [fields[currentIndex]]: schema.properties[fields[currentIndex]]
        },
        required: schema.required.includes(fields[currentIndex]) ? [fields[currentIndex]] : []
    };

    const currentUiSchema = {
        [fields[currentIndex]]: uiSchema[fields[currentIndex]] || {}
    };

    const handleSubmit = (values) => {
        console.log('Submitted data:', { ...formData, ...values });
        // Here you would handle form submission, e.g., API call
    };

    const handleChange = ({ formData }) => {
        setFormData(prevData => ({
            ...prevData,
            ...formData
        }));
    };

    const handleNext = () => {
        if (currentIndex < fields.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <Form onFinish={handleSubmit}>
            <FormWithAntDTheme validator={validator}
                schema={currentSchema}
                uiSchema={currentUiSchema}
                formData={formData}
                onChange={handleChange}
                liveValidate
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Button onClick={handlePrev} disabled={currentIndex === 0}>Previous</Button>
                    <Slider
                        value={currentIndex}
                        min={0}
                        max={fields.length - 1}
                        step={1}
                        marks={fields.reduce((acc, field, index) => {
                            acc[index] = '';
                            return acc;
                        }, {})}
                        onChange={setCurrentIndex}
                    />
                    {currentIndex === fields.length - 1 ? (
                        <Button type="primary" htmlType="submit">Submit</Button>
                    ) : (
                        <Button onClick={handleNext}>Next</Button>
                    )}
                </div>
            </FormWithAntDTheme>
        </Form>
    );
};

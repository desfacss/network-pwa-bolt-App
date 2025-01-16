import { Card, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import Chat from 'views/app-views/chat';
import Market from './Market';
import Chat2 from './Market/Chat';
// import ProForm from './Market/ProForm';
// import Form from '@rjsf/core';
import Form from '@rjsf/antd';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { supabase } from 'configs/SupabaseConfig';
// import { schema2 } from './net_app/a3';
// import { schema2 } from './net_app/a2';
import { schema2 } from './net_app/a1';
import './net_app/formstyle.css'
import BasicForm from './net_app/BasicForm';


const Position = () => {
    const [enums, setEnums] = useState()
    const [schema, setSchema] = useState()
    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enums').select('*')
            if (data) {
                console.log("Enums", data)
                setEnums(data)
            }
        }
        getEnums()
    }, [])

    const CustomFieldTemplate = ({ id, classNames, label, children }) => {
        return (
            // <div className={`form-group ${classNames} col-md-6`}>
            <div className={`d-flex flex-wrap`}>
                {/* {label && <label htmlFor={id}>{label}</label>} */}
                {children}
            </div>
        );
    };
    // const uiSchema = { "email": { "ui:disabled": false, "ui:readonly": true, "ui:emptyValue": "" }, "mobile": { "ui:title": "Mobile Number", "ui:widget": "updown", "ui:description": "(Enter a valid mobile number)" }, "lastName": { "ui:emptyValue": "" }, "location": { "ui:title": "Enter your residence location", "ui:widget": "text" }, "ui:order": ["firstName", "lastName", "email", "mobile", "associatedTemple", "nativeVillage", "location", "registrationType"], "firstName": { "ui:autofocus": true, "ui:emptyValue": "" }, "nativeVillage": { "ui:widget": "select", "ui:options": { "label": "Select your native town" } }, "associatedTemple": { "ui:widget": "select", "ui:options": { "label": "Select your associated temple" } }, "registrationType": { "ui:title": "Select Registration Type", "ui:widget": "select", "ui:options": { "label": "Select your registration type" } } }
    // const uiSchema = {
    //     passwordInput: {
    //         "ui:widget": "password",
    //     },
    //     numberInput: {
    //         "ui:widget": "updown",
    //     },
    //     selectInput: {
    //         "ui:widget": "select",
    //     },
    //     dateInput: {
    //         "ui:widget": "alt-date",
    //     },
    //     // rangePickerInput: {
    //     //     "ui:widget": "range",
    //     // },
    //     checkboxInput: {
    //         "ui:widget": "checkbox",
    //     },
    //     radioInput: {
    //         "ui:widget": "radio",
    //     },
    //     textareaInput: {
    //         "ui:widget": "textarea",
    //     },
    //     switchInput: {
    //         "ui:widget": "radio",  // For boolean switch, radio works in this case
    //     },
    //     sliderInput: {
    //         "ui:widget": "range",
    //     },
    //     fileUpload: {
    //         "ui:widget": "file",
    //     },
    // };
    // const schema2 = { "type": "object", "title": "Registration Form", "required": ["firstName", "email", "mobile", "associatedTemple", "nativeVillage", "location"], "properties": { "email": { "type": "string", "title": "Email", "readOnly": true }, "mobile": { "type": "number", "title": "Mobile", "format": "number" }, "lastName": { "type": "string", "title": "Last Name" }, "location": { "type": "string", "title": "Residence Location" }, "firstName": { "type": "string", "title": "First Name" }, "nativeVillage": { "enum": ["village1", "village2", "village3", "village4", "village5"], "type": "string", "title": "Native Town" }, "associatedTemple": { "enum": ["temple1", "temple2", "temple3", "temple4", "temple5"], "type": "string", "title": "Associated Kovil" }, "registrationType": { "enum": ["Enterprise / Business", "Entrepreneur / Small business owner", "Individual / Employee"], "type": "string", "title": "Associated Kovil" } }, "description": "Form for user registration including associated temple and native village" }
    const uiSchema = {
        "ui:order": [
            "companyName",
            "positionTitle",
            "industrySector",
            "subSector",
            "legalStructure",
            "establishmentYear",
            "directEmployment",
            "annualTurnoverRange",
            "nagaratharInvolvement",
            "indirectEmployment",
            "section",
            "briefDescription",
            "productsOrServices",
            "expansionPlans",
            "innovationPlans",
            "section3",
            "location",
            "web",
            "linkedin",
            "facebook",
            "instagram",
            "twitter",
            "posts"
        ],
        // "ui:FieldTemplate": CustomFieldTemplate,
        "companyName": {
            "ui:widget": "text",
            "ui:placeholder": "Enter the company name",
            "ui:autofocus": true,
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "d-inline w-50",
            // classNames: "customClassName"
            // "ui:classNames": "col-6"
        },
        "positionTitle": {
            "ui:widget": "text",
            "ui:placeholder": "Enter your position or title",
            "ui:classNames": "d-print-inline w-50",
            // "ui:classNames": "w-50 d-inline",
            // "ui:classNames": "col-6"
        },
        "industrySector": {
            "ui:widget": "select",
            "ui:placeholder": "Select your industry or sector",
            // "ui:classNames": "w-50 d-inline-block",
            // "ui:classNames": "w-50",
            "ui:classNames": "col-6"
        },
        "subSector": {
            "ui:widget": "text",
            "ui:placeholder": "Enter the sub-sector (optional)",
            // "ui:classNames": "w-50 d-inline-block",
            // "ui:classNames": "w-50",
            "ui:classNames": "col-6 w-50"
        },
        "legalStructure": {
            "ui:widget": "select",
            "ui:placeholder": "Select the legal structure",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "establishmentYear": {
            // "ui:widget": "updown",
            "ui:placeholder": "Enter the year of establishment",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
            // "ui:options": {
            //     "labelCol": { span: 4 },
            //     "wrapperCol": { span: 8 }
            // }
        },
        "directEmployment": {
            "ui:widget": "select",
            "ui:help": "Approximate employment opportunity your business is creating",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
            // "ui:options": {
            //     "labelCol": { span: 4 },
            //     "wrapperCol": { span: 8 }
            // }
        },
        "annualTurnoverRange": {
            "ui:widget": "select",
            "ui:help": "Approximate turnover range to understand the Nagarathar community contribution",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "nagaratharInvolvement": {
            "ui:widget": "select",
            "ui:help": "% of Nagarathar Founders/Owners share in the business",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "indirectEmployment": {
            "ui:widget": "select",
            "ui:help": "Approximate indirect employment opportunity",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "section": {
            "ui:widget": "textarea",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
            "ui:description": "This information is optional. You can add it later if you opt-in to the KNBA Directory."
        },
        "briefDescription": {
            "ui:widget": "textarea",
            "ui:placeholder": "Provide a brief description of your business",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "productsOrServices": {
            "ui:widget": "textarea",
            "ui:placeholder": "Describe the products or services offered",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "expansionPlans": {
            "ui:widget": "textarea",
            "ui:placeholder": "Describe your expansion plans in the next 1-2 years",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "innovationPlans": {
            "ui:widget": "textarea",
            "ui:placeholder": "Describe any process or technology innovation plans",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "section3": {
            "ui:widget": "textarea",
            "ui:description": "Business Contact Information",
            "ui:options": {
                "rows": 5
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "location": {
            "ui:widget": "text",
            "ui:placeholder": "Enter the main location of the business",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "web": {
            // "ui:widget": "url",
            "ui:placeholder": "Enter your business website URL",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "linkedin": {
            // "ui:widget": "url",
            "ui:placeholder": "Enter your LinkedIn profile",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "facebook": {
            // "ui:widget": "url",
            "ui:placeholder": "Enter your Facebook profile",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "instagram": {
            // "ui:widget": "url",
            "ui:placeholder": "Enter your Instagram profile",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "twitter": {
            // "ui:widget": "url",
            "ui:placeholder": "Enter your Twitter profile",
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "posts": {
            "items": {
                "name": {
                    "ui:widget": "text",
                    "ui:placeholder": "Enter post name",
                    // "ui:classNames": "w-50 d-inline-block",
                    "ui:classNames": "w-50",
                },
                "salary": {
                    // "ui:widget": "updown",
                    "ui:placeholder": "Enter the salary",
                    // "ui:classNames": "w-50 d-inline-block",
                    "ui:classNames": "w-50",
                },
                "experience": {
                    "ui:widget": "text",
                    "ui:placeholder": "Enter experience level",
                    // "ui:classNames": "w-50 d-inline-block",
                    "ui:classNames": "w-50",
                }
            },
            "ui:field": "ArrayFieldTemplate",
            "ui:options": {
                "addable": true,
                "orderable": true,
                "removable": true
            },
            // "ui:classNames": "w-50 d-inline-block",
            "ui:classNames": "w-50",
        },
        "ui:root": {
            "ui:classNames": "d-flex",
            // "ui:classNames": "row"
        }
    };


    useEffect(() => {
        const replaceEnums = (obj) => {
            Object.keys(obj).forEach((key) => {
                if (key === "enum") {
                    // Find the matching enum object by 'name' from the enums array
                    const enumName = obj[key];  // `enum` should be a string, not an array
                    const foundEnum = enums?.find((e) => e.name === enumName);

                    if (foundEnum) {
                        obj[key] = foundEnum?.options;  // Replace the enum values with the options
                    }
                }

                // If the value is an object, recursively traverse it
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    replaceEnums(obj[key]);
                }
            });
        };

        if (schema2 && enums) {
            const schemaCopy = JSON.parse(JSON.stringify(schema2)); // Make a deep copy of schema2
            replaceEnums(schemaCopy);
            console.log("Updated schema", schemaCopy);  // Check if the schema is updated correctly
            setSchema(schemaCopy);  // Set the updated schema to state
        }
    }, [schema2, enums]);

    const log = (type) => console.log.bind(console, type);
    return (
        <div >
            <Row>
                <Col span={24} >
                    {/* <div
                        className="d-flex"
                    >
                        <div className="col-6">Element 1</div>
                        <div className="col-6">Element 2</div>
                    </div> */}
                    <Card>
                        <BasicForm />
                        {/* <div className='d-flex'> */}
                        {schema && <Form
                            schema={schema}
                            uiSchema={uiSchema}
                            validator={validator}
                            onChange={e => console.log(e)}
                            onSubmit={e => console.log(e.formData)}
                            // FieldTemplate={CustomFieldTemplate}
                            // onChange={log('changed')}
                            // onSubmit={log('submitted')}
                            onError={log('errors')}
                        />}
                        {/* </div> */}
                    </Card>
                    <Chat />
                    <Market />
                    <Chat2 />
                </Col>
            </Row>
        </div>
    )
}
export default Position
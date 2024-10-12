import Form from "@rjsf/antd";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { ReactElement } from "react";
// import schema from "./FormSchema.json";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";

const schema = {
    "title": "A registration form",
    "description": "A simple form example.",
    "type": "object",
    "required": [
        "firstName",
        "lastName"
    ],
    "properties": {
        "firstName": {
            "type": "string",
            "title": "First name",
            "default": "Chuck"
        },
        "lastName": {
            "type": "string",
            "title": "Last name"
        },
        "tName": {
            "type": "string",
            "title": "Last name"
        },
        "age": {
            "type": "integer",
            "title": "Age"
        },
        "bio": {
            "type": "string",
            "title": "Bio"
        },
        "password": {
            "type": "string",
            "title": "Password",
            "minLength": 3
        },
        "telephone": {
            "type": "string",
            "title": "Telephone",
            "minLength": 10
        }
    }
}

let _RJSFSchema: RJSFSchema = JSON.parse(JSON.stringify(schema));

const BasicForm: () => ReactElement = () => {
    return (
        <Form
            schema={_RJSFSchema}
            validator={validator}
            templates={{
                ObjectFieldTemplate: ObjectFieldTemplate,
            }}
            uiSchema={{
                "ui:grid": [
                    { firstName: 8, lastName: 4, tName: 8, },
                    { age: 6, bio: 18 },
                    { password: 12, telephone: 12 }
                ],
            }}
        />
    );
};

export default BasicForm;
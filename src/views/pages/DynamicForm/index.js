import Form from "@rjsf/antd";
// import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { supabase } from "configs/SupabaseConfig";
import { useEffect, useState } from "react";
// import { ReactElement } from "react";
// import schema from "./FormSchema.json";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";

const DynamicForm = ({ schemas, formData, updateId, onFinish }) => {
    const [enums, setEnums] = useState()
    const [schema, setSchema] = useState()
    const [userId, setUserId] = useState();
    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                setUserId(session?.user?.id);
            });
        };
        getUser();
    }, []);

    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enum').select('*')
            if (data) {
                console.log("Enums", data)
                setEnums(data)
            }
        }
        getEnums()
    }, [])
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

        if (schemas && enums) {
            const schemaCopy = JSON.parse(JSON.stringify(schemas)); // Make a deep copy of schemas
            replaceEnums(schemaCopy);
            console.log("Updated schema", schemaCopy);  // Check if the schema is updated correctly
            setSchema(schemaCopy);  // Set the updated schema to state
        }
    }, [schemas, enums]);

    const onSubmit = async (e) => {
        console.log("Payload", schema?.db_schema?.table, schema?.db_schema?.column, e?.formData)

        if (schema?.db_schema?.multiple_rows === true) {
            if (updateId) {
                const { data, error } = await supabase.from(schema?.db_schema?.table)
                    .upsert([
                        {
                            id: updateId,
                            user_id: userId,
                            [schema?.db_schema?.column]: e?.formData // Send each value separately
                        },
                    ], { onConflict: 'id' });
                if (error) {
                    return console.log("Error", error);
                }
            } else {
                const { data, error } = await supabase.from(schema?.db_schema?.table)
                    .insert([
                        {
                            user_id: userId,
                            [schema?.db_schema?.column]: e?.formData // Send each value separately
                        },
                    ]);
                if (error) {
                    return console.log("Error", error);
                }
            }
        } else {
            const { data, error } = await supabase.from(schema?.db_schema?.table)
                .upsert([
                    {
                        user_id: userId,
                        [schema?.db_schema?.column]: e?.formData // Send each value separately
                    },
                ], { onConflict: 'user_id' });
            if (error) {
                return console.log("Error", error);
            }
        }
        onFinish()
    }
    console.log("Schemas", schemas, formData, updateId)

    let _RJSFSchema = schema && JSON.parse(JSON.stringify(schema?.data_schema));
    const log = (type) => console.log.bind(console, type);

    return (
        <>
            {schema && <Form
                schema={_RJSFSchema}
                validator={validator}
                templates={{ ObjectFieldTemplate: ObjectFieldTemplate, }}
                uiSchema={schema?.ui_schema
                    //     {
                    //     "ui:grid": [
                    //         { firstName: 8, lastName: 4, tName: 8, },
                    //         { age: 6, bio: 18 },
                    //         { password: 12, telephone: 12 }
                    //     ],
                    // }
                }
                formData={formData}
                onSubmit={onSubmit}
                onError={log('errors')}
            // onChange={log('changed')}
            />}
        </>
    );
};

export default DynamicForm;
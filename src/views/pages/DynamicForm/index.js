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
            let { data, error } = await supabase.from('enums').select('*')
            if (data) {
                console.log("Enums", data)
                setEnums(data)
            }
        }
        getEnums()
    }, [])

    useEffect(() => {
        const fetchDataForDropdown = async (table, column) => {
            try {
                let { data, error } = await supabase
                    .from(table)
                    .select(column.includes('.') ? `${column} ->>` : column);

                if (error) {
                    console.error("Error fetching data from Supabase:", error);
                    return [];
                }

                if (column.includes('.')) {
                    const [outerKey, innerKey] = column.split('.');
                    return data.map((item) => item[outerKey]?.[innerKey]).filter(Boolean);
                } else {
                    return data.map((item) => item[column]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                return [];
            }
        };

        const replaceEnums = async (obj) => {
            const keys = Object.keys(obj);
            for (let key of keys) {
                const enumValue = obj[key]?.enum;

                if (enumValue) {
                    if (typeof enumValue === 'string') {
                        // Handle the old case where `enum` is a string and needs to match an entry in `enums`
                        const foundEnum = enums?.find((e) => e.name === enumValue);
                        if (foundEnum) {
                            obj[key] = {
                                type: "string",
                                title: obj[key].title,
                                enum: foundEnum.options
                            };
                        }
                    } else if (typeof enumValue === 'object' && enumValue.table && enumValue.column) {
                        // Handle the new case where `enum` is an object with a table and column
                        const options = await fetchDataForDropdown(enumValue.table, enumValue.column);
                        obj[key] = {
                            type: "string",
                            title: obj[key].title,
                            enum: options
                        };
                    }
                }

                if (typeof obj[key] === "object" && obj[key] !== null) {
                    await replaceEnums(obj[key]);
                }
            }
        };

        const updateSchema = async () => {
            if (schemas && enums) {
                const schemaCopy = JSON.parse(JSON.stringify(schemas));
                await replaceEnums(schemaCopy);
                console.log("Updated schema", schemaCopy);
                setSchema(schemaCopy);
            }
        };

        updateSchema();
    }, [schemas, enums]);


    // useEffect(() => {
    //     const fetchDataForDropdown = async (table, column) => {
    //         try {
    //             // Fetch data from Supabase based on the specified table
    //             let { data, error } = await supabase
    //                 .from(table)
    //                 .select(column.includes('.') ? `${column} ->>` : column);

    //             if (error) {
    //                 console.error("Error fetching data from Supabase:", error);
    //                 return [];
    //             }

    //             // If the column is nested (e.g., "detail.name"), extract the nested value
    //             if (column.includes('.')) {
    //                 const [outerKey, innerKey] = column.split('.');
    //                 return data.map((item) => item[outerKey]?.[innerKey]).filter(Boolean);
    //             } else {
    //                 // Directly extract the column value
    //                 return data.map((item) => item[column]);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //             return [];
    //         }
    //     };

    //     const replaceEnumsWithFetchedData = async (obj) => {
    //         const keys = Object.keys(obj);
    //         for (let key of keys) {
    //             const enumValue = obj[key]?.enum;
    //             if (enumValue && typeof enumValue === 'object' && enumValue.table && enumValue.column) {
    //                 // Fetch data based on the specified table and column
    //                 const options = await fetchDataForDropdown(enumValue.table, enumValue.column);

    //                 // Update the schema field with the format expected by react-jsonschema-form
    //                 obj[key] = {
    //                     type: "string",
    //                     title: obj[key].title,
    //                     enum: options
    //                 };
    //             }

    //             // If the value is an object, recursively traverse it
    //             if (typeof obj[key] === "object" && obj[key] !== null) {
    //                 await replaceEnumsWithFetchedData(obj[key]);
    //             }
    //         }
    //     };

    //     const updateSchema = async () => {
    //         if (schemas) {
    //             const schemaCopy = JSON.parse(JSON.stringify(schemas)); // Make a deep copy of schemas
    //             await replaceEnumsWithFetchedData(schemaCopy);
    //             console.log("Updated schema", schemaCopy);  // Verify the updated schema structure
    //             setSchema(schemaCopy);  // Set the updated schema to state
    //         }
    //     };

    //     updateSchema();
    // }, [schemas]);


    const onSubmit = async (e) => {
        // console.log("Payload", schema?.db_schema?.table, schema?.db_schema?.column, e?.formData)
        onFinish(e?.formData)
        // if (schema?.db_schema?.multiple_rows === true) {
        //     if (updateId) {
        //         const { data, error } = await supabase.from(schema?.db_schema?.table)
        //             .upsert([
        //                 {
        //                     id: updateId,
        //                     user_id: userId,
        //                     [schema?.db_schema?.column]: e?.formData // Send each value separately
        //                 },
        //             ], { onConflict: 'id' });
        //         if (error) {
        //             return console.log("Error", error);
        //         }
        //     } else {
        //         const { data, error } = await supabase.from(schema?.db_schema?.table)
        //             .insert([
        //                 {
        //                     user_id: userId,
        //                     [schema?.db_schema?.column]: e?.formData // Send each value separately
        //                 },
        //             ]);
        //         if (error) {
        //             return console.log("Error", error);
        //         }
        //     }
        // } else {
        //     const { data, error } = await supabase.from(schema?.db_schema?.table)
        //         .upsert([
        //             {
        //                 user_id: userId,
        //                 [schema?.db_schema?.column]: e?.formData // Send each value separately
        //             },
        //         ], { onConflict: 'user_id' });
        //     if (error) {
        //         return console.log("Error", error);
        //     }
        // }

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
                formData={formData && formData}
                onSubmit={onSubmit}
                onError={log('errors')}
            // onChange={log('changed')}
            />}
        </>
    );
};

export default DynamicForm;
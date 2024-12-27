import Form from "@rjsf/antd";
// import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Spin } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Widgets from "./Widgets";
// import { ReactElement } from "react";
// import schema from "./FormSchema.json";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";

const DynamicForm = ({ schemas, formData, updateId, onFinish }) => {
    const [enums, setEnums] = useState()
    const [schema, setSchema] = useState()
    const [userId, setUserId] = useState();
    const [currentFormData, setCurrentFormData] = useState(formData)

    const { session } = useSelector((state) => state.auth);

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
            let { data, error } = await supabase.from('enums').select('*').eq('organization_id', session?.user?.organization_id)
            if (data) {
                // console.log("Enums", data)
                setEnums(data)
            }
        }
        getEnums()
    }, [])

    useEffect(() => {

        const fetchDataForDropdown = async (table, column, filters, noId) => {
            try {
                // Normalize the column name for JSONB fields
                const normalizedColumn = column.replace('-', '.');

                // Initialize the Supabase query
                let query = supabase
                    .from(table)
                    .select(`${noId ? "" : "id, "}${normalizedColumn.includes('.') ? `${normalizedColumn} ->>` : normalizedColumn}`)
                // .eq('organization_id', session?.user?.organization_id);
                // .select('*');
                // Iterate over filters and chain them directly onto the query
                filters?.forEach(filter => {
                    const { key, operator, value } = filter;

                    // Chain the operator directly if it's a supported Supabase filter method
                    if (query[operator]) {
                        // Apply the `.in` operator differently if `value` is an array
                        if (operator === 'in' && Array.isArray(value)) {
                            query = query.in(key, value);
                        } else {
                            query = query[operator](key, value);
                        }
                    } else {
                        console.warn(`Unsupported filter operator: ${operator}`);
                    }
                });

                // Execute the constructed query
                const { data, error } = await query;
                // console.log("filters,", table, data, error);

                if (error) {
                    console.error("Error fetching data from Supabase:", error);
                    return [];
                }

                // Extract the column values, accounting for nested fields if present
                if (normalizedColumn.includes('.')) {
                    const [outerKey, innerKey] = normalizedColumn.split('.');
                    return data//.map((item) => item[outerKey]?.[innerKey]).filter(Boolean);
                    // return data.map((item) => ({
                    //     id: item.id,
                    //     name: item[outerKey]?.[innerKey]
                    // })).filter(item => item.name !== undefined);
                } else {
                    // Directly extract the column value with `id`
                    return data//.map((item) => item[normalizedColumn]);
                    // return data.map((item) => ({
                    //     id: item.id,
                    //     name: item[normalizedColumn]
                    // })).filter(item => item.name !== undefined);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                return [];
            }
        };

        // const fetchDataForDropdown = async (table, column, filters) => {
        //     try {
        //         // Replace "-" with "." to handle nested JSONB fields
        //         const normalizedColumn = column.replace('-', '.');

        //         // Fetch data from Supabase based on the specified table
        //         let query = await supabase
        //             .from(table)
        //             .select(`id,${normalizedColumn.includes('.') ? `${normalizedColumn} ->>` : normalizedColumn}`);

        //         // for (const [key, value] of Object.entries(filters)) {
        //         //     query = query.eq(key, value);
        //         // }

        //         // Apply each filter condition passed in the filters array
        //         console.log("filter", query);
        //         filters?.forEach(filter => {
        //             const { key, operator, value } = filter;
        //             if (query[operator]) {
        //                 query = query[operator](key, value);
        //             }
        //         });
        //         const { data, error } = query;

        //         if (error) {
        //             console.error("Error fetching data from Supabase:", error);
        //             return [];
        //         }

        //         // If the column is nested (e.g., "details.name"), extract the nested value
        //         // if (normalizedColumn.includes('.')) {
        //         //     const [outerKey, innerKey] = normalizedColumn.split('.');
        //         //     return data.map((item) => item[outerKey]?.[innerKey]).filter(Boolean);
        //         // } else {
        //         //     // Directly extract the column value
        //         //     return data.map((item) => item[normalizedColumn]);
        //         // }
        //         if (normalizedColumn.includes('.')) {
        //             const [outerKey, innerKey] = normalizedColumn.split('.');
        //             return data.map((item) => ({
        //                 id: item.id,
        //                 name: item[outerKey]?.[innerKey]
        //             })).filter(item => item.value !== undefined);
        //         } else {
        //             // Directly extract the column value with `id`
        //             return data.map((item) => ({
        //                 id: item.id,
        //                 name: item[normalizedColumn]
        //             })).filter(item => item.value !== undefined);
        //         }
        //     } catch (error) {
        //         console.error("Error fetching data:", error);
        //         return [];
        //     }
        // };

        const replaceEnums = async (obj) => {
            const keys = Object.keys(obj);
            for (let key of keys) {
                const enumValue = obj[key]?.enum;
                const noId = enumValue?.no_id;
                const filterConditions = obj[key]?.enum?.filters || [];
                // filterConditions && console.log("Ob", filterConditions);
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
                        const options = await fetchDataForDropdown(enumValue.table, enumValue.column, filterConditions, noId);
                        // console.log("Op", options);
                        obj[key] = {
                            ...obj[key],
                            type: obj[key]?.type,
                            title: obj[key].title,
                            enum: options.map(item => (noId ? item[`${enumValue.column}`] : item.id)),
                            enumNames: options.map(item => item[`${enumValue.column}`])
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
                // console.log("Updated schema", schemaCopy);
                setSchema(schemaCopy);
            }
        };

        updateSchema();
    }, [schemas, enums]);


    // useEffect(() => {
    //     const fetchDataForDropdown = async (table, column) => {
    //         try {
    //             let { data, error } = await supabase
    //                 .from(table)
    //                 .select(column.includes('.') ? `${column} ->>` : column);

    //             if (error) {
    //                 console.error("Error fetching data from Supabase:", error);
    //                 return [];
    //             }

    //             if (column.includes('.')) {
    //                 const [outerKey, innerKey] = column.split('.');
    //                 return data.map((item) => item[outerKey]?.[innerKey]).filter(Boolean);
    //             } else {
    //                 return data.map((item) => item[column]);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //             return [];
    //         }
    //     };

    //     const replaceEnums = async (obj) => {
    //         const keys = Object.keys(obj);
    //         for (let key of keys) {
    //             const enumValue = obj[key]?.enum;

    //             if (enumValue) {
    //                 if (typeof enumValue === 'string') {
    //                     // Handle the old case where `enum` is a string and needs to match an entry in `enums`
    //                     const foundEnum = enums?.find((e) => e.name === enumValue);
    //                     if (foundEnum) {
    //                         obj[key] = {
    //                             type: "string",
    //                             title: obj[key].title,
    //                             enum: foundEnum.options
    //                         };
    //                     }
    //                 } else if (typeof enumValue === 'object' && enumValue.table && enumValue.column) {
    //                     // Handle the new case where `enum` is an object with a table and column
    //                     const options = await fetchDataForDropdown(enumValue.table, enumValue.column);
    //                     obj[key] = {
    //                         type: "string",
    //                         title: obj[key].title,
    //                         enum: options
    //                     };
    //                 }
    //             }

    //             if (typeof obj[key] === "object" && obj[key] !== null) {
    //                 await replaceEnums(obj[key]);
    //             }
    //         }
    //     };

    //     const updateSchema = async () => {
    //         if (schemas && enums) {
    //             const schemaCopy = JSON.parse(JSON.stringify(schemas));
    //             await replaceEnums(schemaCopy);
    //             console.log("Updated schema", schemaCopy);
    //             setSchema(schemaCopy);
    //         }
    //     };

    //     updateSchema();
    // }, [schemas, enums]);


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
        console.log("TG", e?.formData)
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
    // console.log("Schemas", schemas, formData, updateId)

    let _RJSFSchema = schema && JSON.parse(JSON.stringify(schema?.data_schema));
    const log = (type) => console.log.bind(console, type);

    const memoizedFormContext = useMemo(() => ({ fullSchema: _RJSFSchema, formData: currentFormData }), [_RJSFSchema, currentFormData]);
    const memoizedRJSFSchema = useMemo(() => schema && JSON.parse(JSON.stringify(schema?.data_schema)), [schema]);


    const handleFormChange = ({ formData: updatedFormData }) => {
        console.log("a", updatedFormData)
        if (JSON.stringify(updatedFormData) !== JSON.stringify(currentFormData)) {
            console.log("b")
            setCurrentFormData(updatedFormData);
        }
    };

    // const data = currentFormData || formData

    return (
        <>
            {schema ?
                <Form
                    // schema={_RJSFSchema}
                    schema={memoizedRJSFSchema}
                    widgets={Widgets}
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
                    onChange={handleFormChange}
                    formData={currentFormData}
                    onSubmit={onSubmit}
                    onError={log('errors')}
                    formContext={memoizedFormContext}
                // onChange={log('changed')}
                />
                : <Spin spinning={true}></Spin>}
        </>
    );
};

export default DynamicForm;
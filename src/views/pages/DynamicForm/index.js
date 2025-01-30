import Form from "@rjsf/antd";
// import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Spin, Slider } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Widgets from "./Widgets";
// import { ReactElement } from "react";
// import schema from "./FormSchema.json";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";

const DynamicForm = ({ schemas, formData, updateId, onFinish }) => {
    // State variables for managing dynamic form data and user context
    const [enums, setEnums] = useState(null);
    const [schema, setSchema] = useState(null);
    const [userId, setUserId] = useState(null);
    const [organization, setOrganization] = useState(null);
    // State for managing which slide of the form is currently displayed
    const [currentSlide, setCurrentSlide] = useState(0);

    const { session } = useSelector((state) => state.auth);

    // Fetch organization details
    const getOrganization = async () => {
        const { data, error } = await supabase.from('organizations').select('*').eq('name', process.env.REACT_APP_ORGANIZATION_APP || 'Dev').single();
        if (data) {
            setOrganization(data);
        }
    };

    // Effect to fetch user ID and organization on component mount
    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                setUserId(session?.user?.id);
            });
        };
        getUser();
        getOrganization();
    }, []);

    // Effect to fetch enums from the database
    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enums').select('*');
            console.log("Enums", error, data);
            if (data) {
                setEnums(data);
            }
        };
        getEnums();
    }, [organization]);

    // Effect to dynamically update the schema with fetched enum data
    useEffect(() => {
        const fetchDataForDropdown = async (table, column, filters, noId) => {
            try {
                // Normalize the column name for JSONB fields
                const normalizedColumn = column.replace('-', '.');

                // Initialize the Supabase query
                let query = supabase
                    .from(table)
                    .select(`${noId ? "" : "id, "}${normalizedColumn.includes('.') ? `${normalizedColumn} ->>` : normalizedColumn}`)
                    .eq('organization_id', session?.user?.organization_id);
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
                // Reset to first slide when schema updates
                setCurrentSlide(0);
            }
        };

        updateSchema();
    }, [schemas, enums]);

    // Helper function to filter schema properties for the current slide
    const getSchemaForSlide = (schema, slideIndex) => {
        if (!schema?.ui_schema?.['ui:slider']) return schema; // Return full schema if no slider config

        const slides = schema.ui_schema['ui:slider'];
        if (slideIndex >= slides.length) return schema; // Default to full schema if slide out of range

        const fieldsForSlide = slides[slideIndex];
        return {
            ...schema,
            data_schema: {
                ...schema.data_schema,
                properties: Object.fromEntries(
                    Object.entries(schema.data_schema.properties).filter(([key]) => 
                        fieldsForSlide.includes(key)
                    )
                )
            },
            ui_schema: {
                ...schema.ui_schema,
                ...Object.fromEntries(
                    Object.entries(schema.ui_schema).filter(([key]) => 
                        fieldsForSlide.includes(key) || key === 'ui:submitButtonOptions'
                    )
                )
            }
        };
    };

    // Submission handler
    const onSubmit = async (e) => {
        onFinish(e?.formData);
    };

    // Logging helper
    const log = (type) => console.log.bind(console, type);

    // Filter schema for the current slide
    let dynamicSchema = schema && getSchemaForSlide(schema, currentSlide);

    return (
        <>
            {dynamicSchema ? (
                <div>
                    <Form
                        schema={dynamicSchema.data_schema}
                        widgets={Widgets}
                        validator={validator}
                        templates={{ ObjectFieldTemplate }}
                        uiSchema={dynamicSchema.ui_schema}
                        formData={formData}
                        onSubmit={onSubmit}
                        onError={log('errors')}
                    />
                    {/* Render slider if 'ui:slider' is defined in the schema */}
                    {schema.ui_schema['ui:slider'] && (
                        <Slider 
                            min={0} 
                            max={schema.ui_schema['ui:slider'].length - 1} 
                            onChange={setCurrentSlide} 
                            value={currentSlide}
                            marks={schema.ui_schema['ui:slider'].reduce((acc, _, index) => ({ ...acc, [index]: `Slide ${index + 1}` }), {})}
                            step={null}
                        />
                    )}
                </div>
            ) : (
                <Spin spinning={true}></Spin>
            )}
        </>
    );
};

export default DynamicForm;
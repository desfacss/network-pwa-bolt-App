import Form from "@rjsf/antd";
// import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Spin, Slider, Button, notification } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Widgets from "./Widgets";
// import { ReactElement } from "react";
// import schema from "./FormSchema.json";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";
import ButtonGroup from "antd/es/button/button-group";
import { set } from 'lodash';

const DynamicForm = ({ schemas, initialFormData, updateId, onFinish, dynamicSubmit }) => {
    // State variables for managing dynamic form data and user context
    const [enums, setEnums] = useState(null);
    const [schema, setSchema] = useState(null);
    const [userId, setUserId] = useState(null);
    const [organization, setOrganization] = useState(null);
    // State for managing which slide of the form is currently displayed
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formData, setFormData] = useState(initialFormData || {});
    const { session } = useSelector((state) => state.auth);

    const formRef = useRef(null);
    // const onChange = ({ formData: slideFormData }) => {
    //     const currentFields = schema?.ui_schema?.['ui:slider']?.[currentSlide] || []; // Handle schema being null
    //     const updatedFormData = { ...formData };

    //     if (currentFields && Object.keys(slideFormData).length > 0) { // Check if currentFields exists and slideFormData is not empty
    //         currentFields.forEach(field => {
    //             if (slideFormData.hasOwnProperty(field)) { // Check if field exists in slideFormData
    //                 updatedFormData[field] = slideFormData[field];
    //             }
    //         });
    //         setFormData(updatedFormData);
    //     }
    // };

    // const onChange = ({ formData: slideFormData }) => {
    //     const currentFields = schema?.ui_schema?.['ui:slider']?.[currentSlide] || [];
    //     let updatedFormData = { ...formData };

    //     if (currentFields && Object.keys(slideFormData).length > 0) {
    //         currentFields.forEach(field => {
    //             if (slideFormData.hasOwnProperty(field)) {
    //                 updatedFormData = set(updatedFormData, field, slideFormData[field]);
    //             }
    //         });
    //         setFormData(updatedFormData);
    //     }

    //     setFormData({ ...updatedFormData }); // Force re-render
    // };

    const onChange = ({ formData: slideFormData }) => {
        const currentFields = schema?.ui_schema?.['ui:slider']?.[currentSlide] || [];
        let updatedFormData = { ...formData };

        if (currentFields && Object.keys(slideFormData).length > 0) {
            currentFields.forEach(field => {
                if (slideFormData.hasOwnProperty(field)) {
                    updatedFormData = set(updatedFormData, field, slideFormData[field]);
                }
            });
            setFormData(updatedFormData);
        }

        // Force re-render and trigger validation:
        setFormData({ ...updatedFormData }); // New object reference
        if (formRef.current) {
            formRef.current.forceUpdate(); // Force the form to re-render and re-validate
        }

    };

    // Fetch organization details
    const getOrganization = async () => {
        const { data, error } = await supabase.from('organizations').select('*').eq('name', process.env.REACT_APP_ORGANIZATION_APP || 'Dev').single();
        if (data) {
            setOrganization(data);
        } else {
            console.error('Failed to fetch organization:', error);
        }
    };

    // Effect to fetch user ID and organization on component mount
    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                setUserId(session?.user?.id);
                console.log('User ID set:', session?.user?.id);
            });
        };
        getUser();
        getOrganization();
    }, []);

    // Effect to fetch enums from the database
    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enums').select('*');
            console.log("Enums fetched:", error, data);
            if (data) {
                setEnums(data);
            } else {
                console.error('Failed to fetch enums:', error);
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
                console.log('Schema updated:', schemaCopy);
                // Reset to first slide when schema updates
                setCurrentSlide(0);
            }
        };

        updateSchema();
    }, [schemas, enums]);

    // Helper function to filter schema properties for the current slide
    const getSchemaForSlide = (schema, slideIndex) => {
        // if (!schema?.ui_schema?.['ui:slider']) {
        //     console.warn('No slider configuration found in ui_schema');
        //     return schema; // Return full schema if no slider config
        // }

        // const slides = schema.ui_schema['ui:slider'];
        // if (slideIndex >= slides.length) {
        //     console.warn('Slide index out of range, returning full schema');
        //     return schema; // Default to full schema if slide out of range
        // }

        // const fieldsForSlide = slides[slideIndex];

        if (!schema?.ui_schema?.['ui:slider']) {
            console.warn('No slider configuration found in ui_schema');
            return schema; // Return the full schema or handle this case appropriately
        }

        const slides = schema.ui_schema['ui:slider'];
        if (slideIndex < 0 || slideIndex >= slides.length) {
            console.warn('Slide index out of range');
            return schema; // Handle edge cases by returning full schema or another default
        }

        const fieldsForSlide = slides[slideIndex];
        console.log('Fields for current slide:', fieldsForSlide);
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
    //TODO:check organization_id can be dynamic like proj id, user id,group id , team id for data in session
    console.log("sdc", schemas);
    const handleAddOrEdit = async (formData, editItem) => {
        const { mainTable, allocationsTable } = schemas.data_config; // Use schemas.data_config
        try {
            let mainTableData = {
                [mainTable.column]: formData
                , organization_id: session?.user?.organization_id
            };

            if (editItem) {
                const { error: updateError } = await supabase
                    .from(mainTable.table)
                    .update(mainTableData)
                    .eq('id', editItem);

                if (updateError) {
                    notification.error({ message: 'Failed to update main table' });
                    return;
                }
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from(mainTable.table)
                    .insert([mainTableData])
                    .select('*');

                if (insertError) {
                    notification.error({ message: 'Failed to add to main table' });
                    return;
                }

                const newEntityId = insertData[0]?.id;

                if (allocationsTable) { // Check if allocationsTable is defined
                    await handleAllocations(formData, allocationsTable, newEntityId);
                }

                notification.success({ message: 'Added successfully' });
            }
        } catch (error) {
            console.error("Error in handleAddOrEdit:", error);
            notification.error({ message: 'An error occurred during save operation.' });
        }
    };


    const handleAllocations = async (formData, allocationsTable, mainEntityId) => {
        try {
            const allocations = formData[allocationsTable.rows] || []; // Get allocations array

            if (allocations.length > 0) {
                const allocationsToInsert = allocations.map(allocation => {
                    const mappedAllocation = {};
                    for (const key in allocationsTable.mapping) {
                        mappedAllocation[key] = allocation[allocationsTable.mapping[key]];
                    }
                    // Add additional fields
                    for (const key in allocationsTable.additionalFields) {
                        mappedAllocation[key] = allocationsTable.additionalFields[key] === 'mainEntityId' ? mainEntityId : allocationsTable.additionalFields[key];
                    }
                    if (allocationsTable.wholeRowColumn) {
                        mappedAllocation[allocationsTable.wholeRowColumn] = allocation;
                    }
                    return mappedAllocation;
                });

                const { error: allocationsError } = await supabase
                    .from(allocationsTable.table)
                    .insert(allocationsToInsert);

                if (allocationsError) {
                    console.error("Error inserting allocations:", allocationsError);
                    notification.error({ message: 'Failed to save allocations.' });
                }
            }
        } catch (error) {
            console.error("Error in handleAllocations:", error);
            notification.error({ message: 'An error occurred while saving allocations.' });
        }
    };


    // Submission handler
    const onSubmit = async (e) => {
        console.log('Form submitted with data:', e?.formData);
        // onFinish(e?.formData);
        if (dynamicSubmit) {
            await handleAddOrEdit(e?.formData, updateId); // Call simplified function
        }
        if (onFinish) {
            onFinish(e?.formData);
        }
    };

    // Logging helper
    const log = (type) => console.log.bind(console, type);

    // Filter schema for the current slide, but pass all formData
    let dynamicSchema = schema && getSchemaForSlide(schema, currentSlide);
    console.log('Dynamic schema for current slide:', dynamicSchema);

    // Navigation functions
    const nextSlide = () => {
        if (currentSlide < (schema.ui_schema['ui:slider'].length - 1)) {
            setCurrentSlide(currentSlide + 1);
            console.log('Moved to next slide:', currentSlide + 1);
        } else {
            console.log('Already on the last slide');
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
            console.log('Moved to previous slide:', currentSlide - 1);
        } else {
            console.log('Already on the first slide');
        }
    };

    // Render logic
    return (
        <>
            {dynamicSchema ? (
                <div>
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        {schema?.ui_schema?.['ui:slider'] && currentSlide > 0 && (
                            <Button onClick={prevSlide} style={{ marginRight: 10 }}>Previous</Button>
                        )}
                        {schema?.ui_schema?.['ui:slider'] && (
                            currentSlide < schema.ui_schema['ui:slider'].length - 1 ? (
                                <Button onClick={nextSlide}>Next</Button>
                            ) : (
                                <Button type="primary" htmlType="submit">Submit</Button>
                            )
                        )}
                    </div>
                    {schema ? (
                        <Form ref={formRef}
                            schema={dynamicSchema?.data_schema}
                            widgets={Widgets}
                            validator={validator}
                            templates={{ ObjectFieldTemplate }}
                            onChange={onChange}
                            // formData={formData}
                            formData={Object.fromEntries(
                                Object.entries(formData).filter(([key]) => dynamicSchema.data_schema.properties[key])
                            )}
                            uiSchema={dynamicSchema?.ui_schema}
                            onSubmit={onSubmit}
                            onError={log('errors')}
                        />
                    ) : (
                        <Spin spinning={true}></Spin> // Or some loading indicator
                    )}

                </div>
            ) : (
                <Spin spinning={true}></Spin>
            )}
        </>
    );
};

export default DynamicForm;
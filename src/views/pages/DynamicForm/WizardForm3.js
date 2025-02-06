import React, { useState, useEffect } from 'react';
import { Form as AntdForm, Button, Slider } from 'antd';
import { Spin } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import Widgets from "./Widgets";
import ObjectFieldTemplate from "./ObjectFieldTemplate.tsx";
import Form from "@rjsf/antd";
import validator from "@rjsf/validator-ajv8";

const DynamicForm = ({ schemas, formData, updateId, onFinish }) => {
    const [enums, setEnums] = useState(null);
    const [schema, setSchema] = useState(null);
    const [userId, setUserId] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { session } = useSelector((state) => state.auth);

    const getOrganization = async () => {
        const { data, error } = await supabase.from('organizations').select('*').eq('name', process.env.REACT_APP_ORGANIZATION_APP || 'Dev').single();
        if (data) {
            setOrganization(data);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                setUserId(session?.user?.id);
            });
        };
        getUser();
        getOrganization();
    }, []);

    useEffect(() => {
        const getEnums = async () => {
            let { data, error } = await supabase.from('enums').select('*');
            console.log("Enums", error, data);
            if (data) {
                setEnums(data);
            }
        };
        if (organization) {
            getEnums();
        }
    }, [organization]);

    useEffect(() => {
        const fetchDataForDropdown = async (table, column, filters, noId) => {
            try {
                const normalizedColumn = column.replace('-', '.');
                let query = supabase
                    .from(table)
                    .select(`${noId ? "" : "id, "}${normalizedColumn.includes('.') ? `${normalizedColumn} ->>` : normalizedColumn}`)
                    .eq('organization_id', session?.user?.organization_id || organization?.id);

                filters?.forEach(filter => {
                    const { key, operator, value } = filter;
                    if (query[operator]) {
                        if (operator === 'in' && Array.isArray(value)) {
                            query = query.in(key, value);
                        } else {
                            query = query[operator](key, value);
                        }
                    } else {
                        console.warn(`Unsupported filter operator: ${operator}`);
                    }
                });

                const { data, error } = await query;
                if (error) {
                    console.error("Error fetching data from Supabase:", error);
                    return [];
                }

                return data;
            } catch (error) {
                console.error("Error fetching data:", error);
                return [];
            }
        };

        const replaceEnums = async (obj) => {
            const keys = Object.keys(obj);
            for (let key of keys) {
                const enumValue = obj[key]?.enum;
                const noId = enumValue?.no_id;
                const filterConditions = obj[key]?.enum?.filters || [];

                if (enumValue) {
                    if (typeof enumValue === 'string') {
                        const foundEnum = enums?.find((e) => e.name === enumValue);
                        if (foundEnum) {
                            obj[key] = {
                                type: "string",
                                title: obj[key].title,
                                enum: foundEnum.options
                            };
                        }
                    } else if (typeof enumValue === 'object' && enumValue.table && enumValue.column) {
                        const options = await fetchDataForDropdown(enumValue.table, enumValue.column, filterConditions, noId);
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
                setSchema(schemaCopy);
            }
        };

        updateSchema();
    }, [schemas, enums, session]);

    const fields = schema?.ui_schema?.ui_order || [];

    // Determine the current slide's fields
    const findCurrentSlideEnd = () => {
        if (!schema || !schema.ui_schema || !schema.ui_schema.slides || !fields.length) return 0;

        const slides = schema.ui_schema.slides;
        let endIndex = 0;
        for (let i = 0; i < slides.length; i++) {
            const slideEndIndex = fields.indexOf(slides[i]);
            if (slideEndIndex >= currentIndex) {
                endIndex = slideEndIndex;
                break;
            }
            if (i === slides.length - 1) {
                endIndex = fields.length - 1;
            }
        }
        return endIndex;
    };

    const currentSlideEndIndex = findCurrentSlideEnd();
    const currentFields = fields.slice(currentIndex, currentSlideEndIndex + 1);

    const currentSchema = schema ? {
        type: 'object',
        properties: currentFields.reduce((acc, field) => {
            if (schema.data_schema.properties[field]) {
                acc[field] = schema.data_schema.properties[field];
            }
            return acc;
        }, {}),
        required: schema.data_schema.required?.filter(req => currentFields.includes(req)) || []
    } : { type: 'object', properties: {} };

    const currentUiSchema = schema?.ui_schema ? currentFields.reduce((acc, field) => {
        acc[field] = schema.ui_schema[field] || {};
        return acc;
    }, {}) : {};

    const handleSubmit = (values) => {
        console.log('Submitted data:', { ...formData, ...values });
        onFinish({ ...formData, ...values });
    };

    const handleChange = ({ formData: newFormData }) => {
        // Merge new form data with existing data
        const updatedFormData = { ...formData, ...newFormData };
        // Update the form data in parent component if needed
    };

    const handleNext = () => {
        if (currentIndex < fields.length - 1) {
            const nextSlideEnd = findCurrentSlideEnd();
            setCurrentIndex(nextSlideEnd + 1); // Move to the next field after the slide end
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            const prevSlide = schema?.ui_schema?.slides?.reduce((acc, slide) => {
                const slideIndex = fields.indexOf(slide);
                return slideIndex < currentIndex && slideIndex > acc ? slideIndex : acc;
            }, -1);
            setCurrentIndex(prevSlide !== -1 ? prevSlide : 0);
        }
    };

    return (
        schema ? (
            <AntdForm onFinish={handleSubmit}>
                <Form
                    schema={currentSchema}
                    widgets={Widgets}
                    validator={validator}
                    templates={{ ObjectFieldTemplate }}
                    uiSchema={currentUiSchema}
                    formData={formData}
                    onChange={handleChange}
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
                </Form>
            </AntdForm>
        ) : <Spin spinning={true} />
    );
};

export default DynamicForm;
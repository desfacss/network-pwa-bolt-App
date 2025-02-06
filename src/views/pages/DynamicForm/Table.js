import React, { useEffect } from "react";
import { Table, InputNumber, DatePicker, Input, Switch, Select, Button } from "antd";
import moment from "moment";

const EditableTableWidget2 = ({ schema, value, onChange, formContext }) => {
    const { formData, definitions } = formContext; // Access definitions for reusable schemas

    useEffect(() => {
        const initializeRow = () => {
            const refSchema = schema.items.$ref
                ? definitions[schema.items.$ref?.replace("#/definitions/", "")]
                : schema.items;

            return Object.keys(refSchema.properties).reduce((acc, key) => {
                acc[key] = refSchema.properties[key].default || null;
                return acc;
            }, {});
        };

        if (value.length < schema.minItems) {
            const initialRows = Array.from({ length: schema.minItems }, () => initializeRow());
            onChange(initialRows);
        } else {
            const validRows = value.filter((row) => row && Object.keys(row).length > 0);
            if (validRows.length !== value.length) {
                onChange(validRows); // Clean up invalid rows
            }
        }
    }, [value, schema.items, schema.minItems, definitions, onChange]);

    const handleInputChange = (rowIndex, field, newValue) => {
        const updatedData = [...value];
        updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: newValue };
        // onChange(updatedData);
    };

    const columns = Object.entries(definitions[schema.items.$ref.replace("#/definitions/", "")]?.properties || {}).map(
        ([key, property]) => {
            const { type, format, enum: options, enumNames } = property;
            return {
                title: property.title || key,
                dataIndex: key,
                key,
                render: (text, _, rowIndex) => {
                    if (type === "boolean") {
                        return (
                            <Switch
                                checked={text}
                                onChange={(checked) => handleInputChange(rowIndex, key, checked)}
                            />
                        );
                    }
                    if (type === "number") {
                        return (
                            <InputNumber
                                value={text}
                                onChange={(value) => handleInputChange(rowIndex, key, value)}
                            />
                        );
                    }
                    if (format === "date-time") {
                        return (
                            <DatePicker
                                value={text ? moment(text) : null}
                                onChange={(date) =>
                                    handleInputChange(rowIndex, key, date ? date.toISOString() : null)
                                }
                            />
                        );
                    }
                    if (options) {
                        return (
                            <Select
                                value={text}
                                onChange={(value) => handleInputChange(rowIndex, key, value)}
                                options={options.map((option, i) => ({
                                    label: (enumNames && enumNames[i]) || option,
                                    value: option,
                                }))}
                            />
                        );
                    }
                    return (
                        <Input
                            value={text}
                            onChange={(e) => handleInputChange(rowIndex, key, e.target.value)}
                        />
                    );
                },
            };
        }
    );

    const actionColumn = {
        title: "Actions",
        key: "actions",
        render: (_, __, rowIndex) => (
            <Button danger onClick={() => handleDeleteRow(rowIndex)}>
                Delete
            </Button>
        ),
    };

    const tableColumns = [...columns, actionColumn];

    const handleAddRow = () => {
        const refSchema = schema.items.$ref
            ? definitions[schema.items.$ref.replace("#/definitions/", "")]
            : schema.items;

        const newRow = Object.keys(refSchema.properties).reduce((acc, key) => {
            acc[key] = refSchema.properties[key].default || null;
            return acc;
        }, {});
        onChange([...value, newRow]);
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedData = value.filter((_, index) => index !== rowIndex);
        onChange(updatedData);
    };

    return (
        <div>
            <Table
                dataSource={value.map((row, index) => ({ ...row, key: index }))}
                columns={tableColumns}
                pagination={false}
            />
            <Button type="primary" onClick={handleAddRow} style={{ marginTop: 16 }}>
                Add Row
            </Button>
        </div>
    );
};

export default EditableTableWidget2;

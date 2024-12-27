import React, { useEffect } from "react";
import { Table, InputNumber, DatePicker, Input, Switch, Select, Button } from "antd";
import moment from "moment";

const EditableTableWidget2 = ({ schema, value, onChange, formContext }) => {
    console.log("sc", schema, value)
    const { formData } = formContext;

    // // Ensure table starts with only one row
    // useEffect(() => {
    //     if (value.length === 0 || value.length > 1) {
    //         const initialRow = schema.items.reduce((acc, item) => {
    //             acc[item.field] = item.default || null;
    //             return acc;
    //         }, {});
    //         initialRow[schema?.ref_key] = (formData && formData[schema?.ref]) || null;
    //         onChange([initialRow]); // Force reset to 1 row
    //     }
    // }, [value, schema.items, formData, onChange]);

    useEffect(() => {
        const validRows = value.filter((row) => row && Object.keys(row).length > 0);

        if (validRows.length === 0) {
            const initialRow = schema.items.reduce((acc, item) => {
                acc[item.field] = item.default || null;
                return acc;
            }, {});
            initialRow[schema?.ref_key] = (formData && formData[schema?.ref]) || null;
            onChange([initialRow]); // Initialize with 1 valid row
        } else if (validRows.length !== value.length) {
            onChange(validRows); // Clean up null rows
        }
    }, [value, schema.items, formData, onChange]);



    // Update all rows when the project_id changes
    useEffect(() => {
        if (formData && formData[schema.ref] !== undefined) {
            const updatedData = value.map((row) => ({
                ...row,
                [schema?.ref_key]: formData[schema?.ref],
            }));
            onChange(updatedData);
        }
    }, [formData, value, onChange]);

    const handleInputChange = (rowIndex, field, newValue) => {
        console.log(rowIndex, field, newValue)
        const updatedData = [...value];
        updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: newValue };
        onChange(updatedData);
    };

    const columns = schema.items.map((item) => {
        const { title, field, type, format, enum: options, enumNames } = item;
        return {
            title,
            dataIndex: field,
            key: field,
            render: (text, _, rowIndex) => {
                if (type === "boolean") {
                    return (
                        <Switch
                            checked={text}
                            onChange={(checked) => handleInputChange(rowIndex, field, checked)}
                        />
                    );
                }
                if (type === "number") {
                    return (
                        <InputNumber
                            value={text}
                            onChange={(value) => handleInputChange(rowIndex, field, value)}
                            disabled={field === "expensed_hours"}
                        />
                    );
                }
                if (format === "date-time") {
                    return (
                        <DatePicker
                            value={text ? moment(text) : null}
                            onChange={(date) =>
                                handleInputChange(rowIndex, field, date ? date.toISOString() : null)
                            }
                        />
                    );
                }
                if (options) {
                    return (
                        <Select
                            value={text}
                            onChange={(value) => handleInputChange(rowIndex, field, value)}
                            options={options?.map((option, i) => ({ label: (enumNames && enumNames[i]) ?? option, value: option }))}
                            style={{ width: "100%" }}
                        />
                    );
                }
                return (
                    <Input
                        value={text}
                        onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
                    />
                );
            },
        };
    });

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
        const newRow = schema.items.reduce((acc, item) => {
            acc[item.field] = item.default || null;
            return acc;
        }, {});
        newRow[schema?.ref_key] = formData[schema?.ref] || null;
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

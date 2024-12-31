import React, { useEffect } from "react";
import { Button, Table, Input, Select, Checkbox, DatePicker } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const EditableTableWidget = ({
    value = [],
    schema,
    uiSchema,
    onChange,
}) => {
    const uiOptions = uiSchema["ui:options"] || {};
    const { addable = true, removable = true } = uiOptions;

    // // Ensure there's only one row by default when `value` is empty
    // useEffect(() => {
    //     if (value.length === 0) {
    //         const defaultRow = {};
    //         Object.keys(schema.items.properties).forEach((key) => {
    //             defaultRow[key] = schema.items.properties[key].default || null;
    //         });
    //         onChange([defaultRow]); // Set to a single default row
    //     }
    // }, [value, schema, onChange]);

    const handleAddRow = () => {
        const newRow = {};
        Object.keys(schema.items.properties).forEach((key) => {
            newRow[key] = schema.items.properties[key].default || null;
        });
        onChange([...value, newRow]);
    };

    const handleDeleteRow = (index) => {
        const newData = value.filter((_, idx) => idx !== index);
        onChange(newData);
    };

    const handleChangeCell = (index, field, newValue) => {
        const newData = [...value];
        newData[index] = { ...newData[index], [field]: newValue };
        onChange(newData);
    };

    const columns = [
        ...Object.entries(schema.items.properties).map(([key, fieldSchema]) => ({
            title: fieldSchema.title || key,
            dataIndex: key,
            render: (_, record, index) => {
                const cellValue = record[key];
                if (fieldSchema.format === "date-time") {
                    return (
                        <DatePicker
                            value={cellValue ? dayjs(cellValue) : null}
                            onChange={(date) =>
                                handleChangeCell(index, key, date ? date.toISOString() : null)
                            }
                        />
                    );
                }
                if (fieldSchema.enum) {
                    return (
                        <Select
                            value={cellValue}
                            onChange={(value) => handleChangeCell(index, key, value)}
                            options={fieldSchema.enum.map((option, i) => ({
                                label: fieldSchema?.enumNames[i],
                                value: option,
                            }))}
                        />
                    );
                }
                if (fieldSchema.type === "string") {
                    return (
                        <Input
                            value={cellValue || ""}
                            onChange={(e) => handleChangeCell(index, key, e.target.value)}
                        />
                    );
                }
                if (fieldSchema.type === "boolean") {
                    return (
                        <Checkbox
                            checked={!!cellValue}
                            onChange={(e) => handleChangeCell(index, key, e.target.checked)}
                        />
                    );
                }
                return <Input value={cellValue || ""} />;
            },
        })),
        {
            title: "Action",
            key: "action",
            render: (_, __, index) =>
                removable ? (
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteRow(index)}
                    />
                ) : null,
        },
    ];

    return (
        <div>
            <Table
                dataSource={value.map((item, index) => ({
                    ...item,
                    key: index,
                }))}
                columns={columns}
                pagination={false}
            />
            {addable && (
                <Button
                    type="dashed"
                    onClick={handleAddRow}
                    style={{ marginTop: "10px", width: "100%" }}
                    icon={<PlusOutlined />}
                >
                    Add Row
                </Button>
            )}
        </div>
    );
};

export default EditableTableWidget;

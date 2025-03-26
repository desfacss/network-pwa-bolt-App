import React, { useEffect, useState } from "react";
import { DatePicker, Input, Select, Tag } from "antd";
import dayjs from "dayjs";
import EditableTableWidget from "./TableWidget"; // Assuming this is the correct import
import { CheckOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

// Date Range Picker Widget
const DateRangePickerWidget = ({ value, onChange, readonly }) => {
    const handleChange = (dates, dateStrings) => {
        if (!readonly) {
            onChange(dateStrings); // Only update if not readonly
        }
    };

    return (
        <RangePicker
            value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
            onChange={handleChange}
            disabled={readonly} // Disable the picker when readonly
        />
    );
};

// Date-Time Range Picker Widget
const DateTimeRangePickerWidget = ({ value, onChange, readonly }) => {
    const handleChange = (dates, dateStrings) => {
        if (!readonly) {
            onChange(dateStrings); // Only update if not readonly
        }
    };

    return (
        <RangePicker
            showTime
            value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
            onChange={handleChange}
            disabled={readonly} // Disable the picker when readonly
        />
    );
};

// Tags Widget
const TagsWidget = ({ options, value, onChange, id, schema, readonly }) => {
    const { enumOptions } = options;

    const handleChange = (selectedValues) => {
        if (!readonly) {
            console.log("Selected Values:", selectedValues);
            onChange(selectedValues);
        }
    };

    return (
        <Select
            id={id}
            showSearch
            mode="tags"
            style={{ width: "100%" }}
            value={value || []}
            onChange={handleChange}
            tokenSeparators={[","]}
            disabled={readonly} // Disable the Select when readonly
            options={enumOptions?.map((option) => ({
                value: option?.value,
                label: option?.label,
            }))}
        />
    );
};

// Select Custom Widget
const SelectCustomWidget = ({ options, value, onChange, onBlur, onFocus, readonly }) => {
    const { enumOptions, placeholder, allowClear, mode, showSearch, optionFilterProp } = options;

    return (
        <Select
            value={value}
            onChange={readonly ? undefined : onChange} // Prevent changes when readonly
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            allowClear={allowClear || true}
            mode={mode || "multiple"}
            showSearch={showSearch || true}
            optionFilterProp={optionFilterProp || "children"}
            style={{ width: "100%" }}
            disabled={readonly} // Disable the Select when readonly
        >
            {enumOptions?.map(({ value, label }) => (
                <Select.Option key={value} value={value}>
                    {label}
                </Select.Option>
            ))}
        </Select>
    );
};

// Web Widget
const WebWidget = ({ value, onChange, readonly }) => {
    const [inputValue, setInputValue] = useState(value ? value.replace("https://", "").replace(".com", "") : "");

    useEffect(() => {
        // Sync inputValue with value prop when it changes externally
        setInputValue(value ? value.replace("https://", "").replace(".com", "") : "");
    }, [value]);

    const handleChange = (e) => {
        if (!readonly) {
            const newValue = e.target.value;
            setInputValue(newValue);
            onChange("https://" + newValue + ".com");
        }
    };

    return (
        <Input
            addonBefore="https://"
            addonAfter=".com"
            value={inputValue}
            onChange={handleChange}
            placeholder="example"
            readOnly={readonly} // Use HTML readOnly attribute
        />
    );
};

// Selectable Tags Widget
const SelectableTags = ({ options, value, onChange, readonly }) => {
    const { enumOptions, maxItems, title } = options;
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        if (value) {
            setSelectedTags(Array.isArray(value) ? value : [value]);
        } else {
            setSelectedTags([]);
        }
    }, [value, enumOptions]);

    const handleTagClick = (tag) => {
        if (readonly) return; // Prevent changes when readonly

        const isSelected = selectedTags.includes(tag);
        let newTags = [...selectedTags];

        if (isSelected) {
            newTags = newTags.filter((t) => t !== tag);
        } else if (newTags.length < (maxItems || 100)) {
            newTags.push(tag);
        } else {
            return;
        }

        setSelectedTags(newTags);
        onChange(newTags);
    };

    return (
        <div>
            <div>
                {enumOptions?.map((tag) => {
                    const isSelected = selectedTags.includes(tag.value);
                    return (
                        <Tag
                            key={tag.value}
                            onClick={() => handleTagClick(tag.value)}
                            style={{
                                margin: "5px",
                                cursor: readonly ? "default" : "pointer", // Disable cursor when readonly
                                display: "inline-flex",
                                alignItems: "center",
                            }}
                            className={isSelected ? "selected-tag" : ""}
                        >
                            <CheckOutlined
                                style={{ marginRight: "2px", color: "green", visibility: "hidden" }}
                            />
                            {tag.label}
                            <CheckOutlined
                                style={{
                                    marginLeft: "2px",
                                    color: "green",
                                    visibility: !isSelected && "hidden",
                                }}
                            />
                        </Tag>
                    );
                })}
            </div>

            <style jsx>{`
                .selected-tag {
                    border-color: #1890ff;
                    background-color: #e6f7ff;
                }
            `}</style>
        </div>
    );
};

export default {
    TagsWidget,
    SelectCustomWidget,
    WebWidget,
    DateRangePickerWidget,
    DateTimeRangePickerWidget,
    EditableTableWidget, // Note: EditableTableWidget needs its own readonly handling
    SelectableTags,
};
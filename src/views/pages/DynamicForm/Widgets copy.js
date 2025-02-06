import React, { useEffect, useState } from "react";
import { DatePicker, Input, Select, Tag } from "antd";
import dayjs from "dayjs";
// import EditableTableWidget from "./EditableTable";
// import EditableTableWidget2 from "./Table";
import EditableTableWidget from "./TableWidget";
import { CheckOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// Date Range Picker Widget
const DateRangePickerWidget = (props) => {
    const { value, onChange } = props;

    const handleChange = (dates, dateStrings) => {
        onChange(dateStrings); // Sends the selected date range as strings
    };

    return (
        <RangePicker
            value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
            onChange={handleChange}
        />
    );
};

// Date-Time Range Picker Widget
const DateTimeRangePickerWidget = (props) => {
    const { value, onChange } = props;

    const handleChange = (dates, dateStrings) => {
        onChange(dateStrings); // Sends the selected date-time range as strings
    };

    return (
        <RangePicker
            showTime
            value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
            onChange={handleChange}
        />
    );
};


const TagsWidget = ({ value, onChange, id, schema }) => {
    const options = React.useMemo(() => schema?.options || [], [schema]);

    const handleChange = (selectedValues) => {
        console.log("Selected Values:", selectedValues);
        onChange(selectedValues);
        // // Optional: Validate against schema.enum if needed
        // const validValues = selectedValues.filter((val) =>
        //     options.includes(val)
        // );
        // onChange(validValues); // Pass validated values
    };

    return (
        <Select
            id={id}
            showSearch
            mode="tags"
            style={{ width: "100%" }}
            value={value || []} // Ensure it's always an array
            onChange={handleChange}
            tokenSeparators={[","]}
            options={options.map((option) => ({
                value: option,
                label: option,
            }))}
        />
    );
};

const SelectCustomWidget = ({ options, value, onChange, onBlur, onFocus }) => {
    const { enumOptions, placeholder, allowClear, mode, showSearch, optionFilterProp } = options;

    return (
        <Select
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            allowClear={allowClear || true}
            mode={mode || "multiple"} // Supports "multiple" and "tags"
            showSearch={showSearch || true}
            optionFilterProp={optionFilterProp || "children"} // Ensure filtering works
            style={{ width: "100%" }}
        >
            {enumOptions?.map(({ value, label }) => (
                <Select.Option key={value} value={value}>
                    {label}
                </Select.Option>
            ))}
        </Select>
    );
};


const WebWidget = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(value || '');

    const handleChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange('https://' + newValue + '.com');
    };

    return (
        <Input
            addonBefore="https://"
            addonAfter=".com"
            value={inputValue}
            onChange={handleChange}
            placeholder="example"
        />
    );
};

// const SelectableTags = ({ options, value, onChange }) => {
//     const { enumOptions, items, maxItems, title } = options; // Destructure from options
//     const [selectedTags, setSelectedTags] = useState(value || []);

//     const handleTagClick = (tag) => {
//         console.log("tags", value, tag);
//         const isSelected = selectedTags?.includes(tag);

//         let newTags;
//         if (isSelected) {
//             newTags = selectedTags?.filter((t) => t !== tag);
//         } else if (selectedTags?.length < maxItems) {
//             newTags = [...selectedTags, tag];
//         } else {
//             return; // Prevent adding more tags if the limit is reached.
//         }

//         setSelectedTags(newTags);
//         onChange(newTags);
//     };

//     return (
//         <div>
//             <label>{title} (Max {maxItems})</label><br />
//             <div>
//                 {enumOptions?.map((tag) => {
//                     const isSelected = selectedTags?.includes(tag?.value);
//                     return (
//                         <Tag
//                             key={tag?.value}
//                             onClick={() => handleTagClick(tag?.value)}
//                             style={{ margin: '5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
//                             className={isSelected ? 'selected-tag' : ''}
//                         >
//                             <CheckOutlined style={{ marginRight: '2px', color: 'green', visibility: 'hidden' }} />
//                             {tag?.label}
//                             <CheckOutlined style={{ marginLeft: '2px', color: 'green', visibility: !isSelected && 'hidden' }} />
//                         </Tag>
//                     );
//                 })}
//             </div>

//             <style jsx>{`
//                 .selected-tag {
//                     border-color: #1890ff;
//                     background-color: #e6f7ff;
//                 }
//             `}</style>
//         </div>
//     );
// };

const SelectableTags = ({ options, value, onChange }) => {
    const { enumOptions, maxItems, title } = options;
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        console.log("qe", value);
        if (value) {
            // Correctly handle initial value from rjsf.  Convert to array if single value.
            setSelectedTags(Array.isArray(value) ? value : [value]);
        } else {
            setSelectedTags([]); //Important. If value is null or undefined, initialize it to an empty array.
        }

    }, [value, enumOptions]); // Add enumOptions to the dependency array.

    const handleTagClick = (tag) => {
        console.log("kl", tag);
        const isSelected = selectedTags.includes(tag);
        let newTags = [...selectedTags]; // Create a copy to avoid directly mutating state

        if (isSelected) {
            newTags = newTags.filter((t) => t !== tag);
        } else if (newTags.length < maxItems) {
            newTags.push(tag);
        } else {
            return;
        }

        setSelectedTags(newTags);
        onChange(newTags);
    };

    return (
        <div>
            <label>{title} (Max {maxItems})</label><br />
            <div>
                {enumOptions?.map((tag) => {
                    const isSelected = selectedTags.includes(tag.value); // Access tag.value directly
                    return (
                        <Tag
                            key={tag.value}
                            onClick={() => handleTagClick(tag.value)}
                            style={{ margin: '5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            className={isSelected ? 'selected-tag' : ''}
                        >
                            <CheckOutlined style={{ marginRight: '2px', color: 'green', visibility: isSelected ? 'visible' : 'hidden' }} /> {/* Simplify visibility logic */}
                            {tag.label} {/* Access tag.label directly */}
                            <CheckOutlined style={{ marginLeft: '2px', color: 'green', visibility: !isSelected ? 'visible' : 'hidden' }} /> {/* Simplify visibility logic */}

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
    // EditableTableWidget,

    SelectCustomWidget,

    TagsWidget,
    WebWidget,
    DateRangePickerWidget,
    DateTimeRangePickerWidget,
    EditableTableWidget,
    SelectableTags
};

import React, { useState } from "react";
import { DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";
// import EditableTableWidget from "./EditableTable";
// import EditableTableWidget2 from "./Table";
import EditableTableWidget from "./TableWidget";

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


// const TagsWidget = ({ value, onChange, id, schema }) => {
//     const options = React.useMemo(() => schema?.options || [], [schema]);

//     const handleChange = (selectedValues) => {
//         console.log("Selected Values:", selectedValues);
//         onChange(selectedValues);
//         // // Optional: Validate against schema.enum if needed
//         // const validValues = selectedValues.filter((val) =>
//         //     options.includes(val)
//         // );
//         // onChange(validValues); // Pass validated values
//     };

//     return (
//         <Select
//             id={id}
//             showSearch
//             mode="tags"
//             style={{ width: "100%" }}
//             value={value || []} // Ensure it's always an array
//             onChange={handleChange}
//             tokenSeparators={[","]}
//             options={options.map((option) => ({
//                 value: option,
//                 label: option,
//             }))}
//         />
//     );
// };

const SelectWidget = ({ options, value, onChange, onBlur, onFocus }) => {
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
            {enumOptions.map(({ value, label }) => (
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

export default {
    // TagsWidget,
    WebWidget,
    DateRangePickerWidget,
    DateTimeRangePickerWidget,
    // EditableTableWidget,
    EditableTableWidget,
    SelectWidget
};

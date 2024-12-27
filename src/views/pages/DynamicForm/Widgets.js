import React from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
// import EditableTableWidget from "./EditableTable";
import EditableTableWidget2 from "./Table";

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

export default {
    TagsWidget,
    DateRangePickerWidget,
    DateTimeRangePickerWidget,
    // EditableTableWidget,
    EditableTableWidget2,
};

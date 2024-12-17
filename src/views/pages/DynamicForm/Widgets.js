import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { WidgetProps } from "@rjsf/core";

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

export default {
    DateRangePickerWidget,
    DateTimeRangePickerWidget,
};

import React, { useState } from 'react';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const GlobalSearch = ({ schema, data }) => {
    const { globalSearch, fields } = schema;

    const [filters, setFilters] = useState(
        globalSearch.reduce((acc, field) => {
            acc[field] = null;
            return acc;
        }, {})
    );

    const handleDateChange = (field, dates) => {
        setFilters((prev) => ({
            ...prev,
            [field]: dates,
        }));
    };

    const handleDropdownChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const renderField = (field) => {
        const fieldInfo = fields.find((f) => f.fieldName === field);

        if (!fieldInfo) return null;

        if (field.includes('date')) {
            // Render Date Range Picker for date fields
            return (
                <div key={field} style={{ margin: '10px' }}>
                    {fieldInfo.fieldName.replace('_', ' ').toUpperCase()}:{' '}
                    <RangePicker
                        value={[
                            dayjs().subtract(7, 'days'),
                            dayjs().add(7, 'days'),
                        ]}
                        allowClear={false}
                        onChange={(dates) => handleDateChange(field, dates)}
                        format="YYYY-MM-DD"
                    />
                </div>
            );
        } else {
            // Render Dropdown for other fields (e.g., status)
            const uniqueValues = [
                ...new Set(data.map((item) => item[field])),
            ];
            return (
                <div key={field} style={{ margin: '10px' }}>
                    {fieldInfo.fieldName.replace('_', ' ').toUpperCase()}:{' '}
                    <Select
                        placeholder={`Select ${fieldInfo.fieldName}`}
                        style={{ width: 200 }}
                        onChange={(value) => handleDropdownChange(field, value)}
                        allowClear
                    >
                        {uniqueValues.map((value) => (
                            <Option key={value} value={value}>
                                {value}
                            </Option>
                        ))}
                    </Select>
                </div>
            );
        }
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {globalSearch.map((field) => renderField(field))}
        </div>
    );
};

export default GlobalSearch;

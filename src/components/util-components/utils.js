import { DatePicker, Select } from "antd";
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export function camelCaseToTitleCase(str) {
    return str
        ?.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space before each capital letter
        ?.replace(/^./, char => char?.toUpperCase()) // Capitalize the first letter of the string
        ?.replace(/ (\w)/g, (_, char) => ` ${char?.toUpperCase()}`); // Capitalize letters after spaces
}

export function snakeCaseToTitleCase(str) {
    return str
        ?.split('_') // Split the string by underscores
        ?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase()) // Capitalize the first letter of each word
        ?.join(' '); // Join the words with spaces
}

export const renderFilters = (config, data) => {
    return config?.map((filter, index) => {
        switch (filter?.type) {
            case "dateRange": {
                // Calculate the start and end dates dynamically
                const [startOffset, endOffset] = filter?.range;
                const defaultRange = [
                    dayjs().add(startOffset, "days"),
                    dayjs().add(endOffset, "days"),
                ];
                return (
                    <div key={index} style={{ marginRight: 16 }}>
                        {filter.label}:{" "}
                        <RangePicker
                            value={defaultRange}
                            allowClear={false}
                            onChange={(dates) => {
                                console.log(`Filter ${filter?.field} changed:`, dates);
                                // Implement filtering logic here
                            }}
                            format="YYYY-MM-DD"
                        />
                    </div>
                );
            }

            case "select": {
                // Dynamically calculate options from data
                const options = [...new Set(data?.map((item) => item[filter?.field]))];
                return (
                    <div key={index} style={{ marginRight: 16 }}>
                        {filter.label}:{" "}
                        <Select
                            placeholder={`Select ${filter.label}`}
                            style={{ width: 200 }}
                            onChange={(value) => {
                                console.log(`Filter ${filter?.field} changed:`, value);
                                // Implement filtering logic here
                            }}
                            allowClear
                        >
                            {options?.map((option) => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>
                    </div>
                );
            }

            default:
                return null;
        }
    });
};

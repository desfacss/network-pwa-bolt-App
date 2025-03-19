import { Select } from 'antd';
import React, { useState } from 'react';
import DynamicViews from '../DynamicViews';
const { Option } = Select;

const Index = () => {
    const [industrySectorFilter, setIndustrySectorFilter] = useState(null);
    const [legalStructureFilter, setLegalStructureFilter] = useState(null);

    const industrySectorOptions = [
        "Agriculture & ESG",
        "Consumer Goods",
        "E-commerce, D2C & Retail",
        "Financial Services",
        "IT and Software Services",
        "Logistics & Transport",
        "Manufacturing",
        "Media and Entertainment",
        "Pharma & Healthcare",
        "Professional Services",
        "Public Administration",
        "Real Estate & Construction",
        "Sales and Distribution",
        "Tourism and Hospitality",
        "Utility Services",
        "Others"
    ];

    const legalStructureOptions = [
        "Home Business / Unregistered",
        "Limited Liability Partnership (LLP)",
        "Partnership",
        "Private Limited Company",
        "Public Limited Company",
        "Sole Proprietorship"
    ];

    // Construct fetchFilters based on selected values
    const fetchFilters = [
        industrySectorFilter && { column: 'details.industrySector', value: industrySectorFilter },
        legalStructureFilter && { column: 'details.legalStructure', value: legalStructureFilter },
    ].filter(Boolean);

    // Custom filter components passed as props
    const customFilters = (
        <div style={{ display: 'flex', gap: 8 }}>
            <Select
                placeholder="Select Industry Sector"
                style={{ width: 200 }}
                onChange={setIndustrySectorFilter}
                value={industrySectorFilter}
                allowClear
            >
                {industrySectorOptions.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                ))}
            </Select>
            <Select
                placeholder="Select Legal Structure"
                style={{ width: 200 }}
                onChange={setLegalStructureFilter}
                value={legalStructureFilter}
                allowClear
            >
                {legalStructureOptions.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                ))}
            </Select>
        </div>
    );
    return (
        <DynamicViews entityType={'ib_businesses'} fetchFilters={fetchFilters} customFilters={customFilters} />
    );
}

export default Index;
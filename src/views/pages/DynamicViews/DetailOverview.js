import React from 'react';
import { Card, Divider, Tag, Button, Typography } from 'antd';
import * as Icons from '@ant-design/icons'; // Import all icons dynamically

const { Text, Title } = Typography;

// Helper function to get nested or flat data from an object
const getNestedValue = (obj, path) => {
    // Check if the full path exists as a flat key in the object
    if (path in obj) {
        const value = obj[path];
        // Handle special case for membership_type (object)
        if (path === 'details.membership_type' && typeof value === 'object') {
            return Object.values(value).join(', '); // Convert object to comma-separated string
        }
        return value;
    }
    // Fallback to nested traversal if path is not a direct key
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || 'N/A';
};

// Main Component
const DetailOverview = ({ data, config, openMessageModal }) => {
    // Dynamically resolve icons from @ant-design/icons
    const getIcon = (iconName) => {
        return Icons[iconName] ? React.createElement(Icons[iconName]) : null;
    };

    const renderField = (field) => {
        const value = getNestedValue(data, field.fieldPath);
        const { icon, label, style, webLink, link } = field;

        // Handle special rendering (e.g., tags for membership_type)
        if (style && style.render === 'tag') {
            const values = value.split(', ').map((v) => v.trim()); // Split comma-separated values
            const color = style.colorMapping || {}; // Use colorMapping if provided
            return (
                <div key={field.fieldPath} style={{ marginBottom: 8, textAlign: 'left' }}>
                    <Text>{label}: </Text>
                    {values.map((val, index) => (
                        <Tag
                            key={index}
                            color={color[val.toLowerCase()] || 'gray'}
                            style={{ backgroundColor: style.bgColor, margin: '2px' }}
                            className="tag"
                        >
                            {val}
                        </Tag>
                    ))}
                </div>
            );
        }

        // Handle links (webLink or regular link)
        const content = webLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" style={style}>
                {value}
            </a>
        ) : link ? (
            <a href={link} style={style}>
                {value}
            </a>
        ) : (
            <Text style={style}>{value}</Text>
        );

        return (
            <div key={field.fieldPath} style={{ marginBottom: 8, textAlign: 'left' }}>
                {icon && getIcon(icon)} <Text>{label}: </Text> {content}
            </div>
        );
    };

    const renderGroup = (group) => {
        const sortedFields = group?.fields?.sort((a, b) => a.order - b.order);
        return (
            <div key={group.name} style={{ textAlign: 'left' }}>
                {group?.show_group_name && <Title level={4}>{group.name}</Title>}
                {sortedFields?.map(renderField)}
            </div>
        );
    };

    const renderActions = () => {
        return config?.actions?.map((action) => (
            <Button
                key={action.name}
                icon={action.icon && getIcon(action.icon)}
                style={{ ...action.style, width: '100%', marginBottom: 8 }}
                type='primary'
                className="action-button"
                onClick={() => {
                    if (action.name === 'message') {
                        openMessageModal(data[action.form]); // Trigger modal with data.id
                    } else {
                        alert(`Action: ${action.name} triggered for ID: ${data.id}`); // Fallback
                    }
                }}
            >
                {action?.name?.charAt(0).toUpperCase() + action.name.slice(1)}
            </Button>
        ));
    };

    const sortedGroups = config?.groups?.sort((a, b) => a.order - b.order);

    return (
        <Card className="detail-overview-card">
            {sortedGroups?.map((group, index) => (
                <React.Fragment key={group.name}>
                    {config.dividers.includes(group.name) && index > 0 && <Divider />}
                    {renderGroup(group)}
                </React.Fragment>
            ))}
            <Divider />
            <div className="actions-container">{renderActions()}</div>
        </Card>
    );
};

export default DetailOverview;
import React, { useState, useEffect } from 'react';
import { Card, Divider, Tag, Button, Typography, Switch } from 'antd';
import * as Icons from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';

const { Text, Title } = Typography;

// Helper function to get nested or flat data from an object
const getNestedValue = (obj, path) => {
    if (path in obj) {
        const value = obj[path];
        if (path === 'details.membership_type' && typeof value === 'object') {
            return Object.values(value).join(', ');
        }
        return value || ' - - ';
    }
    const result = path?.split('.')?.reduce((acc, part) => acc && acc[part], obj);
    return result === undefined || result === null || result === '' ? ' - - ' : result;
};

// Main Component
const DetailOverview = ({ data, config, openMessageModal, editable = false, saveConfig }) => {
    const [toggledGroups, setToggledGroups] = useState(new Set());

    // Dynamically resolve icons from @ant-design/icons
    const getIcon = (iconName) => {
        return Icons[iconName] ? React.createElement(Icons[iconName]) : null;
    };

    // Fetch initial toggled groups from Supabase when editable is true
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!editable || !saveConfig) return;

            const { table, column, entity } = saveConfig;
            const { data: result, error } = await supabase
                .from(table)
                .select(column)
                .eq('id', entity)
                .single();

            if (error) {
                console.error('Error fetching initial data from Supabase:', error);
            } else if (result && result[column] && result[column].groups) {
                setToggledGroups(new Set(result[column].groups));
            }
        };

        fetchInitialData();
    }, [editable, saveConfig]);

    // Function to save toggled groups to Supabase
    const saveToSupabase = async (updatedGroups) => {
        if (!editable || !saveConfig) return;

        const { table, column, entity } = saveConfig;
        const payload = { [column]: { groups: Array.from(updatedGroups) } };

        const { error } = await supabase
            .from(table)
            .update(payload)
            .eq('id', entity);

        if (error) {
            console.error('Error saving to Supabase:', error);
        } else {
            console.log('Successfully saved to Supabase:', payload);
        }
    };

    // Toggle handler for groups
    const handleToggle = (groupName) => {
        const newToggledGroups = new Set(toggledGroups);
        if (newToggledGroups.has(groupName)) {
            newToggledGroups.delete(groupName);
        } else {
            newToggledGroups.add(groupName);
        }
        setToggledGroups(newToggledGroups);
        saveToSupabase(newToggledGroups);
    };

    const renderField = (field) => {
        const value = getNestedValue(data, field.fieldPath);
        const { icon, label, style, webLink, link, imagePath } = field;

        // Handle image-only field
        const imageUrl = imagePath ? getNestedValue(data, imagePath) : null;
        if (imagePath && !label && !icon) {
            if (imageUrl && imageUrl !== ' - - ' && !editable) {
                return (
                    <div key={field.fieldPath || imagePath} style={{ marginBottom: 8, textAlign: 'left' }}>
                        <img
                            src={imageUrl}
                            alt="Profile"
                            style={{
                                width: 84,
                                height: 84,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                verticalAlign: 'middle',
                            }}
                        />
                    </div>
                );
            }
            return null; // Skip rendering entirely if imageUrl is ' - - ' or falsy
        }

        // Render image if imagePath is provided and editable is false
        const imageElement = imageUrl && !editable ? (
            <img
                src={imageUrl}
                alt={label || 'Image'}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    verticalAlign: 'middle',
                    marginRight: 8,
                }}
            />
        ) : null;

        // If editable is true and this is an image-related field, skip rendering if imageUrl is ' - - '
        if (editable && imagePath && imageUrl === ' - - ') {
            return null;
        }

        if (style && style.render === 'tag') {
            let values = [];
            if (Array.isArray(value)) {
                values = value.map((v) => v.trim());
            } else if (typeof value === 'string') {
                values = value.split(', ').map((v) => v.trim());
            } else {
                values = [String(value)];
            }
            const color = style.colorMapping || {};
            return (
                <div key={field.fieldPath} style={{ marginBottom: 8, textAlign: 'left' }}>
                    <Text>{label} : </Text>
                    {values.map((val, index) => (
                        <Tag key={index} color={color[val.toLowerCase()] || null}>
                            {val}
                        </Tag>
                    ))}
                </div>
            );
        }

        const isNA = value === ' - - ';
        const content = isNA ? (
            <Text>{value}</Text>
        ) : webLink ? (
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
                {imageElement}
                {icon && getIcon(icon)} <Text>{label} : </Text> {content}
            </div>
        );
    };

    const renderGroup = (group) => {
        const sortedFields = group?.fields?.sort((a, b) => a.order - b.order);
        return (
            <div key={group.name} style={{ textAlign: 'left' }}>
                {group?.show_group_name && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Title level={4} style={{ marginRight: 8 }}>{group.name}</Title>
                        {editable && group?.privacy_control && (
                            <div className="mb-2">
                                <Switch className="mr-2"
                                    checked={toggledGroups.has(group.name)}
                                    onChange={() => handleToggle(group.name)}
                                    checkedChildren={<Icons.EyeInvisibleOutlined />}
                                    unCheckedChildren={<Icons.EyeOutlined />}
                                />
                                {toggledGroups.has(group.name) ? "Hidden" : "Visible"}
                            </div>
                        )}
                    </div>
                )}
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
                type="primary"
                className="action-button"
                onClick={() => {
                    if (action.name === 'message') {
                        openMessageModal(data[action.form]);
                    } else {
                        alert(`Action: ${action.name} triggered for ID: ${data.id}`);
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
            {sortedGroups?.filter(group => {
                const privacyGroups = Object.values(data["privacy.groups"] || {});
                return !privacyGroups?.includes(group.name);
            }).map((group, index) => (
                <React.Fragment key={group.name}>
                    {config.dividers.includes(group.name) && index > 0 && <Divider />}
                    {renderGroup(group)}
                </React.Fragment>
            ))}
            {!editable && (
                <>
                    <Divider />
                    <div className="actions-container">{renderActions()}</div>
                </>
            )}
        </Card>
    );
};

export default DetailOverview;
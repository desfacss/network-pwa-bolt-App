import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Space, Button, Input, Dropdown, Menu, Badge, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GridView = ({ data, viewConfig, fetchConfig, updateData, deleteData, openDrawer }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

//   console.log('View Config:', viewConfig);
  const gridViewConfig = viewConfig?.gridview;

  // Extract layout config
  const {
    cardsPerRow = 4,
    spacing = 16,
    cardStyle = {},
    aspectRatio = 'auto'
  } = gridViewConfig?.layout || {};

  console.log("Layout Config:", { cardsPerRow, spacing, cardStyle, aspectRatio });

  // Calculate responsive column spans
  const getResponsiveSpans = (cardsPerRow) => {
    console.log("Calculating responsive spans for cardsPerRow:", cardsPerRow);
    return {
      xs: 24, // 1 card per row on mobile
      sm: cardsPerRow === 1 ? 24 : 12, // 2 cards per row on small screens
      md: cardsPerRow === 1 ? 24 : Math.floor(24 / Math.min(cardsPerRow, 3)), // 3 cards max on medium
      lg: cardsPerRow === 1 ? 24 : Math.floor(24 / cardsPerRow), // Desired cards per row on large screens
    };
  };

  // Get nested field value
  const getFieldValue = (record, fieldConfig) => {
    console.log("Getting field value for record:", record);
    if (!fieldConfig) return null;

    const value = fieldConfig.fieldPath
      ? fieldConfig.fieldPath.split('-').reduce((obj, key) => obj?.[key], record)
      : record[fieldConfig.fieldName];

    console.log("Field Value for", fieldConfig.fieldName, ":", value);
    return value;
  };

  // Render field based on config
  const renderField = (record, fieldConfig) => {
    console.log("Rendering field for record:", record, "with fieldConfig:", fieldConfig);
    const value = getFieldValue(record, fieldConfig);
    const { style = {} } = fieldConfig;

    // Handle icon
    const IconComponent = fieldConfig.icon ? Icons[fieldConfig.icon] : null;

    // Handle different style renderers
    if (style.render === 'tag' && Array.isArray(value)) {
      console.log("Rendering tags for value:", value);
      return (
        <Space wrap>
          {value.map((tag, index) => (
            <Tag
              key={index}
              color={style.colorMapping?.[tag.toLowerCase()] || 'default'}
            >
              {tag}
            </Tag>
          ))}
        </Space>
      );
    }

    if (style.badge) {
      console.log("Rendering badge for value:", value);
      return (
        <Badge
          status={style.color?.[value.toLowerCase()] || 'default'}
          text={value}
        />
      );
    }

    // Basic text rendering with styles
    const content = (
      <Text
        style={{
          ...style,
          display: 'block',
          whiteSpace: style.ellipsis ? 'nowrap' : 'normal',
          overflow: style.ellipsis ? 'hidden' : 'visible',
          textOverflow: style.ellipsis ? 'ellipsis' : 'clip',
        }}
      >
        {IconComponent && <IconComponent style={{ marginRight: 8 }} />}
        {fieldConfig.label && `${fieldConfig.fieldName}: `}
        {value}
      </Text>
    );

    // Wrap with link if specified
    return fieldConfig.link ? (
      <a onClick={() => navigate(`/app${gridViewConfig.viewLink}${record.id}`)}>{content}</a>
    ) : content;
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    console.log("Filtering data with searchText:", searchText);
    if (!searchText) {
      console.log("No searchText, returning full data.");
      return data;
    }
    const filtered = data.filter(item =>
      gridViewConfig.fields.some(field => {
        const value = getFieldValue(item, field);
        return String(value).toLowerCase().includes(searchText.toLowerCase());
      })
    );
    console.log("Filtered Data:", filtered);
    return filtered;
  }, [data, searchText, gridViewConfig.fields]);

  // Action menu for each card
  const getActionMenu = (record) => (
    <Menu>
      {gridViewConfig.actions?.card?.map(action => (
        <Menu.Item
          key={action}
          onClick={() => {
            console.log(`Executing action '${action}' for record:`, record);
            switch (action) {
              case 'view':
                navigate(`/app${gridViewConfig.viewLink}${record.id}`);
                break;
              case 'edit':
                openDrawer(record);
                break;
              case 'delete':
                deleteData(record);
                break;
              default:
                console.log(`Action ${action} not implemented`);
            }
          }}
        >
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div style={{ maxWidth: gridViewConfig.layout?.maxWidth }}>
      {/* Header with search and actions */}
      {gridViewConfig.showFeatures?.includes('search') && (
        <Space style={{ marginBottom: spacing }}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </Space>
      )}

      {/* Grid Layout */}
      <Row gutter={[spacing, spacing]}>
        {/* {filteredData.map((record, index) => (
          <Col key={record.id || index} {...getResponsiveSpans(cardsPerRow)}>
            <Card
              style={{
                height: aspectRatio === 'auto' ? 'auto' : '100%',
                ...cardStyle,
                cursor: gridViewConfig.fields.some(f => f.link) ? 'pointer' : 'default'
              }}
              actions={gridViewConfig.actions?.card ? [
                <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                  <EllipsisOutlined key="ellipsis" />
                </Dropdown>
              ] : undefined}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {gridViewConfig.fields.map((fieldConfig) => (
                  <div key={fieldConfig.fieldName}>
                    {renderField(record, fieldConfig)}
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        ))} */}

        {/* console.log("ViewConfig before rendering cards:", gridViewConfig); */}

        {filteredData.map((record, index) => {
        const fields = gridViewConfig?.fields || [];
        const hasLink = fields.some(f => f.link);

        console.log("Rendering record:", record);
        console.log("Fields:", fields);
        console.log("Has link:", hasLink);

        return (
            <Col key={record.id || index} {...getResponsiveSpans(cardsPerRow)}>
            <Card
                style={{
                height: aspectRatio === 'auto' ? 'auto' : '100%',
                ...cardStyle,
                cursor: hasLink ? 'pointer' : 'default'
                }}
                actions={gridViewConfig?.actions?.card ? [
                <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                    <EllipsisOutlined key="ellipsis" />
                </Dropdown>
                ] : undefined}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                {/* {fields.map((fieldConfig) => (
                    <div key={fieldConfig.fieldName}>
                    {renderField(record, fieldConfig)}
                    </div>
                ))} */}
                {fields.map((fieldConfig) => (
                    <div key={fieldConfig.fieldName}>
                        {fieldConfig.fieldName === 'details_tags'
                            ? record.details_tags.map(tag => (
                                <Tag key={tag.id} color="blue">
                                    {tag.category_name}
                                </Tag>
                              ))
                            : renderField(record, fieldConfig)
                        }
                    </div>
                ))}
                </Space>
            </Card>
            </Col>
        );
        })}
      </Row>
    </div>
  );
};

export default GridView;

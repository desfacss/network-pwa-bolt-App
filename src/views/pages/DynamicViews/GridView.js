import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Space, Button, Input, Dropdown, Menu, Badge, Tag, Typography, FloatButton } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ResponsiveButton } from 'views/pages/Trial/ResponsiveButton';

const { Title, Text } = Typography;

// // Helper function to trim whitespace - try removing empty white rows - if no value is available
// const trimValue = (value) => {
//   return typeof value === 'string' ? value.trim() : value;
// };

// // Helper function to format array values - adding comma if we have array value - looking like tags (with grey background)
// const formatArrayValue = (value) => {
//   if (Array.isArray(value)) {
//     return value.map(trimValue).filter(Boolean).join(', ');
//   }
//   return trimValue(value);
// };

const GridView = ({ data, viewConfig, fetchConfig, updateData, deleteData, openDrawer, setCurrentPage, totalItems }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);
  const gridViewConfig = viewConfig?.gridview;
  const { showFeatures, exportOptions, globalSearch, groupBy, viewLink } = viewConfig?.gridview;

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
      xs: 24,
      sm: cardsPerRow === 1 ? 24 : 12,
      md: cardsPerRow === 1 ? 24 : Math.floor(24 / Math.min(cardsPerRow, 3)),
      lg: cardsPerRow === 1 ? 24 : Math.floor(24 / cardsPerRow),
    };
  };

  // Helper function to access deep values using dot notation
  // const getNestedValue = (obj, path) => {
  //   console.log("ptr", path?.split('-').reduce((acc, key) => acc && acc[key], obj));
  //   return path?.split('-').reduce((acc, key) => acc && acc[key], obj);
  // };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;

    const keys = path.split('-');

    return keys.reduce((result, key) => {
      if (!result) return undefined;

      // If result is an array, map over it and extract the next key
      if (Array.isArray(result)) {
        return result.map(item => item[key]).filter(Boolean); // Remove undefined values
      }

      return result[key];
    }, obj);
  };

  const canEditOrDelete = (item, rules) => {
    return rules?.some(rule => {
      const sessionValue = getNestedValue(session?.user, rule?.a);
      const itemValue = Array.isArray(rule.b) ? rule?.b : getNestedValue(item, rule?.b);

      if (rule?.op === "eq") {
        return sessionValue === itemValue;
      }
      if (rule?.op === "in") {
        return rule?.b?.includes(sessionValue);
      }
      return false;
    });
  };

  // Function to get field value, now with whitespace and array handling
  const getFieldValue = (record, fieldConfig) => {
    console.log("ft-Getting field value for record:", record);
    if (!fieldConfig) return null;
    // if (!fieldConfig) return '';

    let value = fieldConfig?.fieldPath
      ? getNestedValue(record, fieldConfig?.fieldPath)
      : record[fieldConfig?.fieldName];

    // Handle comma-separated display for subfields
    if (fieldConfig?.display === "comma_separated" && fieldConfig.subFields) {
      value = fieldConfig.subFields
        .map(subField => getNestedValue(record, subField.fieldPath))
        .filter(Boolean) // Remove any undefined or null values
        .join(', ');
    }
    // Array.isArray(value) && console.log("tyu", value);
    // // If value is an array of objects, map to get the category_name
    // if (Array.isArray(value) && value[0][fieldConfig?.fieldValue]) {
    //   value = value.map(item => item[fieldConfig?.fieldValue]);
    // }

    return value;
  };



  // Render field based on config
  const renderField = (record, fieldConfig) => {
    const value = getFieldValue(record, fieldConfig);
    const { style = {} } = fieldConfig;
    const IconComponent = fieldConfig?.icon ? Icons[fieldConfig.icon] : null;

    if (style?.render === 'tag' && Array.isArray(value)) {
      return (
        <Space wrap>
          {value?.map((tag, index) => (
            <Tag
              key={index}
              onClick={() => fieldConfig?.link && navigate(`/app${fieldConfig?.link}${fieldConfig?.linkParam ? record[fieldConfig?.linkParam] : tag}`)}
              color={style?.colorMapping?.[tag?.toLowerCase()] || 'default'}
            >
              {tag}
            </Tag>
          ))}
        </Space>
      );
    }

    if (style.badge) {
      return <Badge status={style.color?.[value?.toLowerCase()] || 'default'} text={value} />;
    }

    const content = (
      <Text
        style={{
          ...style,
          display: 'block',
          whiteSpace: style?.ellipsis ? 'nowrap' : 'normal',
          overflow: style?.ellipsis ? 'hidden' : 'visible',
          textOverflow: style?.ellipsis ? 'ellipsis' : 'clip',
        }}
      >
        {IconComponent && <IconComponent style={{ marginRight: 8 }} />}
        {(value && fieldConfig?.label) && `${fieldConfig?.fieldName}: ` || null}
        {value || null}
      </Text>
    );

    //   //****
    //   // // Function to get field value, now with whitespace and array handling
    // const getFieldValue = (record, fieldConfig) => {
    //   console.log("ft-Getting field value for record:", record);
    //   if (!fieldConfig) return '';

    //   let value = fieldConfig?.fieldPath
    //     ? getNestedValue(record, fieldConfig?.fieldPath)
    //     : record[fieldConfig?.fieldName];

    //   // Handle comma-separated display for subfields or array fields
    //   if ((fieldConfig?.display === "comma_separated" && fieldConfig.subFields) || Array.isArray(value)) {
    //     value = formatArrayValue(value);
    //   } else if (value) {
    //     value = trimValue(value);
    //   }

    //   return value || ''; // Return an empty string if value is undefined or null
    // };

    // // Render field based on config, now handling empty or whitespace-only values and arrays
    // const renderField = (record, fieldConfig) => {
    //   const value = getFieldValue(record, fieldConfig);
    //   const { style = {} } = fieldConfig;
    //   const IconComponent = fieldConfig?.icon ? Icons[fieldConfig.icon] : null;

    //   if (!value && !fieldConfig.label) return null; // Skip rendering if there's no value and no label

    //   if (style?.render === 'tag' && Array.isArray(value)) {
    //     return (
    //       <Space wrap>
    //         {value.split(', ').map((tag, index) => (
    //           <Tag
    //             key={index}
    //             onClick={() => fieldConfig?.link && navigate(`/app${fieldConfig?.link}${tag}`)}
    //             color={style?.colorMapping?.[tag?.toLowerCase()] || 'default'}
    //           >
    //             {tag}
    //           </Tag>
    //         ))}
    //       </Space>
    //     );
    //   }

    //   if (style.badge) {
    //     return <Badge status={style.color?.[value?.toLowerCase()] || 'default'} text={value} />;
    //   }

    //   const content = (
    //     <Text
    //       style={{
    //         ...style,
    //         display: 'block',
    //         whiteSpace: style?.ellipsis ? 'nowrap' : 'normal',
    //         overflow: style?.ellipsis ? 'hidden' : 'visible',
    //         textOverflow: style?.ellipsis ? 'ellipsis' : 'clip',
    //       }}
    //     >
    //       {IconComponent && <IconComponent style={{ marginRight: 8 }} />}
    //       {fieldConfig?.label && `${fieldConfig?.label} `}
    //       {value}
    //     </Text>
    //   );

    //   //******* */ */

    // Check if webLink is true to open link in a new tab
    if (fieldConfig?.webLink) {
      // Ensure the value is a full URL or prepend 'http://' if it's not
      const fullUrl = value?.startsWith('https') ? value : `https://${value}`;
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }

    return fieldConfig?.link ? (
      <a onClick={() => navigate(`/app${fieldConfig?.link}${fieldConfig?.linkParam ? record[fieldConfig?.linkParam] : value}`)}>{content}</a>
    ) : content;
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    console.log("Filtering data with searchText:", searchText);
    if (!searchText) {
      console.log("No searchText, returning full data.");
      return data;
    }
    return data?.filter(item =>
      gridViewConfig?.fields?.some(field => {
        const value1 = getNestedValue(item, field?.fieldPath || field?.fieldName);
        const value = Array.isArray(value1) ? value1?.map(item => item)?.join(', ') : value1 ?? null;
        return String(value).toLowerCase().includes(searchText?.toLowerCase());
      })
    );
  }, [data, searchText, gridViewConfig?.fields]);

  // Action menu for each card
  const getActionMenu = (record) => {
    const allowedActions = gridViewConfig?.actions?.row?.filter(action => {
      if (action === 'edit') return canEditOrDelete(record, viewConfig?.access_config?.canEdit);
      if (action === 'delete') return canEditOrDelete(record, viewConfig?.access_config?.canDelete);
      return true;
    });
    console.log("aa", allowedActions)
    return (
      <Menu>
        {allowedActions?.map(action => (
          <Menu.Item
            key={action?.name}
            onClick={() => {
              console.log(`Executing action '${action?.name}' for record:`, record);
              switch (action?.name) {
                case 'view':
                  navigate(`/app${gridViewConfig?.viewLink}${record?.id}`);
                  break;
                case 'edit':
                  openDrawer(record, false, action?.form);
                  break;
                case 'delete':
                  deleteData(record);
                  break;
                default:
                  console.log(`Action ${action?.name} not implemented`);
              }
            }}
          >
            {action?.name?.charAt(0).toUpperCase() + action?.name?.slice(1)}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleBulkAction = (action) => {
    if (action?.name?.includes("add_")) {
      openDrawer(null, false, action?.form);
    } else {
      console.log(`Bulk action "${action?.name}" triggered. Placeholder for now.`);
    }
  };

  const dynamicBulkActions = viewConfig?.gridview?.actions?.bulk?.filter(action =>
    action?.name?.includes("add_")
  );


  // const ResponsiveButton = ({ ...props }) => {
  //   const ButtonComponent = isMobile ? FloatButton : Button;
  //   return <ButtonComponent {...props} />;
  // };

  // const ResponsiveButton = ({ ...props }) => {
  //   const isMobile = window.innerWidth < 768
  //   const IconComponent = Icons[props.floatIcon || 'FileOutlined']
  //   if (isMobile) {
  //     return (
  //       <FloatButton
  //         {...props}
  //         icon={<IconComponent />} // Default icon, you might want to make this dynamic based on action
  //         tooltip={props.children || 'Action'} // Use children as tooltip if available, otherwise a default string
  //       />
  //     );
  //   }

  //   return <Button {...props} />;
  // }

  return (
    <div style={{ maxWidth: gridViewConfig?.layout?.maxWidth }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
          {totalItems > data.length && (
            <Button onClick={() => setCurrentPage(prev => prev + 1)}>Load More</Button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[...(viewConfig?.gridview?.actions?.bulk || [])]?.map((action) => (
            <ResponsiveButton
              key={action?.name}
              type="primary"
              style={{ marginRight: 0, marginTop: 0 }}
              onClick={() => handleBulkAction(action)}
            // floatIcon={'SearchOutlined'}
            >
              {action?.name
                ?.split('_')
                ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
                ?.join(' ')}
            </ResponsiveButton>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <Row gutter={[gridViewConfig?.layout?.spacing, gridViewConfig?.layout?.spacing]}>
        {filteredData.map((record, index) => {
          const fields = gridViewConfig?.fields?.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)) || [];
          const titleFields = fields?.filter(f => f.cardSection === 'title');
          const footerFields = fields?.filter(f => f.cardSection === 'footer');
          const bodyFields = fields?.filter(f => !f.cardSection || f.cardSection === 'body');

          return (
            <Col key={record?.id || index} {...getResponsiveSpans(gridViewConfig?.layout?.cardsPerRow)}>
              <Card
                size={gridViewConfig?.layout?.size || 'default'}
                style={{
                  height: gridViewConfig?.layout?.aspectRatio === 'auto' ? 'auto' : '100%',
                  boxShadow: "none",
                  ...gridViewConfig?.layout?.cardStyle,
                }}
                title={titleFields?.length > 0 ? (
                  <Space>
                    {titleFields?.map(field => renderField(record, field))}
                  </Space>
                ) : undefined}
                extra={
                  gridViewConfig?.actions?.row && (
                    <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                      <EllipsisOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                    </Dropdown>
                  )
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {bodyFields?.map((fieldConfig) => (
                    <div key={fieldConfig?.fieldName}>
                      {renderField(record, fieldConfig)}
                    </div>
                  ))}
                </Space>
                {footerFields?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <Space wrap>
                      {footerFields?.map(fieldConfig => (
                        <div key={fieldConfig?.fieldName}>
                          {renderField(record, fieldConfig)}
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default GridView;
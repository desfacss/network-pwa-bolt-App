import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Space, Button, Input, Dropdown, Menu, Badge, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const GridView = ({ data, viewConfig, fetchConfig, updateData, deleteData, openDrawer }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);
  //   console.log('View Config:', viewConfig);
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
      xs: 24, // 1 card per row on mobile
      sm: cardsPerRow === 1 ? 24 : 12, // 2 cards per row on small screens
      md: cardsPerRow === 1 ? 24 : Math.floor(24 / Math.min(cardsPerRow, 3)), // 3 cards max on medium
      lg: cardsPerRow === 1 ? 24 : Math.floor(24 / cardsPerRow), // Desired cards per row on large screens
    };
  };

  // Helper function to access deep values using dot notation
  const getNestedValue2 = (obj, path) => {
    return path?.split('-').reduce((acc, key) => acc && acc[key], obj);
  };

  const canEditOrDelete = (item, rules) => {
    return rules?.some(rule => {
      const sessionValue = getNestedValue2(session?.user, rule?.a);
      const itemValue = Array.isArray(rule.b) ? rule?.b : getNestedValue2(item, rule?.b);

      if (rule?.op === "eq") {
        return sessionValue === itemValue;
      }

      if (rule?.op === "in") {
        return rule?.b?.includes(sessionValue);
      }

      return false;
    });
  };

  // const getNestedValue = (object, path) => {
  //   if (!object || !path) return undefined;

  //   const keys = path?.split('-');

  //   return keys.reduce((value, key) => {
  //     if (!value) return undefined;

  //     // If `value` is an array, map over it and extract the next key
  //     if (Array.isArray(value)) {
  //       return value?.map(item => item[key]).filter(Boolean); // Remove undefined values
  //     }

  //     return value[key];
  //   }, object);
  // };

  const getNestedValue = (object, path) => {
    if (!object || !path) return undefined;

    const keys = path?.split('-');

    return keys.reduce((result, key, index) => {
      if (!result) return undefined;

      // If `result` is an array, map over it and extract the next key
      if (Array.isArray(result)) {
        return result.map(item => ({
          value: item[key],
          id: item.id, // Include the id from the object
        })).filter(Boolean); // Remove undefined values
      }

      const value = result[key];

      // Return the value and id if it's the last key
      if (index === keys.length - 1) {
        return { value, id: result.id };
      }

      return value;
    }, object);
  };


  // Get nested field value
  const getFieldValue = (record, fieldConfig) => {
    console.log("ft-Getting field value for record:", record);
    if (!fieldConfig) return null;

    const value = fieldConfig?.fieldPath
      ? getNestedValue(record, fieldConfig?.fieldPath)
      // ? fieldConfig.fieldPath.split('-').reduce((obj, key) => obj?.[key], record)
      : record[fieldConfig?.fieldName];

    console.log("tu-Field Value for", fieldConfig?.fieldName, ":", value, fieldConfig?.fieldPath);
    return value;
  };

  // // Render field based on config
  // const renderField = (record, fieldConfig) => {
  //   // console.log("Rendering field for record:", record, "with fieldConfig:", fieldConfig);
  //   // const value = getFieldValue(record, fieldConfig);
  //   const item = getNestedValue(record, fieldConfig?.fieldPath || fieldConfig?.fieldName);
  //   const { style = {} } = fieldConfig;
  //   // console.log("link", item)
  //   // Handle icon
  //   const IconComponent = fieldConfig?.icon ? Icons[fieldConfig.icon] : null;

  //   // Handle different style renderers
  //   if (style?.render === 'tag' && Array.isArray(item)) {
  //     console.log("Rendering tags for item:", item);
  //     return (
  //       <Space wrap>
  //         {item?.map((tag, index) => (
  //           <Tag
  //             key={index}
  //             onClick={() => fieldConfig?.link && navigate(`/app${fieldConfig?.link}${tag?.value}`)}
  //             color={style?.colorMapping?.[tag?.value?.toLowerCase()] || 'default'}
  //           >
  //             {tag?.value}
  //           </Tag>
  //         ))}
  //       </Space>
  //     );
  //   }

  //   if (style.badge) {
  //     console.log("Rendering badge for item:", item);
  //     return (
  //       <Badge
  //         status={style.color?.[item?.value?.toLowerCase()] || 'default'}
  //         text={item?.value}
  //       />
  //     );
  //   }

  //   // Basic text rendering with styles
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
  //       {fieldConfig?.label && `${fieldConfig?.fieldName}: `}
  //       {item?.value}
  //     </Text>
  //   );
  //   // const param = fieldConfig?.linkParam ? item.toLowerCase().replace(/\s+/g, '_') : record?.id
  //   const param = item?.value
  //   fieldConfig?.link && console.log("link", item)//, `/app${fieldConfig?.link}${param}`)
  //   // Wrap with link if specified
  //   return fieldConfig?.link ? (
  //     <a onClick={() => navigate(`/app${fieldConfig?.link}${param}`)}>{content}</a>
  //   ) : content;
  // };

  const renderField = (record, fieldConfig) => {
    const item = getNestedValue(record, fieldConfig?.fieldPath || fieldConfig?.fieldName);
    const { style = {} } = fieldConfig;
    const IconComponent = fieldConfig?.icon ? Icons[fieldConfig.icon] : null;

    if (!item) return null; // Handle undefined/null values

    // 🟢 Define a reusable function to wrap content with a link
    const wrapWithLink = (content, paramValue) => {
      if (!fieldConfig?.link) return content;

      const param = paramValue[fieldConfig?.linkParam || 'value']//?.toLowerCase().replace(/\s+/g, "_"); // Format for URL
      console.log("Navigating to:", `/app${fieldConfig?.link}${param}`);

      return <a onClick={() => navigate(`/app${fieldConfig?.link}${param}`)}>{content}</a>;
    };

    // 🔹 Render tags
    if (style?.render === "tag" && Array.isArray(item)) {
      return (
        <Space wrap>
          {item.map((tag, index) =>
            wrapWithLink(
              <Tag
                key={index}
                color={style?.colorMapping?.[tag?.value?.toLowerCase()] || "default"}
                style={{ cursor: fieldConfig?.link ? "pointer" : "default" }}
              >
                {tag?.value}
              </Tag>,
              tag
            )
          )}
        </Space>
      );
    }

    // 🔹 Render badges
    if (style?.badge) {
      return wrapWithLink(
        <Badge
          status={style.color?.[item?.value?.toLowerCase()] || "default"}
          text={item?.value}
        />,
        item
      );
    }

    // 🔹 Render basic text field
    const content = (
      <Text
        style={{
          ...style,
          display: "block",
          whiteSpace: style?.ellipsis ? "nowrap" : "normal",
          overflow: style?.ellipsis ? "hidden" : "visible",
          textOverflow: style?.ellipsis ? "ellipsis" : "clip",
          cursor: fieldConfig?.link ? "pointer" : "default",
        }}
      >
        {IconComponent && <IconComponent style={{ marginRight: 8 }} />}
        {fieldConfig?.label && `${fieldConfig?.fieldName}: `}
        {item?.value}
      </Text>
    );

    return wrapWithLink(content, item);
  };


  // Filter data based on search
  const filteredData = useMemo(() => {
    console.log("Filtering data with searchText:", searchText);
    if (!searchText) {
      console.log("No searchText, returning full data.");
      return data;
    }
    const filtered = data?.filter(item =>
      gridViewConfig?.fields?.some(field => {
        // const value = getFieldValue(item, field);
        const value1 = getNestedValue(item, field?.fieldPath || field?.fieldName);
        const value = Array.isArray(value1) ? value1?.map(item => item.value)?.join(', ') : value1 ?? null;
        return String(value).toLowerCase().includes(searchText?.toLowerCase());
      })
    );
    console.log("Filtered Data:", filtered);
    return filtered;
  }, [data, searchText, gridViewConfig?.fields]);

  // Action menu for each card
  //   const getActionMenu = (record) => (
  //     <Menu>
  //       {gridViewConfig.actions?.card?.map(action => (
  //         <Menu.Item
  //           key={action}
  //           onClick={() => {
  //             console.log(`Executing action '${action}' for record:`, record);
  //             switch (action) {
  //               case 'view':
  //                 navigate(`/app${gridViewConfig.viewLink}${record.id}`);
  //                 break;
  //               case 'edit':
  //                 openDrawer(record);
  //                 break;
  //               case 'delete':
  //                 deleteData(record);
  //                 break;
  //               default:
  //                 console.log(`Action ${action} not implemented`);
  //             }
  //           }}
  //         >
  //           {action.charAt(0).toUpperCase() + action.slice(1)}
  //         </Menu.Item>
  //       ))}
  //     </Menu>
  //   );

  const getActionMenu = (record) => {
    const allowedActions = gridViewConfig?.actions?.row?.filter(action => {
      if (action === 'edit') return canEditOrDelete(record, viewConfig?.access_config?.canEdit);
      if (action === 'delete') return canEditOrDelete(record, viewConfig?.access_config?.canDelete);
      return true; // Always allow other actions like 'view'
    });
    console.log("aa", allowedActions)
    return (
      <Menu>
        {allowedActions?.map(action => (
          <Menu.Item
            key={action}
            onClick={() => {
              console.log(`Executing action '${action}' for record:`, record);
              switch (action) {
                case 'view':
                  navigate(`/app${gridViewConfig?.viewLink}${record?.id}`);
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
  };

  const handleBulkAction = (action) => {
    if (action.includes("add_")) {
      openDrawer();
    } else {
      console.log(`Bulk action "${action}" triggered. Placeholder for now.`);
    }
  };
  console.log("blk", viewConfig?.gridview?.actions?.bulk)
  const dynamicBulkActions = viewConfig?.gridview?.actions?.bulk?.filter(action =>
    action?.includes("add_")
  );

  return (
    <div style={{ maxWidth: gridViewConfig?.layout?.maxWidth }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {gridViewConfig.showFeatures?.includes('search') && (
            <Space style={{ marginBottom: spacing }}>
              {/* <Space style={{ marginBottom: gridViewConfig.layout.spacing }}> */}
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </Space>
          )}
          {/* {showFeatures.includes('columnVisibility') && <Dropdown overlay={columnVisibilityMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />} style={{ marginRight: 8 }} />
          </Dropdown>}

          {groupBy?.length > 0 && (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="none" onClick={() => handleGroupByChange(null)}>
                    None
                  </Menu.Item>
                  {viewConfig?.tableview?.groupBy?.map((field) => (
                    <Menu.Item key={field} onClick={() => handleGroupByChange(field)}>
                      {`Group by ${field}`}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
            >
              <Button icon={<GroupOutlined />} style={{ marginLeft: 8 }} />
            </Dropdown>
          )}

          {showFeatures.includes('basicSearch') && <Space style={{ marginLeft: 16 }}>
            <Input
              placeholder="Search"
              value={searchText}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Space>} */}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[
            // ...(dynamicBulkActions || []),
            ...viewConfig?.gridview?.actions?.bulk//?.filter(action => !action.includes("add_new_")) 
          ].map((action) => (
            <Button
              key={action}
              type="primary"
              style={{ marginRight: 8 }}
              onClick={() => handleBulkAction(action)}
            >
              {action
                ?.split('_')
                ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
                ?.join(' ')}
            </Button>
          ))}

          {/* {exportOptions?.length > 0 && (
            <Dropdown
              overlay={
                <Menu>
                  {exportOptions.includes('csv') && (
                    <Menu.Item key="csv" onClick={() => handleExport('CSV')}>
                      Export to CSV
                    </Menu.Item>
                  )}
                  {exportOptions.includes('pdf') && (
                    <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>
                      Export to PDF
                    </Menu.Item>
                  )}
                </Menu>
              }
              trigger={['click']}
            >
              <Button icon={<ExportOutlined />} style={{ marginLeft: 8 }} />
            </Dropdown>
          )} */}

        </div>
      </div>

      {/* Grid Layout */}
      <Row gutter={[gridViewConfig?.layout?.spacing, gridViewConfig?.layout?.spacing]}>
        {filteredData.map((record, index) => {
          const fields = gridViewConfig?.fields || [];

          console.log("Rendering record:", record);
          console.log("Fields:", fields);

          // Separate fields by where they should be placed
          const titleFields = fields?.filter(f => f.cardSection === 'title');
          const footerFields = fields?.filter(f => f.cardSection === 'footer');
          const bodyFields = fields?.filter(f => !f.cardSection || f.cardSection === 'body');

          return (
            <Col key={record?.id || index} {...getResponsiveSpans(gridViewConfig?.layout?.cardsPerRow)}>
              <Card
                size={gridViewConfig?.layout?.size || 'default'} // default to 'default' if size not provided
                style={{
                  height: gridViewConfig?.layout?.aspectRatio === 'auto' ? 'auto' : '100%',
                  ...gridViewConfig?.layout?.cardStyle,
                  // cursor: fields.some(f => f.link) ? 'pointer' : 'default'
                }}
                title={titleFields?.length > 0 ? (
                  <Space>
                    {titleFields?.map(field => renderField(record, field))}
                    {/* {gridViewConfig.actions?.card && (
                      <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                        <EllipsisOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                      </Dropdown>
                    )} */}
                  </Space>
                ) : undefined}
                extra={
                  // gridViewConfig.actions?.card && !titleFields.find(f => f.cardSection === 'title') ? (
                  //   <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                  //     <EllipsisOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                  //   </Dropdown>
                  // ) : null
                  gridViewConfig?.actions?.row && (
                    <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                      <EllipsisOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                    </Dropdown>
                  )
                }
                actions={null} // Remove default actions since we're placing them in title or footer
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* {bodyFields.map((fieldConfig) => (
                    <div key={fieldConfig.fieldName}>
                      {renderField(record, fieldConfig)}
                    </div> */}
                  {bodyFields?.map((fieldConfig) => (
                    <div key={fieldConfig?.fieldName}>
                      {renderField(record, fieldConfig)}
                      {/* {getNestedValue(record, fieldConfig?.fieldPath || fieldConfig?.fieldName)} */}
                      {/* {fieldConfig.fieldName === 'details_tags'
                        ? record.related_data?.details_tags.map(tag => (
                          <Tag key={tag.id} color="GREY">
                            {tag.category_name}
                          </Tag>
                        ))
                        : renderField(record, fieldConfig)
                      } */}
                    </div>
                  ))}
                </Space>
                {footerFields?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <Space wrap>
                      {footerFields?.map(fieldConfig => (
                        <div key={fieldConfig?.fieldName}>
                          {renderField(record, fieldConfig)}
                          {/* {getNestedValue(record, fieldConfig?.fieldPath || fieldConfig?.fieldName)} */}
                          {/* {fieldConfig.fieldName === 'details_tags'
                            ? record.related_data?.details_tags.map(tag => (
                              <Tag key={tag.id} color="GREY">
                                {tag.category_name}
                              </Tag>
                            ))
                            : renderField(record, fieldConfig)
                          } */}
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

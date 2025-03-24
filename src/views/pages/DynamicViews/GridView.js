import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Space, Button, Input, Dropdown, Menu, Badge, Tag, Typography, FloatButton, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ResponsiveButton } from 'views/pages/Trial/ResponsiveButton';

const { Title, Text } = Typography;

const GridView = ({ data, viewConfig, fetchConfig, updateData, deleteData, openDrawer, setCurrentPage, totalItems, openDrawerWithPath, openMessageModal }) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { session } = useSelector((state) => state.auth);
  const gridViewConfig = viewConfig?.gridview;

  const { showFeatures, exportOptions, globalSearch, groupBy, viewLink } = viewConfig?.gridview || {};
  const { cardsPerRow = 4, spacing = 16, cardStyle = {}, aspectRatio = 'auto' } = gridViewConfig?.layout || {};

  const getResponsiveSpans = (cardsPerRow) => {
    return {
      xs: 24,
      sm: 24,
      md: cardsPerRow === 1 ? 24 : Math.floor(24 / Math.min(cardsPerRow, 3)),
      lg: cardsPerRow === 1 ? 24 : Math.floor(24 / cardsPerRow),
    };
  };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    const keys = path.split('-');
    return keys.reduce((result, key) => {
      if (!result) return undefined;
      if (Array.isArray(result)) {
        return result.map(item => item[key]).filter(Boolean);
      }
      return result[key];
    }, obj);
  };

  const canEditOrDelete = (item, rules) => {
    return rules?.some(rule => {
      const sessionValue = getNestedValue(session?.user, rule?.a);
      const itemValue = Array.isArray(rule.b) ? rule?.b : getNestedValue(item, rule?.b);
      if (rule?.op === "eq") return sessionValue === itemValue;
      if (rule?.op === "in") return rule?.b?.includes(sessionValue);
      return false;
    });
  };

  const getFieldValue = (record, fieldConfig) => {
    if (!fieldConfig) return null;
    let value = getNestedValue(record, fieldConfig?.fieldPath);

    if (fieldConfig?.display === "comma_separated" && fieldConfig?.subFields?.length > 0) {
      value = fieldConfig.subFields
        .map(subField => getNestedValue(record, subField.fieldPath))
        .filter(Boolean)
        .join(', ');
    }
    return value;
  };

  const renderField = (record, fieldConfig) => {
    const value = getFieldValue(record, fieldConfig);
    const { style = {}, subFields = [], link, linkParam, mode = 'navigate' } = fieldConfig;
    const IconComponent = fieldConfig?.icon ? Icons[fieldConfig.icon] : null;

    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value?.length === 0)) {
      return null;
    }

    if (fieldConfig?.display === "comma_separated" && subFields.length > 0) {
      const subFieldValues = subFields?.map(subField => {
        const subValue = getNestedValue(record, subField?.fieldPath);
        const SubIconComponent = subField?.icon ? Icons[subField.icon] : null;
        const content = subValue && (
          <Text style={{ ...subField?.style, display: 'inline-block', marginRight: 8 }}>
            {SubIconComponent && <SubIconComponent style={{ marginRight: 4 }} />}
            {subValue}
          </Text>
        );

        return subField?.webLink ? (
          <a href={subValue?.startsWith('http') ? subValue : `https://${subValue}`} target="_blank" rel="noopener noreferrer" key={subField?.fieldPath} style={subField?.style}>
            {content}
          </a>
        ) : content;
      }).filter(Boolean);

      return <Space wrap>{subFieldValues}</Space>;
    }

    if (style?.render === 'tag' && Array.isArray(value)) {
      return (
        <Space wrap>
          {value?.map((tag, index) => (
            <Tag key={index} onClick={() => fieldConfig?.link && navigate(`/app${fieldConfig?.link}${fieldConfig?.linkParam ? record[fieldConfig?.linkParam] : tag}`)}
              color={style?.bgColor || style?.colorMapping?.[tag?.toLowerCase()] || 'default'}>
              {tag}
            </Tag>
          ))}
        </Space>
      );
    }

    if (style.badge) {
      return <Badge status={style.color?.[value?.toLowerCase()] || 'default'} text={value} />;
    }

    const content = value && (
      <Text style={{ ...style, display: 'block', whiteSpace: style?.ellipsis ? 'nowrap' : 'normal', overflow: style?.ellipsis ? 'hidden' : 'visible', textOverflow: style?.ellipsis ? 'ellipsis' : 'clip' }}>
        {IconComponent && <IconComponent style={{ marginRight: 8 }} />}
        {(fieldConfig?.fieldName) && `${fieldConfig?.fieldName}: `}
        {value}
      </Text>
    );

    if (fieldConfig?.webLink) {
      const fullUrl = value?.startsWith('http') ? value : `https://${value}`;
      return <a href={fullUrl} target="_blank" rel="noopener noreferrer">{content}</a>;
    }

    if (link) {
      const url = `/app${link}${linkParam ? record[linkParam] : value}`;
      return (
        <a href={url} onClick={(e) => { e.preventDefault(); openDrawerWithPath(null, false, "", url, mode); }}>
          {content}
        </a>
      );
    }

    return content;
  };

  // Flatten fields from groups for filtering
  const allFields = useMemo(() => gridViewConfig?.groups?.flatMap(group => group.fields) || [], [gridViewConfig?.groups]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data?.filter(item =>
      allFields.some(field => {
        const value1 = getNestedValue(item, field?.fieldPath || field?.fieldName);
        const value = Array.isArray(value1) ? value1?.map(item => item)?.join(', ') : value1 ?? null;
        return String(value).toLowerCase().includes(searchText?.toLowerCase());
      })
    );
  }, [data, searchText, allFields]);

  const getActionMenu = (record) => {
    const allowedActions = gridViewConfig?.actions?.row?.filter(action => {
      if (action === 'edit') return canEditOrDelete(record, viewConfig?.access_config?.canEdit);
      if (action === 'delete') return canEditOrDelete(record, viewConfig?.access_config?.canDelete);
      if (action?.name === 'message') return (session?.user?.id !== record[action.form]);
      return true;
    });
    return (
      <Menu>
        {allowedActions?.map(action => (
          <Menu.Item key={action?.name} onClick={() => {
            switch (action?.name) {
              case 'view': navigate(`/app${gridViewConfig?.viewLink}${record?.id}`); break;
              case 'edit': openDrawer(record, false, action?.form); break;
              case 'delete': deleteData(record); break;
              case 'message': openMessageModal && openMessageModal(record[action.form]); break;
              default: console.log(`Action ${action?.name} not implemented`);
            }
          }}>
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

  return (
    <div style={{ maxWidth: gridViewConfig?.layout?.maxWidth }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {showFeatures?.includes('search') && (
            <Space style={{ marginBottom: spacing }}>
              <Input placeholder="Search" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} />
            </Space>
          )}
          {totalItems > data.length && <Button onClick={() => setCurrentPage(prev => prev + 1)}>Load More</Button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[...(gridViewConfig?.actions?.bulk || [])]?.map((action) => (
            <ResponsiveButton key={action?.name} type="primary" style={{ marginRight: 0, marginTop: 0 }} onClick={() => handleBulkAction(action)}>
              {action?.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </ResponsiveButton>
          ))}
        </div>
      </div>

      <Row gutter={[spacing, spacing]}>
        {filteredData.map((record, index) => {
          const allFieldsSorted = allFields.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          const titleFields = allFieldsSorted.filter(f => f.cardSection === 'title');
          const footerFields = allFieldsSorted.filter(f => f.cardSection === 'footer');
          const bodyFields = allFieldsSorted.filter(f => !f.cardSection || f.cardSection === 'body');

          return (
            <Col key={record?.id || index} {...getResponsiveSpans(cardsPerRow)}>
              <Card
                size={gridViewConfig?.layout?.size || 'default'}
                style={{ height: aspectRatio === 'auto' ? 'auto' : '100%', boxShadow: "none", ...cardStyle }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>{titleFields?.length > 0 && titleFields.map(field => renderField(record, field))}</Space>
                    {gridViewConfig?.actions?.row?.length > 0 && getActionMenu(record)?.props?.children?.length > 0 && (
                      <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                        <EllipsisOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                      </Dropdown>
                    )}
                  </div>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {bodyFields.map((fieldConfig) => renderField(record, fieldConfig))?.filter(Boolean)}
                </Space>
                {footerFields?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <Space wrap>{footerFields.map(fieldConfig => renderField(record, fieldConfig))?.filter(Boolean)}</Space>
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
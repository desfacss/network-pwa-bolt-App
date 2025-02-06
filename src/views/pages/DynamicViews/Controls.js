import React from 'react';
import { Button, Checkbox, Dropdown, Input, Menu, Space } from 'antd';
import { SearchOutlined, FilterOutlined, GroupOutlined, FullscreenOutlined, FullscreenExitOutlined, ExportOutlined } from "@ant-design/icons";
import { renderFilters } from 'components/util-components/utils';

const ViewControls = ({
    // isFullscreen,
    // handleFullscreenToggle,
    searchText,
    handleSearchChange,
    viewConfig,
    data,
    handleExport,
    handleGroupByChange,
    toggleColumnVisibility
}) => {

    const exportOptions = viewConfig?.tableview?.exportOptions || [];
    const showFeatures = viewConfig?.tableview?.showFeatures || [];

    const columnVisibilityMenu = (
        <Menu>
            {viewConfig?.tableview?.fields?.map((fieldConfig) => (
                <Menu.Item key={fieldConfig?.fieldName}>
                    <Checkbox
                        checked={viewConfig?.visibleColumns?.includes(fieldConfig?.fieldName)}
                        onChange={() => toggleColumnVisibility(fieldConfig?.fieldName)}
                    >
                        {fieldConfig?.fieldName}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Space>
                {showFeatures.includes('columnVisibility') && (
                    <Dropdown overlay={columnVisibilityMenu} trigger={['click']}>
                        <Button icon={<FilterOutlined />} />
                    </Dropdown>
                )}

                {viewConfig?.tableview?.groupBy?.length > 0 && (
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="none" onClick={() => handleGroupByChange(null)}>None</Menu.Item>
                                {viewConfig?.tableview?.groupBy?.map((field) => (
                                    <Menu.Item key={field} onClick={() => handleGroupByChange(field)}>
                                        {`Group by ${field}`}
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Button icon={<GroupOutlined />} />
                    </Dropdown>
                )}

                {showFeatures.includes('basicSearch') && (
                    <Input
                        placeholder="Search"
                        value={searchText}
                        onChange={handleSearchChange}
                        prefix={<SearchOutlined />}
                        style={{ width: 200 }}
                    />
                )}
            </Space>

            <Space>
                {/* <Button onClick={handleFullscreenToggle} style={{ fontSize: "16px", padding: "8px", cursor: "pointer" }}>
                    {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                </Button> */}

                {exportOptions.length > 0 && (
                    <Dropdown
                        overlay={
                            <Menu>
                                {exportOptions.includes('csv') && (
                                    <Menu.Item key="csv" onClick={() => handleExport('CSV')}>Export to CSV</Menu.Item>
                                )}
                                {exportOptions.includes('pdf') && (
                                    <Menu.Item key="pdf" onClick={() => handleExport('PDF')}>Export to PDF</Menu.Item>
                                )}
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Button icon={<ExportOutlined />} />
                    </Dropdown>
                )}

                {/* Here you might add any additional controls like import buttons or other global filters */}
                {renderFilters(viewConfig?.global?.search, data)}
            </Space>
        </div>
    );
};

export default ViewControls;
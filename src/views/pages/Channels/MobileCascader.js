import React, { useState, useEffect } from 'react';
// import { useMediaQuery } from 'react-responsive';
import { Drawer, Button, List, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

// Mobile Cascader Component
export const MobileCascader = ({ visible, onClose, options, onSelect }) => {
    const [currentPath, setCurrentPath] = useState([]);
    const currentOptions = currentPath.reduce(
        (acc, cur) => acc.find(item => item.value === cur)?.children || [],
        options
    );

    const handleSelect = (item) => {
        if (item.children) {
            setCurrentPath([...currentPath, item.value]);
        } else {
            onSelect([...currentPath, item.value]);
            onClose();
        }
    };

    return (
        <Drawer
            title={
                <div>
                    {currentPath.length > 0 && (
                        <Button
                            icon={<ArrowLeftOutlined />}
                            type="text"
                            onClick={() => setCurrentPath(currentPath.slice(0, -1))}
                        />
                    )}
                    Select Tags
                </div>
            }
            placement="bottom"
            height="70vh"
            closable={true}
            onClose={onClose}
            visible={visible}
        >
            <List
                dataSource={currentOptions}
                renderItem={(item) => (
                    <List.Item onClick={() => handleSelect(item)}>
                        {item.label}
                        {item.children && <span style={{ float: 'right' }}>›</span>}
                    </List.Item>
                )}
            />
        </Drawer>
    );
};
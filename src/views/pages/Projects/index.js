import { Button, Card, Input, Tabs } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import NonProject from './NonProject';
import NonProjectLeave from './NonProjectLeave';
import Project from './Project';
import { SearchOutlined } from "@ant-design/icons";

const Index = () => {
    const [activeKey, setActiveKey] = useState('1');
    const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
    const [isNonProjectDrawerOpen, setIsNonProjectDrawerOpen] = useState(false);
    const { session } = useSelector((state) => state.auth);
    const [searchText, setSearchText] = useState('');

    const handleAddButtonClick = () => {
        if (activeKey === '1') {
            setIsProjectDrawerOpen(true);
        } else if (activeKey === '2') {
            setIsNonProjectDrawerOpen(true);
        }
    };

    const tabItems = [
        session?.user?.features?.feature?.projects && {
            label: 'Projects',
            key: '1',
            children: (<Project isDrawerOpen={isProjectDrawerOpen} setIsDrawerOpen={setIsProjectDrawerOpen} searchText={searchText} />),
        },
        session?.user?.features?.feature?.nonProjects && {
            label: 'Non Projects',
            key: '2',
            children: (<NonProject isDrawerOpen={isNonProjectDrawerOpen} setIsDrawerOpen={setIsNonProjectDrawerOpen} searchText={searchText} />),
        },
        session?.user?.features?.feature?.leaveProjects && {
            label: 'Leaves',
            key: '3',
            children: <NonProjectLeave />,
        },
    ].filter(Boolean);

    return (
        <Card>
            <Tabs defaultActiveKey="1" items={tabItems}
                tabBarExtraContent={
                    activeKey !== '3' &&
                    <>
                        <Input className='mr-2' placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<SearchOutlined />} style={{ width: 200 }} />
                        <Button type='primary' onClick={handleAddButtonClick}>
                            {`Add ${activeKey === '1' ? "Project" : "Non Project"}`}
                        </Button>
                    </>
                }
                activeKey={activeKey} onChange={(key) => setActiveKey(key)} />
        </Card>
    );
};

export default Index;

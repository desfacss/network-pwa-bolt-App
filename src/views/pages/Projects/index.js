import { Button, Card, Tabs } from 'antd';
import React, { useState } from 'react';
import NonProject from './NonProject';
import NonProjectLeave from './NonProjectLeave';
import Project from './Project';

const Index = () => {
    const [activeKey, setActiveKey] = useState('1');
    const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
    const [isNonProjectDrawerOpen, setIsNonProjectDrawerOpen] = useState(false);
    // const { session } = useSelector((state) => state.auth);

    const handleAddButtonClick = () => {
        if (activeKey === '1') {
            setIsProjectDrawerOpen(true);
        } else if (activeKey === '2') {
            setIsNonProjectDrawerOpen(true);
        }
    };

    const tabItems = [
        {
            label: 'Projects',
            key: '1',
            children: (<Project isDrawerOpen={isProjectDrawerOpen} setIsDrawerOpen={setIsProjectDrawerOpen} />),
        },
        {
            label: 'Non Projects',
            key: '2',
            children: (<NonProject isDrawerOpen={isNonProjectDrawerOpen} setIsDrawerOpen={setIsNonProjectDrawerOpen} />),
        },
        {
            label: 'Leaves',
            key: '3',
            children: <NonProjectLeave />,
        },
    ];

    return (
        <Card>
            <Tabs defaultActiveKey="1" items={tabItems}
                tabBarExtraContent={
                    activeKey !== '3' && <Button type='primary' onClick={handleAddButtonClick}>
                        {`Add ${activeKey === '1' ? "Project" : "Non Project"}`}
                    </Button>
                }
                activeKey={activeKey} onChange={(key) => setActiveKey(key)} />
        </Card>
    );
};

export default Index;

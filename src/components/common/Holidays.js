import React, { useState } from "react";
import { Button, Drawer, Table } from "antd";
import { useSelector } from "react-redux";

const HolidaysDrawer = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Accessing holidays from the Redux state
    const { session } = useSelector((state) => state.auth);
    const location = session?.user?.location;

    // Columns for the Ant Design table
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Day",
            dataIndex: "day",
            key: "day",
        },
        {
            title: "Optional",
            dataIndex: "optional",
            key: "optional",
            render: (optional) => (optional ? "Yes" : "No"),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => setIsDrawerOpen(true)}>
                Holidays
            </Button>
            <Drawer
                title={`Public Holidays ( ${location?.name} )`}
                placement="right"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={"50%"}
            >
                <Table
                    dataSource={location?.holidays || []}
                    columns={columns}
                    rowKey="date"
                    pagination={false}
                />
            </Drawer>
        </div>
    );
};

export default HolidaysDrawer;

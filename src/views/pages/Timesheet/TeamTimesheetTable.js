import React, { useEffect, useState } from 'react';
import { Table, message, Button, Drawer } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import Review1 from '../Review/Review1';
// import { supabase } from './supabaseClient'; // Import your Supabase client or API
import { format } from 'date-fns';

const TeamTimesheetTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const { session } = useSelector((state) => state.auth);

    // Fetch timesheet data from your backend
    const fetchData = async () => {
        setLoading(true);
        try {
            // const { data, error } = await supabase
            //     .from('x_timesheet_3')
            //     .select('*')
            //     .eq('approver_id', session?.user?.id)
            //     .eq('status', 'Submitted')
            // const today = new Date(); // Format today's date as needed
            // const today = format(new Date(), 'yyyy-MM-dd'); // Format today's date as needed
            const today = new Date().toISOString().slice(0, 10)
            let data, error;

            if (session?.user?.role_type === 'admin') {
                // Query for admins
                ({ data, error } = await supabase
                    .from('x_timesheet_3')
                    .select('*')
                    // .lt('last_date', today)
                    // .eq('status', 'Submitted')
                );
            } else {
                // Query for non-admins
                ({ data, error } = await supabase
                    .from('x_timesheet_3')
                    .select('*')
                    // .eq('approver_id', session?.user?.id)
                    // .eq('status', 'Submitted')
                );
            }

            if (error) {
                throw error;
            }

            setData(data);
        } catch (error) {
            message.error('Failed to load timesheet data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Define the columns for the table
    const columns = [
        {
            title: 'Timesheet Date',
            dataIndex: 'timesheet_date',
            key: 'timesheet_date',
            render: (date) => new Date(date).toLocaleDateString(), // Format date as needed
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date) => new Date(date).toLocaleString(), // Format date and time
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    <Button
                        type="primary"
                        // icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                        // onClick={() => handleEdit(record)}
                        onClick={() => handleOpenDrawer(record)}
                    >Approve / Reject</Button>
                    {/* <Button
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    /> */}
                </div>
            ),
        },
    ];

    // Function to open the drawer and set the selected record
    const handleOpenDrawer = (record) => {
        setSelectedRecord(record);
        setDrawerVisible(true);
    };

    // Function to close the drawer
    const closeDrawer = () => {
        setDrawerVisible(false);
        setSelectedRecord(null);
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id" // Assuming `id` is unique
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Drawer
                title="Review"
                width={'100%'}
                onClose={closeDrawer}
                visible={drawerVisible}
            >
                <Review1 data={selectedRecord} />
            </Drawer>
        </>
    );
};

export default TeamTimesheetTable;

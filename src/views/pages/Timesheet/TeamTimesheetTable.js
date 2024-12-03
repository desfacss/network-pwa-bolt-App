import React, { useEffect, useState } from 'react';
import { Table, message, Button, Drawer, Tooltip } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import Review1 from '../Review/Review1';
// import { supabase } from './supabaseClient'; // Import your Supabase client or API
import { format } from 'date-fns';

const TeamTimesheetTable = ({ startDate, endDate }) => {
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
            //     .from('timesheet')
            //     .select('*')
            //     .eq('approver_id', session?.user?.id)
            //     .eq('status', 'Submitted')
            // const today = new Date(); // Format today's date as needed
            // const today = format(new Date(), 'yyyy-MM-dd'); // Format today's date as needed
            const today = new Date().toISOString().slice(0, 10)
            // let data, error;

            // if (session?.user?.role_type === 'admin') {
            //     // Query for admins
            //     ({ data, error } = await supabase
            //         .from('timesheet')
            //         .select('*,user:user_id (*)')
            //         // .lt('last_date', today)
            //         .or(`last_date.lt.${today},approver_id.eq.${session?.user?.id}`)
            //         // .eq('status', 'Submitted')
            //     );
            // }  else {
            //     // Query for non-admins
            //     ({ data, error } = await supabase
            //         .from('timesheet')
            //         .select('*')
            //         .eq('approver_id', session?.user?.id)
            //         // .eq('status', 'Submitted')
            //     );
            // }
            const { data, error } = await supabase
                .from('timesheet')
                .select('*,user:user_id (user_name)')
                // .eq('approver_id', session?.user?.id)
                .neq('status', 'Draft').eq('organization_id', session?.user?.organization_id)
                .gte('timesheet_date', startDate)
                .lte('timesheet_date', endDate)
                .order('submitted_time', { ascending: false })
                ;

            if (error) {
                throw error;
            }
            console.log("TS", data)
            setData(data);
        } catch (error) {
            message.error('Failed to load timesheet data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate]);

    // Define the columns for the table
    const columns = [
        {
            title: 'Timesheet Date',
            dataIndex: 'timesheet_date',
            key: 'timesheet_date',
            render: (date) => new Date(date).toLocaleDateString(), // Format date as needed
        },
        {
            title: 'Name',
            dataIndex: ['user', 'user_name'],
            key: 'user',
            filters: Array.from(
                new Set(data?.map((record) => record?.user?.user_name))
            )?.map((name) => ({ text: name, value: name })), // Create unique filters from names
            onFilter: (value, record) => record?.user?.user_name === value,
        },
        {
            title: 'Submitted Time',
            // dataIndex: 'details',
            key: 'submitted_time',
            render: (record) => (
                <div>
                    {record?.submitted_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")}
                </div>
            )
        },
        {
            title: 'Review Time',
            // dataIndex: 'details',
            key: 'approver_details',
            render: (record) => (
                <div>
                    {record?.approver_details?.approved_time?.replace("T", " ").replace(/\.\d+Z$/, "")}
                </div>
            )
        },
        // {
        //     title: 'Review Comment',
        //     // dataIndex: 'details',
        //     key: 'approver_id',
        //     render: (record) => (
        //         <div>
        //             {record?.approver_details?.comment}
        //         </div>
        //     )
        // },
        {
            title: 'Review Comment',
            key: 'approver_id',
            render: (record) => {
                const comment = record?.approver_details?.comment || '';  // Ensure the comment is defined
                const truncatedComment = comment.length > 150 ? `${comment.substring(0, 100)}...` : comment;

                return (
                    <Tooltip title={comment}>  {/* Tooltip will show the full comment */}
                        <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px', // You can adjust this based on your table column width
                        }}>
                            {truncatedComment}  {/* Truncated comment for the table cell */}
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: Array.from(
                new Set(data?.map((record) => record?.status))
            )?.map((status) => ({ text: status, value: status })), // Create unique filters from status
            onFilter: (value, record) => record?.status === value,
        },
        // {
        //     title: 'Last Updated',
        //     dataIndex: 'updated_at',
        //     key: 'updated_at',
        //     render: (date) => new Date(date).toLocaleString(), // Format date and time
        // },
        // {
        //     title: 'Last Updated',
        //     dataIndex: 'updated_at',
        //     key: 'updated_at',
        //     render: (date) => new Date(date).toLocaleString(), // Format date and time
        // },
        // {
        //     title: 'Last Updated',
        //     dataIndex: 'updated_at',
        //     key: 'updated_at',
        //     render: (date) => new Date(date).toLocaleString(), // Format date and time
        // },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.status === 'Submitted' && <Button
                        type="primary"
                        // icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                        disabled={(record?.approver_id !== session?.user?.id && new Date() < new Date(record?.last_date))}
                        // onClick={() => handleEdit(record)}
                        onClick={() => handleOpenDrawer(record)}
                    >Approve / Reject</Button>}
                </div>
            ),
        },
    ];

    // Function to open the drawer and set the selected record
    const handleOpenDrawer = (record) => {
        console.log("edit", record)
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
            <Table size={'small'}
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
                {selectedRecord && <Review1 fetchData={fetchData} date={selectedRecord?.timesheet_date} employee={selectedRecord?.user_id} />}
            </Drawer>
        </>
    );
};

export default TeamTimesheetTable;

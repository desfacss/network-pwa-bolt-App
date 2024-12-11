import React, { useEffect, useState } from 'react';
import { Table, message, Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
// import { supabase } from './supabaseClient'; // Import your Supabase client or API
import { EditFilled, DeleteOutlined } from "@ant-design/icons";

const MyTimesheetTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const { session } = useSelector((state) => state.auth);

    // Fetch timesheet data from your backend
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('timesheet')
                .select('timesheet_date, status, updated_at')
                .eq('user_id', session?.user?.id)
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
            sorter: (a, b) => a?.timesheet_date?.localeCompare(b?.timesheet_date),
            render: (date) => new Date(date).toLocaleDateString(), // Format date as needed
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a?.status?.localeCompare(b?.status)
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a, b) => a?.updated_at?.localeCompare(b?.updated_at),
            render: (date) => new Date(date).toLocaleString(), // Format date and time
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="d-flex">
                    {record?.status !== 'Approved' && <Button
                        type="primary"
                        icon={<EditFilled />}
                        size="small"
                        className="mr-2"
                    // onClick={() => handleEdit(record)}
                    />}
                    {record?.status !== 'Approved' && <Button
                        type="primary" ghost
                        icon={<DeleteOutlined />}
                        size="small"
                    // onClick={() => handleDelete(record.id)}
                    />}
                </div>
            ),
        },
    ];

    return (
        <Table size={'small'}
            columns={columns}
            dataSource={data}
            rowKey="id" // Assuming `id` is unique
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default MyTimesheetTable;

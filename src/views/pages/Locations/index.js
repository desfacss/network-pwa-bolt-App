import { Button, Card, notification, Table, Drawer, Form, Input, DatePicker, Grid, message, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined, EditFilled, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Utils from 'utils';
import { serverErrorParsing } from "components/util-components/serverErrorParsing";

const { confirm } = Modal;

const Locations = () => {
    const componentRef = useRef(null);
    const [locations, setLocations] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const { session } = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const { useBreakpoint } = Grid;
    const screens = Utils.getBreakPoint(useBreakpoint());
    const isMobile = screens.length === 0 ? false : !screens.includes("lg");

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        let { data, error } = await supabase.from("locations").select("*").eq('organization_id', session?.user?.organization_id).order('name', { ascending: true });
        if (data) {
            setLocations(data);
        }
        if (error) {
            notification.error({ message: error?.message || "Failed to fetch locations" });
        }
    };

    const handleEdit = (record) => {
        setEditItem(record);
        form.setFieldsValue({
            name: record?.name,
            pin: record?.details?.pin,
            address: record?.details?.address
        })
        setHolidays(record.holidays || []);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from("locations").delete().eq("id", id);
        if (!error) {
            notification.success({ message: "Location deleted successfully" });
            fetchLocations();
        } else {
            notification.error({ message: error?.message || "Failed to delete Location" });
        }
    };

    const handleHolidayChange = (index, field, value) => {
        const updatedHolidays = [...holidays];
        updatedHolidays[index][field] = value;
        if (field === "date") {
            updatedHolidays[index].date = dayjs(value).format("YYYY-MM-DD"); // Ensure date is in 'YYYY-MM-DD'
            updatedHolidays[index].day = dayjs(value).format("dddd"); // Compute the day
        }
        setHolidays(updatedHolidays);
    };

    const addHoliday = () => {
        // setHolidays([
        //     ...holidays,
        //     { date: null, name: "", optional: false, day: "" }, // New row with default values
        // ]);
        setHolidays((prevHolidays) => [
            ...prevHolidays,
            { date: null, name: "", optional: false, day: "" }, // New row with default values
        ]);
    };

    const handleHolidayDelete = (index) => {
        const updatedHolidays = [...holidays];
        updatedHolidays.splice(index, 1);
        setHolidays(updatedHolidays);
    };

    const showDeleteConfirm = async (record) => {
        confirm({
            title: `Confirm deletion of ${record.name} ?`,
            icon: <ExclamationCircleFilled />,
            //   content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const { error } = await supabase.from('locations').delete().eq('id', record?.id);
                if (!error) {
                    notification.success({ message: "Location deleted" });
                    fetchLocations();
                } else {
                    notification.error({ message: serverErrorParsing(error?.message) || "Failed to delete Location" });
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Address",
            dataIndex: ["details", "address"],
            key: "address",
        },
        {
            title: "Pin",
            dataIndex: ["details", "pin"],
            key: "pin",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <div className="d-flex">
                    <Button type="primary" icon={<EditFilled />} size="small" className="mr-2"
                        onClick={() => handleEdit(record)} />
                    <Button type="primary" ghost icon={<DeleteOutlined />}
                        size="small" onClick={() => showDeleteConfirm(record)} />
                </div>
            ),
        },
    ];

    const holidayColumns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (_, record, index) => (
                <Input value={record.name} onChange={(e) => handleHolidayChange(index, "name", e.target.value)} />
            ),
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (_, record, index) => (
                <DatePicker
                    value={record.date ? dayjs(record.date, "YYYY-MM-DD") : null}
                    format="YYYY-MM-DD" // Ensure DatePicker displays in 'YYYY-MM-DD'
                    onChange={(date, dateString) => handleHolidayChange(index, "date", dateString)}
                // value={record.date ? dayjs(record.date) : null}
                // onChange={(date, dateString) => handleHolidayChange(index, "date", dateString)}
                />
            ),
        },
        {
            title: "Day",
            dataIndex: "day",
            key: "day",
            render: (_, record) => <Input value={record.day} disabled />,
        },
        {
            title: "Optional",
            dataIndex: "optional",
            key: "optional",
            render: (_, record, index) => (
                <Input type="checkbox" checked={record.optional}
                    onChange={(e) => handleHolidayChange(index, "optional", e.target.checked)} />
            ),
        },
        {
            title: "Actions",
            render: (_, __, index) => (
                <Button danger onClick={() => handleHolidayDelete(index)} >
                    Delete
                </Button>
            ),
        },
    ];

    const handleSubmit = async () => {
        const invalidRow = holidays?.some(row => !row?.name || !row?.date);
        if (invalidRow) {
            message.error(`Error: Some rows have empty name or date`);
            return
        }
        const values = await form.validateFields();
        const payload = {
            name: values?.name,
            details: values,
            holidays,
            organization_id: session?.user?.organization_id,
        };

        if (editItem) {
            const { error } = await supabase.from("locations").update(payload).eq("id", editItem.id);
            if (!error) {
                notification.success({ message: "Location updated successfully" });
                fetchLocations();
                setIsDrawerOpen(false);
                form.resetFields()
            } else {
                notification.error({ message: error.message });
            }
        } else {
            const { error } = await supabase.from("locations").insert(payload);
            if (!error) {
                notification.success({ message: "Location added successfully" });
                fetchLocations();
                setIsDrawerOpen(false);
                form.resetFields()
            } else {
                notification.error({ message: error.message });
            }
        }
    };

    return (
        <Card styles={{ body: { padding: "0px" } }}>
            <div className="d-flex p-2 justify-content-between align-items-center"
                style={{ marginBottom: "16px" }} >
                <h2 style={{ margin: 0 }}>Locations</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
                    Add Location
                </Button>
            </div>
            <div className="table-responsive" ref={componentRef}>
                <Table size={"small"} columns={columns} dataSource={locations}
                    rowKey={(record) => record.id} loading={!locations} pagination={false} />
            </div>
            <Drawer
                footer={null}
                width={isMobile ? "100%" : "50%"}
                title={editItem ? "Edit Location" : "Add Location"}
                open={isDrawerOpen}
                maskClosable={false}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setEditItem(null);
                    setHolidays()
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="Name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="pin" label="Pin">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input />
                    </Form.Item>
                    <h4>Holidays</h4>
                    <Table dataSource={holidays} columns={holidayColumns} rowKey={(record, index) => index} pagination={false} />
                    <Button onClick={addHoliday} type="dashed" style={{ marginTop: "16px" }}>
                        Add Holiday
                    </Button>
                    <div style={{ marginTop: "16px" }}>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </Card >
    );
};

export default Locations;

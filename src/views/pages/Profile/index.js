import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button, Modal, Divider } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
// import DynamicForm from '../net_app/DynamicForm';
// import DynamicFormCustom from '../net_app/DynamicFormCustom';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
// import PivotTableComponent from './PT';
// import Timesheet from './AntDTable9';
// import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChangePassword from 'views/auth-views/components/ChangePassword';
import FileUpload from './FileUpload';
import { useNavigate } from 'react-router-dom';
// import Timesheet1 from './working-static-fixed';

const Profile = () => {
    const [schema, setSchema] = useState();
    const [formData, setFormData] = useState();
    const [edit, setEdit] = useState(false);
    const [updateId, setUpdateId] = useState();
    const navigate = useNavigate();
    const { session } = useSelector((state) => state.auth);

    const userData = session?.user

    if (!userData) return null;

    const { details } = userData;

    const getForms = async (formName) => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', formName).single()
        console.log(data, formName)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    const showModal = async (data, formName, id) => {
        getForms(formName)
        setFormData(data)
        id && setUpdateId(id)
        setEdit(true);
    };

    const onFinish = async (values) => {
        console.log("payload", values, formData);
        const { data, error } = await supabase.from('users')
            .update({
                role_type: values?.role_type,
                user_name: values?.firstName + " " + values?.lastName,
                details: { ...values, user_name: values?.firstName + " " + values?.lastName },
            })
            .eq('id', session?.user?.id);

        if (error) {
            console.log("Error", error.message);
            return;
        }
        setEdit(false);

        navigate(0);
        // fetchProfile();
    };

    const handleOk = () => {
        setEdit(false);
    };

    const handleCancel = () => {
        setEdit(false);
    };

    const renderDescriptionItem = (label, value) => {
        return value ? <Descriptions.Item label={label}>{value}</Descriptions.Item> : null;
    };

    return (
        <Card>
            {(edit && schema) && <Modal footer={null}
                title={schema?.data_schema?.title || ""}
                visible={edit}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                {/* <DynamicForm schema={schema?.data} initialValues={[{ ...formData }]} /> */}
                <DynamicForm schemas={schema} formData={formData} updateId={updateId} onFinish={onFinish} />
            </Modal>}
            {/* Profile Start ************************************* */}
            <Card title={
                <div style={{
                    display: 'flex', alignItems: 'center'
                    // justifyContent: 'space-between',
                }}>
                    <span className='mr-2'>Personal Info</span>
                    <Button className='mr-5' icon={details ? <EditOutlined /> : <PlusOutlined />} onClick={e => showModal(details, 'user_self_edit_form')}>
                    </Button>
                    <ChangePassword />
                </div>
            }
            >
                <div className='ml-3'>
                    <Descriptions column={1}>
                        {renderDescriptionItem("Name", details?.user_name)}
                        {renderDescriptionItem("Designation", details?.designation)}
                        {renderDescriptionItem("Role Type", userData?.role_type?.replace("_", " "))}
                        {renderDescriptionItem("Department", details?.department)}
                    </Descriptions>
                    <Divider />
                    <Descriptions column={1}>
                        {renderDescriptionItem("Email", details?.email)}
                        {renderDescriptionItem("Mobile", details?.mobile)}
                    </Descriptions>
                    <Divider />
                    <Descriptions column={1}>
                        {renderDescriptionItem("Date of Birth", details?.birthDate)}
                        {renderDescriptionItem("Address", details?.address)}
                        {renderDescriptionItem("Emergency Contact", details?.emergencyContact)}
                        {renderDescriptionItem("Date of Joining", details?.joiningDate)}
                    </Descriptions>
                    <Divider />
                    <Descriptions column={1}>
                        {renderDescriptionItem("HR Contact", userData?.hr?.user_name + " ( " + userData?.hr?.details?.mobile + " ) ")}
                        {renderDescriptionItem("Line Manager", userData?.manager?.user_name + " ( " + userData?.manager?.details?.mobile + " ) ")}
                    </Descriptions>
                </div>
            </Card >
            {/* <FileUpload /> */}
        </Card >
    );
};

export default Profile;

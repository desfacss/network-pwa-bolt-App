import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button, Modal } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
// import DynamicForm from '../net_app/DynamicForm';
// import DynamicFormCustom from '../net_app/DynamicFormCustom';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
// import PivotTableComponent from './PT';
import Timesheet from './AntDTable9';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChangePassword from 'views/auth-views/components/ChangePassword';
// import Timesheet1 from './working-static-fixed';

const { TabPane } = Tabs;

const Profile = () => {
    const [userId, setUserId] = useState();
    const [userData, setUserData] = useState();
    const [schema, setSchema] = useState();
    const [businessData, setBusinessData] = useState();
    const [formData, setFormData] = useState();
    const [edit, setEdit] = useState(false);
    const [updateId, setUpdateId] = useState();
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const { session } = useSelector((state) => state.auth);

    const getForms = async (formName) => {
        const { data, error } = await supabase.from('forms').select('*').is('form_type', null).eq('name', formName).single()
        console.log(data, formName)
        if (data) {
            console.log(data)
            setSchema(data)
        }
    }

    const getInfo = async () => {
        const { data, error } = await supabase.from('users').select("*").eq('id', userId);
        // console.log("User", data[0]);
        if (error) {
            return console.log("Error", error.message);
        }
        if (data && data[0]) {
            setUserData(data[0]);
        }
    };
    // const getBusiness = async () => {
    //     const { data, error } = await supabase.from('businesses').select("*").eq('user_id', userId);
    //     console.log("Business", data);
    //     if (error) {
    //         return console.log("Error", error.message);
    //     }
    //     if (data) {
    //         setBusinessData(data);
    //     }
    // };

    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                setUserId(session?.user?.id);
            });
        };
        getUser();
    }, []);

    useEffect(() => {
        if (userId) {
            getInfo();
            // getBusiness();
        }
    }, [userId]);

    const showModal = async (data, formName, id) => {
        getForms(formName)
        setFormData(data)
        id && setUpdateId(id)
        setEdit(true);
        // const { data2, error } = await supabase.auth.api.getUserByEmail('ratedrnagesh28@gmail.com')
        // if (data2) {
        //     console.log("UE", data2)
        // } else {
        //     console.log("UE", error)
        // }
    };

    // const onFinish = () => {
    //     const { data, error } = await supabase.from(schema?.db_schema?.table)
    //             .upsert([
    //                 {
    //                     user_id: userId,
    //                     [schema?.db_schema?.column]: e?.formData // Send each value separately
    //                 },
    //             ], { onConflict: 'user_id' });
    //         if (error) {
    //             return console.log("Error", error);
    //         }
    // };

    const onFinish = async (values) => {
        console.log("payload", values);
        const { data, error } = await supabase.from('users')
            .update({
                role_type: values?.role_type,
                user_name: values?.firstName + " " + values?.lastName,
                details: { ...values, user_name: values?.firstName + " " + values?.lastName },
            })
            .eq('id', userId);

        if (error) {
            console.log("Error", error.message);
            return;
        }
        setEdit(false);
        getInfo();
    };

    const handleOk = () => {
        setEdit(false);
    };

    const handleCancel = () => {
        setEdit(false);
    };

    if (!userData) return null;

    const { details } = userData;
    console.log("U", userData)
    const renderDescriptionItem = (label, value) => {
        return value ? <Descriptions.Item label={label}>{value}</Descriptions.Item> : null;
    };

    const changePw = async () => {
        const { data, error } = await supabase.auth.updateUser({
            email: "ratedrnagesh28@gmail.com",
            password: "Test@1234"
        })
    }

    const openChangePasswordModal = () => {
        setShowChangePasswordModal(true);
    };

    const closeChangePasswordModal = () => {
        setShowChangePasswordModal(false);
    };

    return (
        <Card>
            {/* <Timesheet /> */}
            {/* <Timesheet1 /> */}
            {/* <PivotTableComponent /> */}
            {/* <DynamicFormCustom /> */}
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
                    display: 'flex',
                    // justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span className='mr-1'>Personal Info</span>
                    <Button type="text" ghost icon={details ? <EditOutlined /> : <PlusOutlined />} onClick={e => showModal(details, 'self_profile_form')}>

                    </Button>
                </div>
            }
            >
                <Descriptions column={1}>
                    {renderDescriptionItem("Name", details?.user_name)}
                    {renderDescriptionItem("Email", details?.email)}
                    {renderDescriptionItem("Mobile", details?.mobile)}
                    {/* {renderDescriptionItem("Organization", details?.orgName)} */}
                    {renderDescriptionItem("Role", details?.role?.replace("_", " "))}
                </Descriptions>
            </Card >
            <Modal
                title="Change Password"
                visible={showChangePasswordModal}
                onCancel={closeChangePasswordModal}
                footer={null}
            >
                <ChangePassword onConfirm={closeChangePasswordModal} />
            </Modal>
            {/* <Button onClick={changePw}>Change Password</Button><br /> */}
            <Button onClick={openChangePasswordModal}>Change Password</Button><br />
            {/* {userData?.role_type === 'employee' && <Link to='/app/notifications'><Button className='mt-3'>Manage Notifications</Button></Link>} */}
            {/* ***************************Profile End */}
        </Card >
    );
};

export default Profile;

import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button, Modal } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
// import DynamicForm from '../net_app/DynamicForm';
// import DynamicFormCustom from '../net_app/DynamicFormCustom';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
// import PivotTableComponent from './PT';
import Timesheet from './AntDTable9';
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

    const getForms = async (formName) => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', formName).single()
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

    const onFinish = () => {
        // const { data, error } = await supabase.from(schema?.db_schema?.table)
        //         .upsert([
        //             {
        //                 user_id: userId,
        //                 [schema?.db_schema?.column]: e?.formData // Send each value separately
        //             },
        //         ], { onConflict: 'user_id' });
        //     if (error) {
        //         return console.log("Error", error);
        //     }
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

    return (
        <Card>
            <Timesheet />
            {(edit && schema) && <Modal footer={null}
                title={schema?.data_schema?.title || ""}
                visible={edit}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <DynamicForm schemas={schema} formData={formData} updateId={updateId} onFinish={onFinish} />
            </Modal>}

        </Card >
    );
};

export default Profile;

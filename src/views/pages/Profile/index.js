import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button, Modal } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
// import DynamicForm from '../net_app/DynamicForm';
// import DynamicFormCustom from '../net_app/DynamicFormCustom';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

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
            {/* <Card title="">
                <h3>{reg_info?.firstName} {reg_info?.lastName}</h3>
                <p>Individual bio goes here,.. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum </p>
            </Card> */}
            <Card title={
                <div style={{
                    display: 'flex',
                    // justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span className='mr-1'>Personal Info</span>
                    <Button type="text" ghost icon={details ? <EditOutlined /> : <PlusOutlined />} onClick={e => showModal(details, 'profile_form')}>

                    </Button>
                </div>
            }
            >
                <Descriptions column={1}>
                    {/* {renderDescriptionItem("First Name", reg_info?.firstName)}
                    {renderDescriptionItem("Last Name", reg_info?.lastName)} */}
                    {renderDescriptionItem("Name", details?.userName)}
                    {renderDescriptionItem("Email", details?.email)}
                    {renderDescriptionItem("Mobile", details?.mobile)}
                    {renderDescriptionItem("Organization", details?.orgName)}
                    {renderDescriptionItem("Role", details?.role?.replace("_", " "))}
                    {/* {renderDescriptionItem("User Type", reg_info?.registrationType)} */}
                </Descriptions>
            </Card >
            {/* <Card title="Social Media Links">
                <Descriptions column={1}>
                    {renderDescriptionItem("Twitter", personal_reg_info?.twitter)}
                    {renderDescriptionItem("Facebook", personal_reg_info?.facebook)}
                    {renderDescriptionItem("Instagram", personal_reg_info?.instagram)}
                    {renderDescriptionItem("LinkedIn", personal_reg_info?.linkedin)}
                </Descriptions>
            </Card>
            <Card title="Currently Working">
                <Descriptions column={1}>
                    {renderDescriptionItem("Company Name", ind_reg?.companyName)}
                    {renderDescriptionItem("Position Title", ind_reg?.positionTitle)}
                </Descriptions>
            </Card>
            <Card title="Networking">
                <Descriptions column={1}>
                    {renderDescriptionItem("I Can Offer", networking?.icanoffer?.join(', '))}
                    {renderDescriptionItem("I'm Looking For", networking?.imlookingfor?.join(', '))}
                   </Descriptions>
            </Card>
            <Tabs defaultActiveKey="0"
                tabBarExtraContent={{
                    right: <Button type="primary" ghost onClick={e => showModal(null, 'business_info', null)}>
                        + Business
                    </Button>,
                }}
            >
                {businessData?.map((business, index) => (
                    <TabPane tab=
                        {
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span >{business?.info?.companyName}</span>
                                <Button type="text" icon={<EditOutlined />} ghost onClick={e => showModal(business?.info, 'business_info', business?.id)}>
                                   
                                </Button>
                            </div>
                        }
                        key={`business-${index}`}>
                        <Card >
                            <Descriptions column={1}>
                                {renderDescriptionItem("Position Title", business?.info?.positionTitle)}
                                {renderDescriptionItem("Industry Sector", business?.info?.industrySector)}
                                {renderDescriptionItem("Legal Structure", business?.info?.legalStructure)}
                                {renderDescriptionItem("Innovation Plans", business?.info?.innovationPlans)}
                                {renderDescriptionItem("Expansion Plans", business?.info?.expansionPlans)}
                                {renderDescriptionItem("Products/Services", business?.info?.productsOrServices)}
                                {renderDescriptionItem("Annual Turnover", business?.info?.annualTurnoverRange)}
                                {renderDescriptionItem("Establishment Year", business?.info?.establishmentYear)}
                                {renderDescriptionItem("Location", business?.info?.location)}
                                {renderDescriptionItem("Direct Employment", business?.info?.directEmployment)}
                                {renderDescriptionItem("Indirect Employment", business?.info?.indirectEmployment)}
                                {renderDescriptionItem("Nagarathar Involvement", business?.info?.nagaratharInvolvement)}
                            </Descriptions>
                        </Card>
                    </TabPane>
                ))}
            </Tabs> */}
        </Card >
    );
};

export default Profile;

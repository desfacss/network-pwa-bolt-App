import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Modal, Divider } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ChangePassword from 'views/auth-views/components/ChangePassword';
// import FileUpload from './FileUpload';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [schema, setSchema] = useState();
    const [formData, setFormData] = useState();
    const [edit, setEdit] = useState(false);
    const [updateId, setUpdateId] = useState();
    const [profileFields, setProfileFields] = useState([]);

    const navigate = useNavigate();
    const { session } = useSelector((state) => state.auth);

    const userData = session?.user
    const organization = userData?.organization?.app_settings?.workspace || 'dev'


    useEffect(() => {
        const fetchOrgSettings = async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('user_profile_settings')
                .eq('app_settings->>workspace', organization)
                .single();

            if (error) {
                console.error("Error fetching organization settings:", error);
            } else if (data) {
                console.log("profile_fields", data?.user_profile_settings)
                setProfileFields(data?.user_profile_settings || []);
            }
        };

        if (organization) {
            fetchOrgSettings();
        }
    }, [organization]);

    if (!userData) return null;

    const { details } = userData;

    const getForms = async (formName) => {
        const { data, error } = await supabase.from('forms').select('*').eq('name', formName).single()
        if (data) {
            // console.log(data)
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
        // console.log("payload", values, formData);
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

    // const renderDescriptionItem = (label, value) => {
    //     return value ? <Descriptions.Item label={label}>{value}</Descriptions.Item> : null;
    // };

    const getValueByPath = (obj, path) => {
        return path?.reduce((current, key) =>
            current && current[key] !== undefined ? current[key] : undefined, obj);
    };

    const formatCustomValue = (obj, custom_path, custom_format) => {
        const values = custom_path?.map(path => getValueByPath(obj, path));
        return custom_format?.replace(/{(\d+)}/g, (_, index) => values[index] || '');
    };

    const renderDynamicDescriptionItems = () => {
        const groups = profileFields?.groups?.sort((a, b) => a.order - b.order);

        return groups?.map((group, idx) => (
            <React.Fragment key={group.name}>
                {group.show_group_name && <Descriptions title={group.name} column={1} />}
                <Descriptions column={1}>
                    {group.fields.sort((a, b) => a.order - b.order).map(field => (
                        <Descriptions.Item key={field.value} label={field.label}>
                            {field.custom_format
                                ? formatCustomValue(userData, field.custom_path, field.custom_format)
                                : getValueByPath(userData, field.path) || 'N/A'}
                        </Descriptions.Item>
                    ))}
                </Descriptions>
                {profileFields?.dividers?.includes(group.name) && idx < groups.length - 1 && <Divider />}
            </React.Fragment>
        ));
    };

    return (
        <Card>
            {(edit && schema) && <Modal footer={null}
                title={schema?.data_schema?.title || ""}
                open={edit} onOk={handleOk} onCancel={handleCancel} >
                {/* <DynamicForm schema={schema?.data} initialValues={[{ ...formData }]} /> */}
                <DynamicForm schemas={schema} formData={formData} updateId={updateId} onFinish={onFinish} />
            </Modal>}
            {/* Profile Start ************************************* */}
            <Card title={
                // <div style={{
                //     display: 'flex', alignItems: 'center'
                //     // justifyContent: 'space-between',
                // }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'left',
                        // justifyContent: 'space-between', // Ensures proper spacing
                        overflow: 'visible', // Prevent cropping
                    }}
                >
                    <span className='mr-2'>Personal Info</span>
                    <Button className='mr-5' icon={details ? <EditOutlined /> : <PlusOutlined />} onClick={e => showModal(details, 'user_self_edit_form')}>
                    </Button>
                    <ChangePassword />
                </div>
            }
            >
                <div className='ml-3'>
                    {/* <Descriptions column={1}>
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
                    </Descriptions> */}
                    {renderDynamicDescriptionItems()}
                </div>
            </Card >
            {/* <FileUpload /> */}
        </Card >
    );
};

export default Profile;

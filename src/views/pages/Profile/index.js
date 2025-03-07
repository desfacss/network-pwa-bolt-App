import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Modal, Divider, Tabs, Switch } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
import { EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ChangePassword from 'views/auth-views/components/ChangePassword';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePic from './ProfilePic';
import DynamicViews from '../DynamicViews';
import ShareButton from 'components/common/WhatsappShare';

const Profile = () => {
    const { user_name } = useParams();
    const navigate = useNavigate();
    const { session } = useSelector((state) => state.auth);

    const [schema, setSchema] = useState();
    const [formData, setFormData] = useState();
    const [edit, setEdit] = useState(false);
    const [updateId, setUpdateId] = useState();
    const [profileFields, setProfileFields] = useState([]);
    const [userData, setUserData] = useState();
    const [privacySettings, setPrivacySettings] = useState({}); // Store privacy settings

    const filters = [{ column: 'user_id', value: userData?.id || session?.user?.id }];

    useEffect(() => {
        const fetchUserData = async () => {
            const userName = (user_name && decodeURIComponent(user_name)) || session?.user?.user_name;
            if (!userName) return;

            const { data, error } = await supabase
                .from('users')
                .select('*, profile_privacy') // Include profile_privacy column
                .eq('user_name', userName)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
            } else {
                setUserData(data);
                setPrivacySettings(data?.profile_privacy || {}); // Load privacy settings
            }
        };
        if (user_name) {
            fetchUserData();
        } else {
            setUserData(session?.user);
            setPrivacySettings(session?.user?.profile_privacy || {});
        }
    }, [user_name, session]);

    const organization = "ibcn" || userData?.organization?.app_settings?.workspace || 'dev';

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
                setProfileFields(data?.user_profile_settings || []);
            }
        };

        if (organization) {
            fetchOrgSettings();
        }
    }, [organization]);

    const details = userData?.details;

    const getForms = async (formName) => {
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('name', formName)
            .eq('organization_id', session?.user?.organization_id)
            .single();
        if (data) {
            setSchema(data);
        }
    };

    const showModal = async (data, formName, id) => {
        getForms(formName);
        setFormData(data);
        id && setUpdateId(id);
        setEdit(true);
    };

    const onFinish = async (values) => {
        const user_name = values?.firstName + " " + values?.lastName;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .update({
                role_type: values?.role_type,
                user_name: user_name,
                details: { ...values, user_name: user_name },
            })
            .eq('id', session?.user?.id);

        if (userError) {
            console.log("Error updating users table:", userError.message);
            return;
        }

        const { data: memberData, error: memberError } = await supabase
            .from('ib_members')
            .update({
                user_id: session?.user?.id,
                short_name: user_name,
                details: { ...values, user_name: user_name },
            })
            .eq('user_id', session?.user?.id);

        if (memberError) {
            console.log("Error updating ib_members table:", memberError.message);
        }

        setEdit(false);
        navigate(0);
    };

    const handleOk = () => setEdit(false);
    const handleCancel = () => setEdit(false);

    const togglePrivacy = async (key, isPrivate) => {
        const updatedPrivacySettings = { ...privacySettings, [key]: isPrivate };
        setPrivacySettings(updatedPrivacySettings);

        // Update the profile_privacy column in the users table
        const { error } = await supabase
            .from('users')
            .update({ profile_privacy: updatedPrivacySettings })
            .eq('id', userData?.id || session?.user?.id);

        if (error) {
            console.error("Error updating privacy settings:", error);
        }
    };

    const getValueByPath = (obj, path) => {
        return path?.reduce((current, key) => {
            if (current && current[key] !== undefined) {
                return current[key];
            }
            return undefined;
        }, obj);
    };

    const formatCustomValue = (obj, custom_path, custom_format) => {
        const values = custom_path?.map(path => {
            const value = getValueByPath(obj, path);
            return Array.isArray(value) ? value.join(', ') : value;
        });
        return custom_format?.replace(/{(\d+)}/g, (_, index) => values[index] || '');
    };

    const renderDynamicDescriptionItems = () => {
        const groups = profileFields?.groups?.sort((a, b) => a.order - b.order);

        return groups?.map((group, idx) => {
            const isGroupPrivate = group.private || privacySettings[group.name];
            const canEditPrivacy = session?.user?.id === userData?.id; // Only owner can edit privacy
            const showGroup = !isGroupPrivate || canEditPrivacy;

            if (!showGroup) return null;

            return (
                <React.Fragment key={group.name}>
                    {group.show_group_name && (
                        <Descriptions
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {group.name}
                                    {group.privacy_control && canEditPrivacy && (
                                        <Switch
                                            checkedChildren={<EyeOutlined />}
                                            unCheckedChildren={<EyeInvisibleOutlined />}
                                            checked={!privacySettings[group.name]}
                                            onChange={(checked) => togglePrivacy(group.name, !checked)}
                                            style={{ marginLeft: 8 }}
                                        />
                                    )}
                                </div>
                            }
                            column={1}
                        />
                    )}
                    <Descriptions column={1}>
                        {group.fields.sort((a, b) => a.order - b.order).map(field => {
                            const isFieldPrivate = field.private || privacySettings[field.value];
                            const showField = !isFieldPrivate || canEditPrivacy;

                            if (!showField) return null;

                            return (
                                <Descriptions.Item
                                    key={field.value}
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {field.label}
                                            {field.privacy_control && canEditPrivacy && (
                                                <Switch
                                                    checkedChildren={<EyeOutlined />}
                                                    unCheckedChildren={<EyeInvisibleOutlined />}
                                                    checked={!privacySettings[field.value]}
                                                    onChange={(checked) => togglePrivacy(field.value, !checked)}
                                                    style={{ marginLeft: 8 }}
                                                />
                                            )}
                                        </div>
                                    }
                                >
                                    {field.custom_format
                                        ? formatCustomValue(userData, field.custom_path, field.custom_format)
                                        : (Array.isArray(getValueByPath(userData, field.path))
                                            ? getValueByPath(userData, field.path).join(', ')
                                            : getValueByPath(userData, field.path) || 'N/A')}
                                </Descriptions.Item>
                            );
                        })}
                    </Descriptions>
                    {profileFields?.dividers?.includes(group.name) && idx < groups.length - 1 && <Divider />}
                </React.Fragment>
            );
        });
    };

    if (!userData) return null;

    const tabItems = [
        {
            key: 'profile',
            label: 'Profile',
            children: (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'left' }}>
                            <span className='mr-2'>Personal Info</span>
                            {userData && session?.user?.id === userData?.id && (
                                <>
                                    <Button
                                        icon={details ? <EditOutlined /> : <PlusOutlined />}
                                        onClick={e => showModal(details, 'user_self_edit_form')}
                                    />
                                    <ChangePassword />
                                </>
                            )}
                        </div>
                    }
                >
                    <div className='ml-3'>
                        <ProfilePic />
                        {renderDynamicDescriptionItems()}
                    </div>
                </Card>
            ),
        },
        {
            key: 'businesses',
            label: 'Businesses',
            children: (
                <DynamicViews entityType={'ib_businesses'} fetchFilters={filters} tabs={["gridview"]} />
            ),
        },
    ];

    return (
        <Card>
            {(edit && schema) && (
                <Modal
                    footer={null}
                    title={schema?.data_schema?.title || ""}
                    open={edit}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <DynamicForm schemas={schema} formData={formData} updateId={updateId} onFinish={onFinish} />
                </Modal>
            )}
            <ShareButton />
            <Tabs defaultActiveKey="profile" items={tabItems} />
        </Card>
    );
};

export default Profile;
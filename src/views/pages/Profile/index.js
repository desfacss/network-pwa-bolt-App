import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Divider, Tabs, Switch, Drawer, Avatar, message, Empty } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import DynamicForm from '../DynamicForm';
import { EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, LeftOutlined, MailOutlined, ShopOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ChangePassword from 'views/auth-views/components/ChangePassword';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePic from './ProfilePic';
import DynamicViews from '../DynamicViews';
import Channels from '../Channels';
import DetailOverview from '../DynamicViews/DetailOverview';
import { sendEmail } from 'components/common/SendEmail';
import trackEvent from 'components/util-components/trackEvent'; // Import the tracking utility
import { REACT_APP_RESEND_FROM_EMAIL } from 'configs/AppConfig';
// import App

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
    const [privacySettings, setPrivacySettings] = useState({});

    const filters = [{ column: 'user_id', value: userData?.id || session?.user?.id }];
    const EmptyMessage = (
        <Empty
            image={<ShopOutlined style={{ fontSize: "48px", color: "#333333" }} />}
            description={
                <>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#333333" }}>
                        No Business details added!
                    </span>
                    <br />
                    You can add Business details here!
                </>
            }
        />
    );

    useEffect(() => {
        const fetchUserData = async () => {
            // const userName = (user_name && decodeURIComponent(user_name)) || session?.user?.user_name;
            const userName = (user_name) || session?.user?.id;
            if (!userName) return;

            const { data, error } = await supabase
                .from('users')
                .select('*, profile_privacy')
                // .eq('user_name', userName)
                .eq('id', userName)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
            } else {
                setUserData(data);
                setPrivacySettings(data?.profile_privacy || {});
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
                .from('y_view_config')
                .select('details_overview')
                .eq('entity_type', "users")
                .single();

            if (error) {
                console.error("Error fetching organization settings:", error);
            } else if (data) {
                setProfileFields(data?.details_overview || []);
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
        setFormData({ ...data, name: data.user_name });
        id && setUpdateId(id);
        setEdit(true);
        // Track Edit Profile button click
        trackEvent({
            eventName: 'edit_profile_click',
            category: 'Profile',
            label: 'Edit Profile Button',
        });
    };

    const onFinish = async (values) => {
        const user_name = values?.firstName + " " + values?.lastName;

        const updatedDetails = {
            ...userData?.details,
            user_name,
            native: values.native || userData?.details?.native,
            kovil: values.kovil || userData?.details?.kovil,
            location: values.location || userData?.details?.location,
            orgName: values.orgName || userData?.details?.orgName,
            firstName: values.firstName || userData?.details?.firstName,
            lastName: values.lastName || userData?.details?.lastName,
            intro: values.intro,
            membership_type: values.membership_type,
            email: values.email,
            mobile: values.mobile,
            address: values.address,
            web: values.web,
            twitter: values.twitter,
            linkedin: values.linkedin,
            facebook: values.facebook,
            instagram: values.instagram,
            company: values.company,
            user_name,
            food: values.food || userData?.details?.food,
            gender: values.gender || userData?.details?.gender,
            primary_stream: values.primary_stream || userData?.details?.primary_stream || [userData?.details?.primary_stream],
            secondary_stream: values.secondary_stream || userData?.details?.secondary_stream || [userData?.details?.secondary_stream],
            room: values.room || userData?.details?.room,
        };

        // const updatedAdditionalDetails = {
        //     ...userData?.additional_details,
        //     food: values.food || userData?.additional_details?.food,
        //     gender: values.gender || userData?.additional_details?.gender,
        //     streams: values.streams || userData?.additional_details?.streams || [userData?.additional_details?.streams?.[0]],
        //     room_no: values.room_no || userData?.additional_details?.room_no,
        // };

        const { data: updatedUserData, error: userError } = await supabase
            .from('users')
            .update({
                role_type: values?.role_type || userData?.role_type,
                user_name: user_name,
                details: updatedDetails,
                // additional_details: updatedAdditionalDetails,
            })
            .eq('id', session?.user?.id)
            .select()
            .single();

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

        setUserData(updatedUserData);
        setEdit(false);
        navigate(0);
        // Track successful form submission
        trackEvent({
            eventName: 'profile_form_submit',
            category: 'Profile',
            label: 'Profile Edit Form',
        });
    };

    const handleOk = () => setEdit(false);
    const handleCancel = () => setEdit(false);

    const togglePrivacy = async (key, isPrivate) => {
        const updatedPrivacySettings = { ...privacySettings, [key]: isPrivate };
        setPrivacySettings(updatedPrivacySettings);

        const { error } = await supabase
            .from('users')
            .update({ profile_privacy: updatedPrivacySettings })
            .eq('id', userData?.id || session?.user?.id);

        if (error) {
            console.error("Error updating privacy settings:", error);
        }
        // Track privacy toggle
        trackEvent({
            eventName: 'privacy_toggle',
            category: 'Profile',
            label: `${key} set to ${isPrivate ? 'private' : 'public'}`,
        });
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

    const handleConnect = async () => {
        const senderEmail = session?.user?.details?.email;
        const recipientEmail = userData?.details?.email;

        if (!senderEmail || !recipientEmail) {
            message.error('Email addresses are missing.');
            return;
        }

        const senderName = `${session?.user?.details?.firstName} ${session?.user?.details?.lastName}`;
        const recipientName = `${userData?.details?.firstName} ${userData?.details?.lastName}`;

        const senderMobile = session?.user?.details?.mobile;
        const recipientMobile = userData?.details?.mobile;

        // Construct profile links
        const senderProfileLink = `${window.location.origin}/app/members${session?.user?.id}`; // Assuming profile route is /profile/:user_id
        const recipientProfileLink = `${window.location.origin}/app/members/${userData?.id}`;

        if (!senderEmail || !recipientEmail) {
            message.error('Email addresses are missing.');
            return;
        }

        const emails = [
            {
                from: `IBCN2025 NO-REPLY <${REACT_APP_RESEND_FROM_EMAIL}>`,
                to: [recipientEmail, senderEmail],
                subject: `Connection Request: ${senderName} & ${recipientName}`,
                html: `
                    <p>Hello ${recipientName} & ${senderName},</p>
                    <p>${senderName} wants to connect with ${recipientName}.</p>
                    <p>Here's how you can reach each other:</p>
                    <ul>
                        <li>
                            ${senderName}:
                            <ul>
                                <li>Email: <strong>${senderEmail}</strong></li>
                                <li>Mobile: <strong>${senderMobile || 'N/A'}</strong></li>
                                <li>Profile: <a href="${senderProfileLink}">${senderProfileLink}</a></li>
                            </ul>
                        </li>
                        <li>
                            ${recipientName}:
                            <ul>
                                <li>Email: <strong>${recipientEmail}</strong></li>
                                <li>Mobile: <strong>${recipientMobile || 'N/A'}</strong></li>
                                <li>Profile: <a href="${recipientProfileLink}">${recipientProfileLink}</a></li>
                            </ul>
                        </li>
                    </ul>
                    <p>Connect directly using the information above. Do not reply here.</p>
                    <p>Ignore if not intended. Contact ibcnblr@gmail.com for help.</p>
                    <p>Best Regards,<br/>IBCN NetworkX Team</p>
                `,
            },
            // {
            //     // from: `UKPE Timesheet <${process.env.REACT_APP_RESEND_FROM_EMAIL}>`,
            //     from: `IBCN2025 NO-REPLY<${REACT_APP_RESEND_FROM_EMAIL}>`,
            //     to: [recipientEmail, senderEmail],
            //     subject: `Connection Request from ${senderName}`,
            //     html: `
            //         <p>Hello ${recipientName},</p>
            //         <p>${senderName} would like to connect with you. You can reach ${senderName} at: <strong>${senderEmail}</strong>.</p>
            //         <p>Do not reply directly to this email. Contact them directly on email.</p>
            //         <p>If you are not the intended recipient, you can safely ignore this message or contact ibcnblr@gmail.com for assistance.</p>
            //         <p>Best Regards,<br/>IBCN NetworkX Team</p>
            //     `,
            // },
            // {
            //     // from: `UKPE Timesheet <${process.env.REACT_APP_RESEND_FROM_EMAIL}>`,
            //     from: `IBCN2025 NO-REPLY <${REACT_APP_RESEND_FROM_EMAIL}>`,
            //     to: [senderEmail],
            //     subject: `Connection Request Sent to ${recipientName}`,
            //     html: `
            //         <p>Hello ${senderName},</p>
            //         <p>You have sent a connection request to ${recipientName}. You can reach at: <strong>${recipientEmail}</strong>.</p>
            //         <p>Do not reply directly to this email. Contact them directly on email.</p>
            //         <p>If you are not the intended recipient, you can safely ignore this message or contact ibcnblr@gmail.com for assistance.</p>
            //         <p>Best Regards,<br/>IBCN NetworkX Team</p>
            //     `,
            // },
        ];

        const success = await sendEmail(emails);
        console.log('success',success)
        // if (success) {
        //     message.success('Connection request sent successfully!');
        //     // Track successful connection request
        //     trackEvent({
        //         eventName: 'connect_email',
        //         category: 'Profile',
        //         label: 'Connect via Email Button',
        //     });
        // } else {
        //     message.error('Failed to send connection request.');
        // }
    };

    const renderDynamicDescriptionItemsTabs = (group) => {
        const isGroupPrivate = group?.private || privacySettings[group?.name];
        const canEditPrivacy = session?.user?.id === userData?.id;
        const showGroup = !isGroupPrivate || canEditPrivacy;

        if (!showGroup) return null;

        return (
            <div key={group?.name}>
                {group?.show_group_name && (
                    <Descriptions
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {group?.name}
                                {group?.privacy_control && canEditPrivacy && (
                                    <Switch
                                        checkedChildren={<EyeOutlined />}
                                        unCheckedChildren={<EyeInvisibleOutlined />}
                                        checked={!privacySettings[group?.name]}
                                        onChange={(checked) => togglePrivacy(group?.name, !checked)}
                                        style={{ marginLeft: 8 }}
                                    />
                                )}
                            </div>
                        }
                        column={1}
                    />
                )}
                <Descriptions column={1}>
                    {group?.fields?.sort((a, b) => a.order - b.order)?.map(field => {
                        const isFieldPrivate = field?.private || privacySettings[field?.value];
                        const showField = !isFieldPrivate || canEditPrivacy;

                        if (!showField) return null;

                        return (
                            <Descriptions.Item
                                key={field?.value}
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {field?.label}
                                        {field?.privacy_control && canEditPrivacy && (
                                            <Switch
                                                checkedChildren={<EyeOutlined />}
                                                unCheckedChildren={<EyeInvisibleOutlined />}
                                                checked={!privacySettings[field?.value]}
                                                onChange={(checked) => togglePrivacy(field?.value, !checked)}
                                                style={{ marginLeft: 8 }}
                                            />
                                        )}
                                    </div>
                                }
                            >
                                {field?.custom_format
                                    ? formatCustomValue(userData, field?.custom_path, field?.custom_format)
                                    : (Array.isArray(getValueByPath(userData, field?.path))
                                        ? getValueByPath(userData, field?.path).join(', ')
                                        : getValueByPath(userData, field?.path) || 'N/A')}
                            </Descriptions.Item>
                        );
                    })}
                </Descriptions>
            </div>
        );
    };

    const renderDynamicDescriptionItems = () => {
        const groups = profileFields?.groups?.sort((a, b) => a.order - b.order);

        return groups?.map((group, idx) => {
            const isGroupPrivate = group.private || privacySettings[group.name];
            const canEditPrivacy = session?.user?.id === userData?.id;
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

    const profileOwner = session?.user?.id === userData?.id;

    const tabItems = [
        {
            key: 'information',
            label: (profileOwner && 'My ') + 'Information',
            children: (
                <DetailOverview data={userData} config={profileFields} editable={true} owner={profileOwner}
                    saveConfig={{ table: "users", column: "privacy", entity: userData?.id }} />
            ),
        },
        session?.user?.features?.feature?.profileBusinesses && profileOwner && {
            key: 'businesses',
            label: (profileOwner && 'My ') + 'Businesses',
            children: (
                <DynamicViews entityType={'ib_businesses'} fetchFilters={filters} tabs={["gridview"]} EmptyMessage={EmptyMessage} />
            ),
        },
        // session?.user?.features?.feature?.privateMessages && profileOwner && {
        //     key: 'inbox',
        //     label: 'Messages',
        //     children: (
        //         <Channels isPrivate={true} />
        //     ),
        // },
    ];

    // Handle tab change with tracking
    const handleTabChange = (key) => {
        trackEvent({
            eventName: 'tab_change',
            category: 'Profile',
            label: `Switched to ${key} tab`,
        });
    };

    return (
        <div
            style={{
                position: 'relative',
                minHeight: '100vh',
                backgroundColor: '#f5f8fa',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            {/* Background Cover - Mobile First */}
            <div
                style={{
                    height: '50vh',
                    minHeight: '200px',
                    backgroundImage: `url('/img/ibcn/ibcn-banner.webp')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center -55px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                {/* Gradient Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 50%, #f5f8fa 100%)',
                    }}
                />
                {!profileOwner && (
                    <Button
                        type="text"
                        label="Back"
                        icon={<LeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            color: '#fff',
                            fontSize: '24px',
                            zIndex: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                )}
                {/* User Name */}
                <h1
                    style={{
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        color: '#fff',
                        zIndex: 1,
                        padding: '0 15px',
                        lineHeight: '1.2',
                        marginTop: "-220px",
                        // marginLeft: "200px"
                    }}
                >
                    {userData?.details?.firstName} {userData?.details?.lastName}
                </h1>
            </div>

            {/* Profile Content */}
            <div
                style={{
                    position: 'relative',
                    top: '-170px',
                    padding: '15px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    zIndex: 2,
                }}
            >
                <Card style={{ marginBottom: '15px' }}>
                    {/* Profile Picture and Buttons */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginBottom: '15px',
                        }}
                    >
                        <div
                            style={{
                                marginBottom: '15px'
                            }}
                        >
                            {profileOwner ? (
                                <ProfilePic />
                            ) : (
                                <Avatar
                                    size={64}
                                    src={userData?.details?.profile_picture}
                                    style={{ backgroundColor: '#f1f4f7' }}
                                >
                                    {userData?.user_name?.charAt(0) || 'U'}
                                </Avatar>
                            )}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            {profileOwner ? (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <Button type='primary'
                                        icon={details ? <EditOutlined /> : <PlusOutlined />}
                                        onClick={(e) => showModal({ ...details }, 'user_self_edit_form')}
                                        style={{ width: '100%', maxWidth: '200px' }}
                                    >
                                        Edit Profile
                                    </Button>
                                    <ChangePassword />
                                </div>
                            ) : (
                                <Button
                                    icon={<MailOutlined />}
                                    onClick={handleConnect}
                                    style={{ width: '100%', maxWidth: '200px' }}
                                >
                                    Connect via Email
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultActiveKey={'info'} items={tabItems} onChange={handleTabChange} />
                </Card>
            </div>

            {/* Drawer for Editing Profile */}
            {edit && schema && (
                <Drawer
                    title={schema?.data_schema?.title || "Edit Profile"}
                    open={edit}
                    onOk={handleOk}
                    onClose={handleCancel}
                    width={'90%'}
                >
                    <DynamicForm schemas={schema} formData={formData} updateId={updateId} onFinish={onFinish} />
                </Drawer>
            )}

            {/* Inline CSS for Media Queries */}
            <style jsx>{`
                @media (max-width: 767px) {
                    /* Mobile styles */
                }
                @media (min-width: 768px) {
                    div[style*="height: 50vh"] {
                        height: 60vh;
                        background-position: '75px center' !important;
                    }
                    h1 {
                        font-size: 2rem !important;
                    }
                    div[style*="top: -100px"] {
                        top: -150px;
                    }
                    div[style*="padding: 15px"] {
                        padding: 20px;
                    }
                    div[style*="flex-direction: column"][style*="alignItems: center"] {
                        flex-direction: row;
                        justify-content: space-between;
                    }
                    div[style*="flex-direction: column"][style*="gap: 10px"] {
                        flex-direction: row;
                        gap: 15px;
                    }
                    button {
                        width: auto !important;
                    }
                }
                @media (min-width: 992px) {
                    div[style*="height: 50vh"] {
                        height: 70vh;
                        max-height: 500px;
                    }
                    h1 {
                        font-size: 2.5rem !important;
                    }
                    div[style*="top: -100px"] {
                        top: -180px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
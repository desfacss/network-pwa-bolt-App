import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { supabase } from 'configs/SupabaseConfig';
// import { supabase } from '../supabaseClient'; // Adjust your Supabase client import

const { Option } = Select;

const OrganizationSetup = () => {
    const { session } = useSelector((state) => state.auth);
    const organization_id = session?.user?.organization_id;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [organizationData, setOrganizationData] = useState(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', organization_id)
                .single();

            if (error) {
                message.error('Error fetching organization data');
            } else {
                setOrganizationData(data);
                form.setFieldsValue({
                    organizationName: data.name,
                    organizationLogo: data.details?.organizationLogo || null,
                    street: data.details?.organizationAddress?.street,
                    city: data.details?.organizationAddress?.city,
                    state: data.details?.organizationAddress?.state,
                    country: data.details?.organizationAddress?.country,
                    postalCode: data.details?.organizationAddress?.postalCode,
                    contactName: data.details?.primaryContact?.contactName,
                    email: data.details?.primaryContact?.email,
                    phone: data.details?.primaryContact?.phone,
                    customDomain: data.details?.domainSettings?.customDomain,
                    loginURL: data.details?.domainSettings?.loginURL,
                    logoutRedirectURL: data.details?.domainSettings?.logoutRedirectURL,
                    baseCurrency: data.details?.regionalSettings?.baseCurrency,
                    supportedCurrencies: data.details?.regionalSettings?.supportedCurrencies,
                    baseTimezone: data.details?.regionalSettings?.baseTimezone,
                    allowedTimezones: data.details?.regionalSettings?.allowedTimezones,
                    dateFormat: data.details?.regionalSettings?.dateFormat,
                    timeFormat: data.details?.regionalSettings?.timeFormat,
                    workWeekStartDay: data.details?.regionalSettings?.workWeekStartDay,
                });
            }
        };

        if (organization_id) {
            fetchOrganizationData();
        }
    }, [organization_id, form]);

    const onFinish = async (values) => {
        setLoading(true);

        const organizationDetails = {
            organizationName: values.organizationName,
            organizationLogo: values.organizationLogo ? values.organizationLogo[0].response.url : null,
            organizationAddress: {
                street: values.street,
                city: values.city,
                state: values.state,
                country: values.country,
                postalCode: values.postalCode,
            },
            primaryContact: {
                contactName: values.contactName,
                email: values.email,
                phone: values.phone,
            },
            domainSettings: {
                customDomain: values.customDomain,
                loginURL: values.loginURL, // Not editable
                logoutRedirectURL: values.logoutRedirectURL, // Not editable
            },
            regionalSettings: {
                baseCurrency: values.baseCurrency,
                supportedCurrencies: values.supportedCurrencies,
                baseTimezone: values.baseTimezone,
                allowedTimezones: values.allowedTimezones,
                dateFormat: values.dateFormat,
                timeFormat: values.timeFormat, // Not editable
                workWeekStartDay: values.workWeekStartDay,
            },
        };

        const { data, error } = await supabase
            .from('organizations')
            .update({
                name: values.organizationName,
                details: organizationDetails,
                updated_at: new Date(),
            })
            .eq('id', organization_id);

        setLoading(false);

        if (error) {
            message.error('Error updating organization');
        } else {
            message.success('Organization updated successfully');
        }
    };

    return (
        <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* Organization Details */}
            <Form.Item label="Organization Name" name="organizationName" rules={[{ required: true, message: 'Please input the organization name' }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Organization Logo" name="organizationLogo" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
                <Upload name="logo" action="/upload.do" listType="picture" maxCount={1}>
                    <Button icon={<UploadOutlined />}>Upload Logo</Button>
                </Upload>
            </Form.Item>

            <Form.Item label="Organization Address" required>
                <Input.Group compact>
                    <Form.Item name="street" noStyle rules={[{ required: true, message: 'Street is required' }]}>
                        <Input style={{ width: '50%' }} placeholder="Street" />
                    </Form.Item>
                    <Form.Item name="city" noStyle rules={[{ required: true, message: 'City is required' }]}>
                        <Input style={{ width: '25%' }} placeholder="City" />
                    </Form.Item>
                    <Form.Item name="state" noStyle rules={[{ required: true, message: 'State is required' }]}>
                        <Input style={{ width: '25%' }} placeholder="State" />
                    </Form.Item>
                </Input.Group>
                <Input.Group compact>
                    <Form.Item name="country" noStyle rules={[{ required: true, message: 'Country is required' }]}>
                        <Input style={{ width: '50%' }} placeholder="Country" />
                    </Form.Item>
                    <Form.Item name="postalCode" noStyle rules={[{ required: true, message: 'Postal Code is required' }]}>
                        <Input style={{ width: '50%' }} placeholder="Postal Code" />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            {/* Primary Contact Information */}
            <Form.Item label="Primary Contact Information">
                <Form.Item name="contactName" label="Contact Name" rules={[{ required: true, message: 'Contact Name is required' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please input a valid email address' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Phone Number is required' }]}>
                    <Input />
                </Form.Item>
            </Form.Item>

            {/* Domain & URL Settings */}
            <Form.Item label="Domain & URL Settings">
                <Form.Item name="customDomain" label="Custom Domain">
                    <Input placeholder="e.g., orgname.appdomain.com or customdomain.com" />
                </Form.Item>
                <Form.Item name="loginURL" label="Login URL"
                // rules={[{ required: true, message: 'Login URL is required' }]}
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item name="logoutRedirectURL" label="Logout Redirect URL">
                    <Input disabled />
                </Form.Item>
            </Form.Item>

            {/* Regional Settings */}
            <Form.Item label="Regional Settings">
                <Form.Item name="baseCurrency" label="Base Currency" rules={[{ required: true, message: 'Please select the base currency' }]}>
                    <Select placeholder="Select currency">
                        <Option value="USD">USD</Option>
                        <Option value="EUR">EUR</Option>
                        {/* Add more options as needed */}
                    </Select>
                </Form.Item>
                <Form.Item name="supportedCurrencies" label="Supported Currencies">
                    <Select mode="multiple" placeholder="Select supported currencies">
                        <Option value="USD">USD</Option>
                        <Option value="EUR">EUR</Option>
                        {/* Add more options as needed */}
                    </Select>
                </Form.Item>
                <Form.Item name="baseTimezone" label="Base Timezone" rules={[{ required: true, message: 'Please select the base timezone' }]}>
                    <Select placeholder="Select timezone">
                        <Option value="America/New_York">America/New_York</Option>
                        <Option value="Europe/London">Europe/London</Option>
                        {/* Add more timezones as needed */}
                    </Select>
                </Form.Item>
                <Form.Item name="allowedTimezones" label="Allowed Timezones">
                    <Select mode="multiple" placeholder="Select allowed timezones">
                        <Option value="America/New_York">America/New_York</Option>
                        <Option value="Europe/London">Europe/London</Option>
                        {/* Add more timezones as needed */}
                    </Select>
                </Form.Item>
                <Form.Item name="dateFormat" label="Date Format">
                    <Select>
                        <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="timeFormat" label="Time Format">
                    <Select disabled>
                        <Option value="12">12-hour</Option>
                        <Option value="24">24-hour</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="workWeekStartDay" label="Work Week Start Day">
                    <Select>
                        <Option value="Monday">Monday</Option>
                        <Option value="Sunday">Sunday</Option>
                        {/* Add more days as needed */}
                    </Select>
                </Form.Item>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
};

export default OrganizationSetup;

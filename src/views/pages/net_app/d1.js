const valueEnum = {
    all: { text: 'All', status: 'Default' },
    open: { text: 'Open', status: 'Error' },
    closed: { text: 'Closed', status: 'Success', disabled: true },
    processing: { text: 'Processing', status: 'Processing' },
};
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { ProFormSelect } from '@ant-design/pro-components';
const addressOptions = {
    all: [
        { label: 'A1', value: 'A1' },
        { label: 'A2', value: 'A2' },
    ],
    open: [
        { label: 'O1', value: 'O1' },
        { label: 'O2', value: 'O2' },
    ],
    closed: [
        { label: 'C1', value: 'C1' },
        { label: 'C2', value: 'C2' },
    ],
    processing: [
        { label: 'P1', value: 'P1' },
        { label: 'P2', value: 'P2' },
    ],
};

export const colSchema = [
    {
        title: 'Title',
        dataIndex: 'title',
        formItemProps: {
            rules: [
                {
                    required: true,
                    message: 'This field is required',
                },
            ],
        },
        width: 'md',
        colProps: {
            xs: 24,
            md: 12,
        },
        initialValue: 'Default Value',
        convertValue: (value) => {
            return `Title: ${value}`;
        },
        transform: (value) => {
            return {
                title: `${value}-Transformed`,
            };
        },
    },
    {
        title: 'Location',
        dataIndex: 'location',
        valueType: 'select',
        valueEnum,
        width: 'md',
        colProps: {
            xs: 24,
            md: 12,
        },
    },
    {
        title: 'Address',
        dataIndex: 'address',
        valueType: 'select',
        width: 'md',
        colProps: { xs: 24, md: 12 },
        dependencies: ['location'],
        renderFormItem: (schema, config, form) => {
            const location = form.getFieldValue('location');
            const options = addressOptions[location] || [];

            return (
                <ProFormSelect
                    options={options}
                    name="address"
                    fieldProps={{
                        rules: [{ required: true, message: 'Please select an address!' }],
                    }}
                />
            );
        },
    },
    {
        title: 'Labels',
        dataIndex: 'labels',
        width: 'md',
        colProps: {
            xs: 12,
            md: 4,
        },
    },
    {
        valueType: 'switch',
        title: 'Switch',
        dataIndex: 'Switch',
        fieldProps: {
            style: {
                width: '200px',
            },
        },
        width: 'md',
        colProps: {
            xs: 12,
            md: 20,
        },
    },
    {
        title: 'Created Time',
        key: 'showTime',
        dataIndex: 'createName',
        initialValue: [dayjs().add(-1, 'm'), dayjs()],
        renderFormItem: () => <DatePicker.RangePicker />,
        width: 'md',
        colProps: {
            xs: 24,
            md: 12,
        },
    },
    {
        title: 'Updated Time',
        dataIndex: 'updateName',
        initialValue: [dayjs().add(-1, 'm'), dayjs()],
        renderFormItem: () => <DatePicker.RangePicker />,
        width: 'md',
        colProps: {
            xs: 24,
            md: 12,
        },
    },
    {
        title: 'Posts',
        valueType: 'group',
        columns: [
            {
                title: 'Type',
                dataIndex: 'groupState',
                valueType: 'select',
                width: 'xs',
                colProps: {
                    xs: 12,
                },
                valueEnum,
            },
            {
                title: 'Name',
                width: 'md',
                dataIndex: 'groupTitle',
                colProps: {
                    xs: 12,
                },
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            message: 'This field is required',
                        },
                    ],
                },
            },
        ],
    },
    {
        title: 'List',
        valueType: 'formList',
        dataIndex: 'list',
        initialValue: [{ state: 'all', title: 'dp' }],
        colProps: {
            xs: 24,
            sm: 12,
        },
        columns: [
            {
                valueType: 'group',
                columns: [
                    {
                        title: 'Type',
                        dataIndex: 'state',
                        valueType: 'select',
                        colProps: {
                            xs: 24,
                            sm: 12,
                        },
                        width: 'xs',
                        valueEnum,
                    },
                    {
                        title: 'Name',
                        dataIndex: 'title',
                        width: 'md',
                        formItemProps: {
                            rules: [
                                {
                                    required: true,
                                    message: 'This field is required',
                                },
                            ],
                        },
                        colProps: {
                            xs: 24,
                            sm: 12,
                        },
                    },
                ],
            },
            {
                valueType: 'dateTime',
                initialValue: new Date(),
                dataIndex: 'currentTime',
                width: 'md',
            },
        ],
    },
    {
        title: 'Form Set',
        valueType: 'formSet',
        dataIndex: 'formSet',
        colProps: {
            xs: 24,
            sm: 12,
        },
        rowProps: {
            gutter: [16, 0],
        },
        columns: [
            {
                title: 'State',
                dataIndex: 'groupState',
                valueType: 'select',
                width: 'md',
                valueEnum,
            },
            {
                width: 'xs',
                title: 'Title',
                dataIndex: 'groupTitle',
                tooltip: 'Long titles will automatically shrink',
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            message: 'This field is required',
                        },
                    ],
                },
            },
        ],
    },
    {
        title: 'Created Time',
        dataIndex: 'created_at',
        valueType: 'dateRange',
        width: 'md',
        colProps: {
            span: 24,
        },
        transform: (value) => {
            return {
                startTime: value[0],
                endTime: value[1],
            };
        },
    },
];
import type {
    ProFormColumnsType,
    ProFormLayoutType,
} from '@ant-design/pro-components';
import { BetaSchemaForm, ProFormSelect } from '@ant-design/pro-components';
import { Alert, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { colSchema } from './d1';
import { colSchema2 } from './d2';

// const valueEnum = {
//     all: { text: 'e', status: 'Default' },
//     open: {
//         text: 'e',
//         status: 'Error',
//     },
//     closed: {
//         text: 's',
//         status: 'Success',
//         disabled: true,
//     },
//     processing: {
//         text: 'p',
//         status: 'Processing',
//     },
// };
const valueEnum = {
    all: { text: 'All', status: 'Default' },
    open: { text: 'Open', status: 'Error' },
    closed: { text: 'Closed', status: 'Success', disabled: true },
    processing: { text: 'Processing', status: 'Processing' },
};
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
const valueEnum2 = {
    all: { text: 'e', status: 'Default' },
    open: {
        text: 'e',
        status: 'Error',
    },
    closed: {
        text: 's',
        status: 'Success',
        disabled: true,
    },
    processing: {
        text: 'p',
        status: 'Processing',
    },
};

type DataItem = {
    name: string;
    state: string;
};

const columns: ProFormColumnsType<DataItem>[] = colSchema2


export default () => {
    const [layoutType, setLayoutType] = useState<ProFormLayoutType>('Form');
    return (
        <>
            <Space
                style={{
                    width: '100%',
                }}
                direction="vertical"
            >
                <Alert
                    type="warning"
                    message="QueryFilter 和 lightFilter 暂不支持grid模式"
                    style={{
                        marginBlockEnd: 24,
                    }}
                />
                <ProFormSelect
                    label="布局方式"
                    options={[
                        'Form',
                        'ModalForm',
                        'DrawerForm',
                        'LightFilter',
                        'QueryFilter',
                        'StepsForm',
                        'StepForm',
                        'Embed',
                    ]}
                    fieldProps={{
                        value: layoutType,
                        onChange: (e) => setLayoutType(e),
                    }}
                />
            </Space>
            <BetaSchemaForm<DataItem>
                trigger={<a>点击我</a>}
                layoutType={layoutType}
                steps={[
                    {
                        title: 'ProComponent',
                    },
                ]}
                rowProps={{
                    gutter: [16, 16],
                }}
                colProps={{
                    span: 12,
                }}
                grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
                onValuesChange={(changedValues, allValues) => {
                    console.log('Location changed:', changedValues, allValues);
                }}
                onFinish={async (values) => {
                    console.log(values);
                }}
                columns={(layoutType === 'StepsForm' ? [columns] : columns) as any}
            />
        </>
    );
};
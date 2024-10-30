import React from 'react';
import { Table } from 'antd';
import { Sparklines, SparklinesLine } from 'react-sparklines';

const data = [
    {
        key: '1',
        name: 'Item 1',
        values: [5, 10, 5, 20, 8, 15],
    },
    {
        key: '2',
        name: 'Item 2',
        values: [3, 8, 4, 12, 9, 16],
    },
    {
        key: '3',
        name: 'Item 3',
        values: [7, 14, 8, 18, 11, 20],
    },
];

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Sparkline',
        dataIndex: 'values',
        key: 'values',
        render: (values) => (
            <Sparklines data={values} width={100} height={20}>
                <SparklinesLine color="blue" />
            </Sparklines>
        ),
    },
];

const SparklineTable = () => {
    return <Table columns={columns} dataSource={data} pagination={false} />;
};

export default SparklineTable;

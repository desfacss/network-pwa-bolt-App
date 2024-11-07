import React from 'react';
import { Card, Col, Row, Table } from 'antd';

// const leave_details = {
//     leaves: {
//         sick: { max: 30, min: 15, taken: 4 },
//         others: { max: 12, min: 0, taken: 4 },
//         unpaid: { max: 12, min: 0, taken: 4 },
//         personal: { max: 12, min: 6, taken: 4 },
//         bereavement: { max: 2, min: 0, taken: 4 },
//         unauthorized: { max: null, min: 0, taken: 4 }
//     }
// };

const LeaveDetails = ({ leave_details }) => {
    const dataSource = leave_details && Object.keys(leave_details)?.map((key, index) => {
        const leave = leave_details[key];
        return {
            key: index,
            type: key.charAt(0).toUpperCase() + key.slice(1),
            taken: leave.taken,
            min: leave.min !== null ? leave.min : 'N/A',
            remaining: leave.min !== null ? Math.max(leave.min - leave.taken, 0) : 'N/A'
        };
    });

    const columns = [
        {
            title: 'Leave Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Taken Leaves',
            dataIndex: 'taken',
            key: 'taken',
        },
        {
            title: 'Minimum Allowed',
            dataIndex: 'min',
            key: 'min',
        },
        {
            title: 'Remaining Leaves',
            dataIndex: 'remaining',
            key: 'remaining',
        },
    ];

    // return <Table dataSource={dataSource} columns={columns} pagination={false} />;
    return (
        <Row gutter={[16, 16]}>
            {dataSource?.map((leave) => (
                <Col key={leave.key} xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <div>
                            <strong>{leave.type}</strong>
                        </div>
                        <div>
                            {leave.remaining !== 'N/A' ? (
                                `${leave.remaining} of ${leave.min} available`
                            ) : (
                                'Not Applicable'
                            )}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default LeaveDetails;

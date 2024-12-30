import React from 'react';
import { Card } from 'antd';
import DynamicForm from '../DynamicForm/index';
import schem from '../DynamicForm/json2';
// import DynamicForm from '../DynamicForm/index0';
// import schem from '../DynamicForm/jsoncopy';

const Index = () => {

    const onFinish = (data) => {
        console.log("t", data)
    }
    return (
        <Card>
            <DynamicForm schemas={schem} onFinish={onFinish} />
        </Card>
    );
}

export default Index;
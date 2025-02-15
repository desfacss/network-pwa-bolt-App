import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Space, Select, Tag, InputNumber, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
// import 'ace-builds/src-noconflict/theme-github';
import "ace-builds/src-noconflict/theme-monokai";

// Custom component for PERT (Program Evaluation and Review Technique) inputs
const PERTInput = ({ optimistic, likely, pessimistic, aspirational, onChange }) => {
    return (
        <Space>
            <InputNumber
                value={optimistic}
                onChange={(val) => onChange('optimistic', val)}
                placeholder="Optimistic"
            />
            <InputNumber
                value={likely}
                onChange={(val) => onChange('likely', val)}
                placeholder="Likely"
            />
            <InputNumber
                value={pessimistic}
                onChange={(val) => onChange('pessimistic', val)}
                placeholder="Pessimistic"
            />
            <InputNumber
                value={aspirational}
                onChange={(val) => onChange('aspirational', val)}
                placeholder="Aspirational"
            />
        </Space>
    );
};

const ProcessOverview = ({ initialData }) => {
    const [localData, setLocalData] = useState(initialData);
    const [jsonVisible, setJsonVisible] = useState(false);

    useEffect(() => {
        // Update localData whenever roles or materials change
        setLocalData(prevData => ({
            ...prevData,
            blueprint: {
                ...prevData.blueprint,
                roles: localData.blueprint.roles,
                materials: localData.blueprint.materials
            }
        }));
    }, [localData.blueprint.roles, localData.blueprint.materials]);


    const roleColumns = [
        {
            title: 'Role ID',
            dataIndex: 'roleId',
            render: (text, record, index) => (
                <Select
                    value={text}
                    onChange={(value) => handleChange('roleId', value, index, 'roles')}
                >
                    <Select.Option value="res_team_sales">Sales Team</Select.Option>
                    <Select.Option value="res_team_design">Design Team</Select.Option>
                </Select>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text, record, index) => (
                <Select
                    value={text}
                    onChange={(value) => handleChange('name', value, index, 'roles')}
                >
                    <Select.Option value="Sales Team">Sales Team</Select.Option>
                    <Select.Option value="Design Team">Design Team</Select.Option>
                </Select>
            )
        },
        {
            title: 'Skill Level',
            dataIndex: 'skillLevel',
            render: (text, record, index) => (
                <Select
                    value={text}
                    onChange={(value) => handleChange('skillLevel', value, index, 'roles')}
                >
                    <Select.Option value="Intermediate">Intermediate</Select.Option>
                    <Select.Option value="Senior">Senior</Select.Option>
                </Select>
            )
        },
        {
            title: 'Skill',
            dataIndex: 'skill',
            render: (text, record, index) => (
                <Select
                    mode="tags"
                    value={text}
                    onChange={(value) => handleChange('skill', value, index, 'roles')}
                />
            )
        },
        {
            title: 'Max Concurrent Tasks',
            dataIndex: 'maxConcurrentTasks',
            render: (text, record, index) => (
                <InputNumber
                    value={text}
                    onChange={(value) => handleChange('maxConcurrentTasks', value, index, 'roles')}
                />
            )
        },
        {
            title: 'Cost Variability',
            dataIndex: 'costVariability',
            render: (text, record, index) => (
                <PERTInput
                    optimistic={text.optimistic}
                    likely={text.likely}
                    pessimistic={text.pessimistic}
                    onChange={(field, value) => handlePERTChange(field, value, index, 'roles')}
                />
            )
        },
        {
            title: 'Cost Overrun',
            dataIndex: 'cost_overrun',
            render: (text, record, index) => (
                <Select
                    mode="tags"
                    value={text}
                    onChange={(value) => handleChange('cost_overrun', value, index, 'roles')}
                />
            )
        }
    ];

    const materialColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange('name', e.target.value, index, 'materials')}
                />
            )
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            render: (text, record, index) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange('unit', e.target.value, index, 'materials')}
                />
            )
        },
        {
            title: 'Cost Per Unit',
            dataIndex: 'costPerUnit',
            render: (text, record, index) => (
                <InputNumber
                    value={text}
                    onChange={(value) => handleChange('costPerUnit', value, index, 'materials')}
                />
            )
        },
        {
            title: 'Cost Variability',
            dataIndex: 'costVariability',
            render: (text, record, index) => (
                <PERTInput
                    optimistic={text.optimistic}
                    likely={text.likely}
                    pessimistic={text.pessimistic}
                    onChange={(field, value) => handlePERTChange(field, value, index, 'materials')}
                />
            )
        }
    ];

    const handleChange = (key, value, index, dataType) => {
        setLocalData(prevData => {
            const data = [...prevData.blueprint[dataType]];
            data[index][key] = value;
            return {
                ...prevData,
                blueprint: {
                    ...prevData.blueprint,
                    [dataType]: data
                }
            };
        });
    };

    const handlePERTChange = (field, value, index, dataType) => {
        setLocalData(prevData => {
            const data = [...prevData.blueprint[dataType]];
            data[index].costVariability[field] = value;
            return {
                ...prevData,
                blueprint: {
                    ...prevData.blueprint,
                    [dataType]: data
                }
            };
        });
    };

    const addRow = (dataType) => {
        setLocalData(prevData => {
            const newRow = dataType === 'roles'
                ? { roleId: "", name: "", skillLevel: "Intermediate", skill: [], maxConcurrentTasks: 2, costVariability: { optimistic: 0, likely: 0, pessimistic: 0 }, cost_overrun: [] }
                : { id: `mat_${Date.now()}`, name: "", unit: "", costPerUnit: 0, costVariability: { optimistic: 0, likely: 0, pessimistic: 0 } };

            return {
                ...prevData,
                blueprint: {
                    ...prevData.blueprint,
                    [dataType]: [...prevData.blueprint[dataType], newRow]
                }
            };
        });
    };

    return (
        <div>
            <h2>Roles</h2>
            <Table
                columns={roleColumns}
                dataSource={localData.blueprint.roles}
                rowKey="roleId"
                pagination={false}
            />
            <Button onClick={() => addRow('roles')} icon={<PlusOutlined />}>Add Role</Button>

            <h2>Materials</h2>
            <Table
                columns={materialColumns}
                dataSource={localData.blueprint.materials}
                rowKey="id"
                pagination={false}
            />
            <Button onClick={() => addRow('materials')} icon={<PlusOutlined />}>Add Material</Button>

            <Button onClick={() => setJsonVisible(true)} type={'primary'}>Show JSON</Button>

            <Drawer
                title="JSON Data"
                width={"50%"}
                // placement="right"
                onClose={() => setJsonVisible(false)}
                visible={jsonVisible}
            >
                <AceEditor
                    mode="json"
                    // theme="github"
                    value={JSON.stringify(localData, null, 2)}
                    readOnly={true}
                    width="100%"
                    height="500px"
                    editorProps={{ $blockScrolling: true }}
                />
            </Drawer>
        </div>
    );
};

export default ProcessOverview;
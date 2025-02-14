import React, { useState } from 'react';
import { Collapse, Button, Form, Input, Select, Drawer, Space, Tag, Row, Col, InputNumber, Table } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const ProcessEditor = ({ initialData }) => {
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState(null);
  const [processData, setProcessData] = useState(initialData);
  const [drawerVisible, setDrawerVisible] = useState(false);
const [timeUnit, setTimeUnit] = useState('hours'); // Default to hours as per JSON
  const [costUnit, setCostUnit] = useState('INR'); // Default to INR as per JSON

  // State for editable tables
  const [rolesData, setRolesData] = useState([]);
  const [risksData, setRisksData] = useState([]);
  const [qualityMetricsData, setQualityMetricsData] = useState([]);

  // Conversion functions (existing)
  const minutesToDays = (minutes) => minutes / (60 * 24);
  const minutesToHours = (minutes) => minutes / 60;
const minutesToUnit = (minutes, unit) => {
    switch (unit) {
      case 'days': return minutesToDays(minutes);
      case 'hours': return minutesToHours(minutes);
      default: return minutes; // minutes
    }
  };
  const convertToMinutes = (value, unit) => {
    switch (unit) {
      case 'days': return value * 60 * 24;
      case 'hours': return value * 60;
      default: return value; // minutes
    }
  };

// Table columns for roles
  const roleColumns = [
    {
      title: 'Role ID',
      dataIndex: 'roleId',
      editable: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      editable: true,
      render: (text) => <InputNumber min={1} value={text} />,
    },
    {
      title: 'Optimistic Cost (INR)',
      dataIndex: ['pert_cost', 'optimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Likely Cost (INR)',
      dataIndex: ['pert_cost', 'likely'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Pessimistic Cost (INR)',
      dataIndex: ['pert_cost', 'pessimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Reasons',
      dataIndex: ['pert_cost', 'reasons'],
      editable: true,
      render: (text) => <Select mode="tags" value={text} />,
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record, index) => (
        <Button danger onClick={() => {
          const newData = [...rolesData];
          newData.splice(index, 1);
          setRolesData(newData);
        }}>
          Delete
        </Button>
      ),
    },
  ];

  // Table columns for risks
  const riskColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      editable: true,
    },
    {
      title: 'Optimistic Probability',
      dataIndex: ['probability', 'optimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} max={1} step={0.01} value={text} />,
    },
    {
      title: 'Likely Probability',
      dataIndex: ['probability', 'likely'],
      editable: true,
      render: (text) => <InputNumber min={0} max={1} step={0.01} value={text} />,
    },
    {
      title: 'Pessimistic Probability',
      dataIndex: ['probability', 'pessimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} max={1} step={0.01} value={text} />,
    },
    {
      title: 'Optimistic Impact (hours)',
      dataIndex: ['impact', 'optimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Likely Impact (hours)',
      dataIndex: ['impact', 'likely'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Pessimistic Impact (hours)',
      dataIndex: ['impact', 'pessimistic'],
      editable: true,
      render: (text) => <InputNumber min={0} value={text} />,
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_, record, index) => (
        <Button danger onClick={() => {
          const newData = [...risksData];
          newData.splice(index, 1);
          setRisksData(newData);
        }}>
          Delete
        </Button>
      ),
    },
  ];

  // Modified handleSave to include all fields
  const handleSave = (values) => {
    const newData = JSON.parse(JSON.stringify(processData));
    const workflow = newData.blueprint.workflows[0];
    
    if (selectedItem.type === 'step') {
      const step = workflow.steps.find(s => s.id === selectedItem.id);
      Object.assign(step, values);
    } else if (selectedItem.type === 'task') {
      const step = workflow.steps.find(s => s.id === selectedItem.stepId);
      const task = step.tasks.find(t => t.id === selectedItem.id);
      Object.assign(task, {
        ...values,
        pert_time: {
          leadTime: {
          optimistic: convertToMinutes(values.optimisticLeadTime, timeUnit),
          likely: convertToMinutes(values.likelyLeadTime, timeUnit),
          pessimistic: convertToMinutes(values.pessimisticLeadTime, timeUnit),
            timeUnit: timeUnit,
          },
          effortTime: {
            optimistic: convertToMinutes(values.optimisticEffortTime, timeUnit),
            likely: convertToMinutes(values.likelyEffortTime, timeUnit),
            pessimistic: convertToMinutes(values.pessimisticEffortTime, timeUnit),
            timeUnit: timeUnit,
          },
          reasons: values.pertTimeReasons,
        },
        pert_cost: {
          optimistic: values.optimisticCost,
          likely: values.likelyCost,
          pessimistic: values.pessimisticCost,
          costUnit: costUnit,
          reasons: values.pertCostReasons,
        },
        roles: rolesData,
        risk: risksData,
        quality_metrics: qualityMetricsData,
        preferredUnit: timeUnit,
      });
    }
    
    setProcessData(newData);
    setDrawerVisible(false);
  };

  const handleDelete = () => {
    const newData = JSON.parse(JSON.stringify(processData));
    const workflow = newData.blueprint.workflows[0];

    if (selectedItem.type === 'step') {
      workflow.steps = workflow.steps.filter(s => s.id !== selectedItem.id);
    } else if (selectedItem.type === 'task') {
      const step = workflow.steps.find(s => s.id === selectedItem.stepId);
      step.tasks = step.tasks.filter(t => t.id !== selectedItem.id);
    }

    setProcessData(newData);
    setDrawerVisible(false);
  };

  const saveJson = () => {
    const dataStr = JSON.stringify(processData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'process-config.json';
    link.click();
  };

  const StepActions = ({ step }) => (
    <Space>
      <Button icon={<EditOutlined />} onClick={() => {
        setSelectedItem({ type: 'step', ...step });
        form.setFieldsValue(step);
        setDrawerVisible(true);
      }}/>
      <Button icon={<DeleteOutlined />} danger onClick={() => {
        setSelectedItem({ type: 'step', ...step });
        handleDelete();
      }}/>
      <Button icon={<PlusOutlined />} onClick={() => {
        const newTask = {
          id: `task_${Date.now()}`,
          name: 'New Task',
          description: '',
          raci: { responsible: [], accountable: [], consulted: [], informed: [] },
          materials: [],
          tools: [],
          checklist: [],
          pert: { optimistic: 0, likely: 0, pessimistic: 0 }
        };
        step.tasks.push(newTask);
        setProcessData({ ...processData });
      }}/>
    </Space>
  );

  const TaskItem = ({ task, stepId }) => {
    const displayUnit = task.preferredUnit || 'days';
    const pert = task.pert || { optimistic: 0, likely: 0, pessimistic: 0 }; // Default values if pert is undefined
  
    return (
      <div className="task-item">
        <div className="task-content">
          <h4>{task.name}</h4>
          <Space>
            <Tag color="blue">R: {task.raci.responsible.join(', ')}</Tag>
            <Tag color="geekblue">O: {minutesToUnit(pert.optimistic, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
            <Tag color="purple">L: {minutesToUnit(pert.likely, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
            <Tag color="magenta">P: {minutesToUnit(pert.pessimistic, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
          </Space>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setSelectedItem({ 
              type: 'task', 
              stepId,
              ...task
            });
            setTimeUnit(task.preferredUnit || 'days');
            form.setFieldsValue({
              ...task,
              optimisticTime: minutesToUnit(pert.optimistic, task.preferredUnit || 'days'),
              likelyTime: minutesToUnit(pert.likely, task.preferredUnit || 'days'),
              pessimisticTime: minutesToUnit(pert.pessimistic, task.preferredUnit || 'days')
            });
            setDrawerVisible(true);
          }}/>
          <Button icon={<DeleteOutlined />} danger onClick={() => {
            setSelectedItem({ type: 'task', stepId, ...task });
            handleDelete();
          }}/>
        </Space>
      </div>
    );
  };

  const handleUnitChange = (value) => {
    setTimeUnit(value);
    const values = form.getFieldsValue();
    ['optimisticTime', 'likelyTime', 'pessimisticTime'].forEach(field => {
      if (values[field] !== undefined) {
        let newValue = minutesToUnit(convertToMinutes(values[field], timeUnit), value);
        form.setFieldsValue({ [field]: newValue });
      }
    });
  };

  const setInitialValues = (item) => {
    if (item.type === 'task') {
      const unit = item.preferredUnit || 'hours';
      setTimeUnit(unit);
setCostUnit(item.pert_cost?.costUnit || 'INR');
      setRolesData(item.roles || []);
      setRisksData(item.risk || []);
      setQualityMetricsData(item.quality_metrics || []);
      
      form.setFieldsValue({
        ...item,
        optimisticLeadTime: minutesToUnit(item.pert_time.leadTime.optimistic, unit),
        likelyLeadTime: minutesToUnit(item.pert_time.leadTime.likely, unit),
        pessimisticLeadTime: minutesToUnit(item.pert_time.leadTime.pessimistic, unit),
        optimisticEffortTime: minutesToUnit(item.pert_time.effortTime.optimistic, unit),
        likelyEffortTime: minutesToUnit(item.pert_time.effortTime.likely, unit),
        pessimisticEffortTime: minutesToUnit(item.pert_time.effortTime.pessimistic, unit),
        pertTimeReasons: item.pert_time.reasons,
        optimisticCost: item.pert_cost.optimistic,
        likelyCost: item.pert_cost.likely,
        pessimisticCost: item.pert_cost.pessimistic,
        pertCostReasons: item.pert_cost.reasons,
      });
    } else {
      form.setFieldsValue(item);
    }
  };

  // Add role handler
  const addRole = () => {
    setRolesData([...rolesData, {
      roleId: `role_${Date.now()}`,
      quantity: 1,
      pert_cost: {
        optimistic: 0,
        likely: 0,
        pessimistic: 0,
        costUnit: 'INR',
        reasons: [],
      },
    }]);
  };

  // Add risk handler
  const addRisk = () => {
    setRisksData([...risksData, {
      description: '',
      probability: { optimistic: 0, likely: 0, pessimistic: 0 },
      impact: { optimistic: 0, likely: 0, pessimistic: 0 },
      impactUnit: 'hours',
    }]);
  };

  // Rest of your existing functions (handleDelete, saveJson, StepActions, TaskItem, handleUnitChange) remain the same

  return (
    <div className="process-editor">
      <Collapse accordion>
        {processData.blueprint.workflows[0].steps.map(step => (
          <Collapse.Panel 
            key={step.id}
            header={step.name}
            extra={<StepActions step={step} />}
          >
            {step.tasks.map(task => (
              <TaskItem key={task.id} task={task} stepId={step.id} />
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>

      <Drawer
        title={`Edit ${selectedItem?.type}`}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        extra={[
          <Button key="delete" danger onClick={handleDelete}>
            Delete
          </Button>
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {selectedItem?.type === 'task' && (
            <>
              <Form.Item label="Description" name="description">
                <Input.TextArea />
              </Form.Item>

              <Form.Item label="Parallelizable" name="parallelizable">
                <Select>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>

              {/* PERT Time Section */}
              <div className="form-section">
                <h4>PERT Time Estimates</h4>
              <Row gutter={16}>
  {['optimistic', 'likely', 'pessimistic'].map((field) => (
    <React.Fragment key={field}>
                      <Col span={6}>
      <Form.Item 
        label={`${field.charAt(0).toUpperCase() + field.slice(1)} Lead Time`} 
        name={`${field}LeadTime`} 
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item 
                          label={`${field.charAt(0).toUpperCase() + field.slice(1)} Effort Time`} 
                          name={`${field}EffortTime`} 
        rules={[{ required: true }]}
      >
        <InputNumber min={0} />
      </Form.Item>
    </Col>
</React.Fragment>
  ))}
  <Col span={6}>
    <Form.Item label="Unit">
      <Select onChange={handleUnitChange} value={timeUnit}>
        <Select.Option value="days">Days</Select.Option>
        <Select.Option value="hours">Hours</Select.Option>
        <Select.Option value="minutes">Minutes</Select.Option>
      </Select>
    </Form.Item>
  </Col>
</Row>
<Form.Item label="Time Estimate Reasons" name="pertTimeReasons">
                  <Select mode="tags" placeholder="Add reasons" />
                </Form.Item>
              </div>

              {/* PERT Cost Section */}
              <div className="form-section">
                <h4>PERT Cost Estimates</h4>
                <Row gutter={16}>
                  {['optimistic', 'likely', 'pessimistic'].map((field) => (
                    <Col key={field} span={6}>
                      <Form.Item 
                        label={`${field.charAt(0).toUpperCase() + field.slice(1)} Cost`} 
                        name={`${field}Cost`} 
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} />
                      </Form.Item>
                    </Col>
                  ))}
                  <Col span={6}>
                    <Form.Item label="Cost Unit">
                      <Input disabled value={costUnit} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Cost Estimate Reasons" name="pertCostReasons">
                  <Select mode="tags" placeholder="Add reasons" />
                </Form.Item>
              </div>

              {/* RACI Matrix (existing) */}
              <div className="form-section">
                <h4>RACI Matrix</h4>
                {['responsible', 'accountable', 'consulted', 'informed'].map(key => (
                  <Form.Item key={key} label={key.toUpperCase()} name={['raci', key]}>
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder={`Add ${key} roles`}
                    />
                  </Form.Item>
                ))}
              </div>

{/* Roles Table */}
              <div className="form-section">
                <h4>Roles</h4>
                <Table
                  size="small"
                  columns={roleColumns}
                  dataSource={rolesData}
                  pagination={false}
                  rowKey={(record, index) => index}
                />
                <Button type="dashed" onClick={addRole} style={{ width: '100%', marginTop: 16 }}>
                  <PlusOutlined /> Add Role
                </Button>
              </div>

              {/* Risks Table */}
              <div className="form-section">
                <h4>Risks</h4>
                <Table
                  size="small"
                  columns={riskColumns}
                  dataSource={risksData}
                  pagination={false}
                  rowKey={(record, index) => index}
                />
                <Button type="dashed" onClick={addRisk} style={{ width: '100%', marginTop: 16 }}>
                  <PlusOutlined /> Add Risk
                </Button>
              </div>

              {/* Resources (existing) */}
              <div className="form-section">
                <h4>Resources</h4>
                <Form.Item label="Dependencies" name="dependencies">
                  <Select mode="tags" placeholder="Add dependencies" />
                </Form.Item>
                <Form.Item label="Tools" name="tools">
                  <Select mode="tags" placeholder="Add tools" />
                </Form.Item>
                <Form.Item label="Checklist" name="checklist">
                  <Select mode="tags" placeholder="Add checklist items" />
                </Form.Item>
              </div>
            </>
          )}

          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form>
      </Drawer>

      <Space style={{ marginTop: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            const newStep = {
              id: `step_${Date.now()}`,
              name: 'New Step',
              tasks: []
            };
            // const newData = JSON.parse(JSON.stringify(processData));
            const newData = { ...processData };
            newData.blueprint.workflows[0].steps.push(newStep);
            setProcessData(newData);
          }}
        >
          Add Step
        </Button>

        <Button 
          type="default" 
          icon={<SaveOutlined />}
          onClick={saveJson}
        >
          Save as JSON
        </Button>
      </Space>
    </div>
  );
};

export default ProcessEditor;
import React, { useState } from 'react';
import { Collapse, Button, Form, Input, Select, Drawer, Space, Tag, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const ProcessEditor = ({ initialData }) => {
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState(null);
  const [processData, setProcessData] = useState(initialData);
  const [drawerVisible, setDrawerVisible] = useState(false);
const [timeUnit, setTimeUnit] = useState('hours');

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

  const handleSave = (values) => {
    const newData = JSON.parse(JSON.stringify(processData));
    const workflow = newData.blueprint.workflows[0];
    
    if (selectedItem.type === 'step') {
      const step = workflow.steps.find(s => s.id === selectedItem.id);
      Object.assign(step, values);
    } else if (selectedItem.type === 'task') {
      const step = workflow.steps.find(s => s.id === selectedItem.stepId);
      const task = step.tasks.find(t => t.id === selectedItem.id);

      const pertTime = {
        leadTime: {
          optimistic: convertToMinutes(values.leadTimeOptimistic, timeUnit),
          likely: convertToMinutes(values.leadTimeLikely, timeUnit),
          pessimistic: convertToMinutes(values.leadTimePessimistic, timeUnit),
          timeUnit: timeUnit // Store the unit
        },
        effortTime: {
          optimistic: convertToMinutes(values.effortTimeOptimistic, timeUnit),
          likely: convertToMinutes(values.effortTimeLikely, timeUnit),
          pessimistic: convertToMinutes(values.effortTimePessimistic, timeUnit),
          timeUnit: timeUnit
        }
      };
      
      Object.assign(task, {
        ...values,
        pert_time: {
          optimistic: convertToMinutes(values.optimisticTime, timeUnit),
          likely: convertToMinutes(values.likelyTime, timeUnit),
          pessimistic: convertToMinutes(values.pessimisticTime, timeUnit)
        },
        // Save the preferred unit of measure
        preferredUnit: timeUnit
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
    const displayUnit = task.pert_time?.leadTime?.timeUnit || 'hours'; // Access nested properties safely
    const leadTime = task.pert_time?.leadTime || { optimistic: 0, likely: 0, pessimistic: 0 }; // Provide default values
  
    return (
      <div className="task-item">
        <div className="task-content">
          <h4>{task.name}</h4>
          <Space>
            <Tag color="blue">R: {task.raci?.responsible?.join(', ')}</Tag> {/* Optional chaining */}
            <Tag color="geekblue">O: {minutesToUnit(leadTime.optimistic, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
            <Tag color="purple">L: {minutesToUnit(leadTime.likely, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
            <Tag color="magenta">P: {minutesToUnit(leadTime.pessimistic, displayUnit).toFixed(2)}{displayUnit === 'days' ? 'd' : displayUnit === 'hours' ? 'h' : 'm'}</Tag>
          </Space>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setSelectedItem({ type: 'task', stepId, ...task });
            setTimeUnit(task.pert_time?.leadTime?.timeUnit || 'hours'); // Set initial unit
            form.setFieldsValue({
              ...task,
              leadTimeOptimistic: minutesToUnit(task.pert_time?.leadTime?.optimistic || 0, task.pert_time?.leadTime?.timeUnit || 'hours'),
              leadTimeLikely: minutesToUnit(task.pert_time?.leadTime?.likely || 0, task.pert_time?.leadTime?.timeUnit || 'hours'),
              leadTimePessimistic: minutesToUnit(task.pert_time?.leadTime?.pessimistic || 0, task.pert_time?.leadTime?.timeUnit || 'hours'),
              effortTimeOptimistic: minutesToUnit(task.pert_time?.effortTime?.optimistic || 0, task.pert_time?.effortTime?.timeUnit || 'hours'),
              effortTimeLikely: minutesToUnit(task.pert_time?.effortTime?.likely || 0, task.pert_time?.effortTime?.timeUnit || 'hours'),
              effortTimePessimistic: minutesToUnit(task.pert_time?.effortTime?.pessimistic || 0, task.pert_time?.effortTime?.timeUnit || 'hours'),
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
    ['leadTimeOptimistic', 'leadTimeLikely', 'leadTimePessimistic', 'effortTimeOptimistic', 'effortTimeLikely', 'effortTimePessimistic'].forEach(field => {
      if (values[field] !== undefined) {
        let newValue = minutesToUnit(convertToMinutes(values[field], timeUnit), value);
        form.setFieldsValue({ [field]: newValue });
      }
    });
  };

//   const setInitialValues = (item) => {
//     if (item.type === 'task') {
//       const unit = item.preferredUnit || 'days';
//       setTimeUnit(unit);
//       form.setFieldsValue({
//         ...item,
//         optimisticTime: minutesToUnit(item.pert.optimistic, unit),
//         likelyTime: minutesToUnit(item.pert.likely, unit),
//         pessimisticTime: minutesToUnit(item.pert.pessimistic, unit)
//       });
//     } else {
//       form.setFieldsValue(item);
//     }
//   };

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
              <Row gutter={16}>
  {['leadTime', 'effortTime'].map((timeType) => (
                  <React.Fragment key={timeType}>
                    {['Optimistic', 'Likely', 'Pessimistic'].map((field) => (
    <Col key={field} span={6}>
      <Form.Item 
        label={`${timeType} ${field}`} 
        name={`${timeType}${field}`} 
        rules={[{ required: true }]}
      >
        <InputNumber min={0} />
      </Form.Item>
    </Col>
))}
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

              <div className="form-section">
                <h4>Resources</h4>
                <Form.Item label="Materials" name="materials">
                  <Select mode="tags" placeholder="Add materials" />
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
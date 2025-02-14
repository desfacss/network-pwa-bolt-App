import React, { useState } from 'react';
import { Collapse, List, Input, Button, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const { Panel } = Collapse;

const WorkflowEditor = ({ initialData }) => {
  const [form] = Form.useForm();
  const [workflowData, setWorkflowData] = useState(initialData);

  const addStep = () => {
    const newStep = {
      id: uuidv4(),
      name: 'New Step',
      tasks: []
    };
    setWorkflowData(prevData => ({
      ...prevData,
      blueprint: {
        ...prevData.blueprint,
        workflows: [
          ...prevData.blueprint.workflows.map(wf => 
            wf.id === 'wf_lead_to_order' ? 
            {...wf, steps: [...wf.steps, newStep]} : wf
          )
        ]
      }
    }));
  };

  const addTask = (stepIndex) => {
    const newTask = {
      id: uuidv4(),
      name: 'New Task',
      description: '',
      raci: {},
      materials: [],
      tools: [],
      checklist: []
    };
    setWorkflowData(prevData => {
      const steps = [...prevData.blueprint.workflows[0].steps];
      steps[stepIndex] = {
        ...steps[stepIndex],
        tasks: [...(steps[stepIndex].tasks || []), newTask]
      };
      return {
        ...prevData,
        blueprint: {
          ...prevData.blueprint,
          workflows: [
            ...prevData.blueprint.workflows.map(wf => 
              wf.id === 'wf_lead_to_order' ? {...wf, steps} : wf
            )
          ]
        }
      };
    });
  };

  const updateField = (stepIndex, taskIndex, field, value, isTask = false) => {
    setWorkflowData(prevData => {
      const steps = [...prevData.blueprint.workflows[0].steps];
      if (isTask) {
        steps[stepIndex].tasks[taskIndex] = {...steps[stepIndex].tasks[taskIndex], [field]: value};
      } else {
        steps[stepIndex] = {...steps[stepIndex], [field]: value};
      }
      return {
        ...prevData,
        blueprint: {
          ...prevData.blueprint,
          workflows: [
            ...prevData.blueprint.workflows.map(wf => 
              wf.id === 'wf_lead_to_order' ? {...wf, steps} : wf
            )
          ]
        }
      };
    });
  };

  const deleteItem = (stepIndex, taskIndex) => {
    setWorkflowData(prevData => {
      const steps = [...prevData.blueprint.workflows[0].steps];
      if (taskIndex !== undefined) {
        steps[stepIndex].tasks.splice(taskIndex, 1);
      } else {
        steps.splice(stepIndex, 1);
      }
      return {
        ...prevData,
        blueprint: {
          ...prevData.blueprint,
          workflows: [
            ...prevData.blueprint.workflows.map(wf => 
              wf.id === 'wf_lead_to_order' ? {...wf, steps} : wf
            )
          ]
        }
      };
    });
  };

  const renderItem = (item, stepIndex, taskIndex) => {
    const isTask = taskIndex !== undefined;
    return (
      <Form form={form} initialValues={item} layout="vertical">
        <Form.Item label="Name" name="name">
          <Input value={item.name} onChange={(e) => updateField(stepIndex, taskIndex, 'name', e.target.value, isTask)} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea value={item.description} onChange={(e) => updateField(stepIndex, taskIndex, 'description', e.target.value, isTask)} />
        </Form.Item>
        {!isTask && <Form.Item label="ID" name="id">
          <Input value={item.id} onChange={(e) => updateField(stepIndex, taskIndex, 'id', e.target.value, isTask)} />
        </Form.Item>}
        {isTask && (
          <>
            {/* Add fields for tasks like RACI, materials, tools, checklist */}
            <Form.Item label="RACI" name="raci">
              <Input value={JSON.stringify(item.raci)} onChange={(e) => updateField(stepIndex, taskIndex, 'raci', JSON.parse(e.target.value), isTask)} />
            </Form.Item>
            <Form.Item label="Materials" name="materials">
              <Input value={JSON.stringify(item.materials)} onChange={(e) => updateField(stepIndex, taskIndex, 'materials', JSON.parse(e.target.value), isTask)} />
            </Form.Item>
            <Form.Item label="Tools" name="tools">
              <Input value={JSON.stringify(item.tools)} onChange={(e) => updateField(stepIndex, taskIndex, 'tools', JSON.parse(e.target.value), isTask)} />
            </Form.Item>
            <Form.Item label="Checklist" name="checklist">
              <Input value={JSON.stringify(item.checklist)} onChange={(e) => updateField(stepIndex, taskIndex, 'checklist', JSON.parse(e.target.value), isTask)} />
            </Form.Item>
          </>
        )}
        <Button type="primary" danger onClick={() => deleteItem(stepIndex, taskIndex)} icon={<DeleteOutlined />}>Delete</Button>
      </Form>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Collapse accordion>
        {workflowData.blueprint.workflows[0].steps.map((step, stepIndex) => (
          <Panel header={step.name} key={step.id}>
            {renderItem(step, stepIndex)}
            <List
              dataSource={step.tasks}
              renderItem={(task, taskIndex) => (
                <List.Item>{renderItem(task, stepIndex, taskIndex)}</List.Item>
              )}
            />
            <Button onClick={() => addTask(stepIndex)} icon={<PlusOutlined />}>Add Task</Button>
          </Panel>
        ))}
      </Collapse>
      <Button onClick={addStep} icon={<PlusOutlined />} style={{ marginTop: '20px' }}>Add Step</Button>
      <Button onClick={() => console.log(JSON.stringify(workflowData, null, 2))} style={{ marginTop: '20px' }}>Save Workflow</Button>
    </div>
  );
};

export default WorkflowEditor;
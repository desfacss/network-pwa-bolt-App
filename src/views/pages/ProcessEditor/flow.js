// import React, { useState } from 'react';
// import ReactFlow, { addEdge, useNodesState, useEdgesState } from 'react-flow';
// import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// const initialNodes = []; // Initialize from your JSON
// const initialEdges = []; // Initialize from your JSON (connections between steps)

// const WorkflowVisualizer = () => {
//   const [nodes, setNodes] = useNodesState(initialNodes);
//   const [edges, setEdges] = useEdgesState(initialEdges);
//   const [workflowData, setWorkflowData] = useState(process.json); // Your JSON data

import React, { useState } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState } from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';
import workflowData from './process.json'; // Import the JSON data

// Custom node component for steps with tasks
const CustomStepNode = ({ data, id }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div onClick={toggleExpand}>
      <div>{data.label}</div>
      {isExpanded && 
        <ul style={{ paddingLeft: '15px' }}>
          {data.tasks && data.tasks.map(task => (
            <li key={task.id}>{task.name}</li>
          ))}
        </ul>
      }
    </div>
  );
};

// Transform JSON data into nodes and edges for ReactFlow, including tasks
const transformData = (data) => {
    const workflow = data.blueprint.workflows[0]; // Assuming we're dealing with the first workflow
    let nodes = workflow.steps.map((step, index) => ({
      id: step.id,
      position: { x: index * 200, y: 0 },
      data: { label: step.name, tasks: step.tasks },
      type: 'customStep'
    }));
  
    // Add task nodes
    let taskNodes = [];
    let taskEdges = [];
    nodes.forEach(stepNode => {
      stepNode.data.tasks.forEach((task, taskIndex) => {
        const taskNodeId = `${stepNode.id}_task_${task.id}`;
        taskNodes.push({
          id: taskNodeId,
          position: { x: stepNode.position.x, y: stepNode.position.y + (taskIndex + 1) * 100 },
          data: { label: task.name },
          type: 'default'
        });
        taskEdges.push({
          id: `e${stepNode.id}-${taskNodeId}`,
          source: stepNode.id,
          target: taskNodeId,
          type: 'smoothstep'
        });
      });
    });
  
    return { nodes: [...nodes, ...taskNodes], edges: [...taskEdges] };
  };

const WorkflowVisualizer = () => {
  // Use the transformed data to set up initial states
  const { nodes: initialNodes, edges: initialEdges } = transformData(workflowData);

  console.log("Initial nodes:", initialNodes);
  console.log("Initial edges:", initialEdges);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [currentWorkflowData, setCurrentWorkflowData] = useState(workflowData);

  console.log("Current workflow data:", currentWorkflowData);

  const onConnect = (params) => {
    console.log("Connecting nodes:", params);
    setEdges((eds) => addEdge(params, eds));
};

  const onNodeChange = (changes) => {
console.log("Changes to nodes:", changes);
    setNodes((nds) => nds.map((node) => {
      const changedNode = changes.find((chg) => chg.id === node.id);
      if (changedNode) {
console.log("Updating node:", node.id, "with changes:", changedNode);
        return { ...node, ...changedNode.data };
      }
      return node;
    }));
  };

  const onAddStep = () => {
// Use currentWorkflowData instead of workflowData
    const newStep = {
      id: uuidv4(),
      position: { x: 100, y: 100 },
      data: { label: 'New Step', tasks: [] }, // New steps start with empty tasks array
      type: 'customStep'
    };

    console.log("Adding new step:", newStep);
    setNodes((nds) => [...nds, newStep]);

    setCurrentWorkflowData((prevData) => {
console.log("Previous workflow data before adding step:", prevData);
            const workflow = prevData.blueprint.workflows[0];
      const newWorkflow = {
                  ...workflow,
                  steps: [...workflow.steps, {
                      id: newStep.id,
                      name: newStep.data.label,
                      tasks: []
                  }]
              };
          
      const newData = {
          ...prevData,
          blueprint: {
              ...prevData.blueprint,
              workflows: [{ ...workflow, ...newWorkflow }]
          }
        };

console.log("Updated workflow data:", newData);
      return newData;
    });
  };

  const onEditStep = (nodeId, updatedData) => {
console.log("Editing step with ID:", nodeId, "with new data:", updatedData);
      setNodes((nds) => nds.map((node) => {
          if (node.id === nodeId) {
              return {
                  ...node,
                  data: {
                      ...node.data,
                      label: updatedData.label // Assuming you're only updating the label
                  }
              };
          }
          return node;
      }));
      setCurrentWorkflowData((prevData) => {
console.log("Previous data before edit:", prevData);
        const updatedWorkflows = prevData.blueprint.workflows.map((wf) => {
            if (wf.id === 'wf_lead_to_order') {
                return {
                    ...wf,
                    steps: wf.steps.map((step) => {
                        if (step.id === nodeId) {
console.log("Updating step in workflow:", step, "to:", {...step, name: updatedData.label});
                            return {
                                ...step,
                                name: updatedData.label
                            };
                        }
                        return step;
                    })
                };
            }
            return wf;
        });
      const newData = {
            ...prevData,
            blueprint: {
                ...prevData.blueprint,
                workflows: updatedWorkflows
            }
        };
      console.log("Updated workflow data after edit:", newData);
      return newData;
    });
  };

  const onDeleteStep = (nodeId) => {
console.log("Deleting step with ID:", nodeId);
    setNodes((nds) => nds.filter((node) => node.id !== nodeId && !node.id.startsWith(nodeId + '_task_')));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setCurrentWorkflowData((prevData) => {
console.log("Previous data before deletion:", prevData);
      const updatedWorkflows = prevData.blueprint.workflows.map((wf) => {
          if (wf.id === 'wf_lead_to_order') {
              return {
                  ...wf,
                  steps: wf.steps.filter((step) => step.id !== nodeId)
              };
          }
          return wf;
      });
      const newData = {
          ...prevData,
          blueprint: {
              ...prevData.blueprint,
              workflows: updatedWorkflows
          }
      };
      console.log("Updated workflow data after deletion:", newData);
      return newData;
    });
  };

const onAddTask = (stepId) => {
    const newTask = { id: uuidv4(), name: 'New Task', description: '' };
    setCurrentWorkflowData((prevData) => {
      const updatedSteps = prevData.blueprint.workflows[0].steps.map(step => 
        step.id === stepId ? { ...step, tasks: [...step.tasks, newTask] } : step
      );
      return {
        ...prevData,
        blueprint: {
          ...prevData.blueprint,
          workflows: [{ ...prevData.blueprint.workflows[0], steps: updatedSteps }]
        }
      };
    });
    // Update nodes and edges for visualization - this would be more complex in reality
    setNodes(nodes => [...nodes, {
      id: `${stepId}_task_${newTask.id}`,
      position: { x: nodes.find(node => node.id === stepId).position.x, y: 0 }, // Position needs actual calculation
      data: { label: newTask.name },
      type: 'default'
    }]);
    setEdges(edges => [...edges, {
      id: `e${stepId}-${stepId}_task_${newTask.id}`,
      source: stepId,
      target: `${stepId}_task_${newTask.id}`,
      type: 'smoothstep'
    }]);
  };

const saveWorkflow = () => {
    const json = JSON.stringify(currentWorkflowData, null, 2);
    console.log(json);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'updated_workflow.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodeChange}
        fitView
nodeTypes={{
          customStep: CustomStepNode,
        }}
              >
          {/* You can add custom node types here if needed */}
      </ReactFlow>
      <button onClick={onAddStep}>Add Step</button>
<button onClick={saveWorkflow}>Save Workflow</button>
      {/* Example of editing a node (You would typically have a more sophisticated UI) */}
      {nodes.map(node => 
        node.type === 'customStep' && (
          <div key={node.id}>
              <input 
            type="text" 
            value={node.data.label} 
            onChange={(e) => onEditStep(node.id, {label: e.target.value})} 
          />
              <button onClick={() => onDeleteStep(node.id)}>Delete Step</button>
            <button onClick={() => onAddTask(node.id)}>Add Task</button>
          </div>
      )
      )}
    </div>
  );
};

export default WorkflowVisualizer;
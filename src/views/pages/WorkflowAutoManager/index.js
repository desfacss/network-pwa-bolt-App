import React, { useState } from 'react';
// import QueryBuilder from 'react-query-builder'; // Import react-query-builder
import { QueryBuilder} from 'react-querybuilder';
// import 'react-query-builder/dist/query-builder.css'; // Default styles for QueryBuilder
// import { supabase } from '../supabaseClient'; // Adjust to your Supabase setup
import { supabase } from 'api/supabaseClient';

// Sample domains for dropdown (replace with your actual domains)
const domains = ['Users', 'Organizations', 'Clients', 'Tasks', 'Events', 'Projects'];
const triggerTypes = ['On Create', 'On Update', 'Both', 'Scheduled Time', 'API Call'];
const actionTypes = ['Send Email', 'Update Fields', 'Assign Owner', 'Create Record', 'Create Activity', 'Manage Tags'];

// Main WorkflowBuilder Component
const WorkflowBuilder = ({ isOpen, onClose, initialWorkflow = null }) => {
  const [step, setStep] = useState(1);
  const [workflow, setWorkflow] = useState(
    initialWorkflow || {
      name: '',
      description: '',
      domain: '',
      triggerType: '',
      scheduleTime: '09:00', // Default for scheduled
      isAllRecords: true,
      conditions: { combinator: 'and', rules: [] }, // Default for QueryBuilder
      actions: [],
    }
  );

  // Handle input changes
  const handleChange = (key, value) => {
    setWorkflow((prev) => ({ ...prev, [key]: value }));
  };

  // Move between steps
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Save workflow to Supabase
  const saveWorkflow = async () => {
    try {
      const { data: workflowData, error: workflowError } = await supabase
        .from('Workflows')
        .insert({
          name: workflow.name,
          description: workflow.description,
          domain_table: workflow.domain,
          trigger_event: workflow.triggerType,
        })
        .select('id')
        .single();

      if (workflowError) throw workflowError;

      const workflowId = workflowData.id;

      // Save conditions if not "All Records"
      if (!workflow.isAllRecords) {
        const { error: conditionError } = await supabase
          .from('Conditions')
          .insert({
            workflow_id: workflowId,
            filter_criteria: JSON.stringify(workflow.conditions), // Store QueryBuilder output
          });
        if (conditionError) throw conditionError;
      }

      // Save actions
      const actionInserts = workflow.actions.map((action) => ({
        workflow_id: workflowId,
        action_type: action.type,
        parameters: JSON.stringify(action.params),
      }));
      const { error: actionError } = await supabase.from('Actions').insert(actionInserts);
      if (actionError) throw actionError;

      onClose(); // Close modal on success
    } catch (error) {
      console.error('Error saving workflow:', error.message);
      alert('Failed to save workflow');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        {/* Stepper */}
        <div className="flex justify-between mb-4">
          {['Trigger', 'Conditions', 'Actions', 'Review'].map((label, idx) => (
            <div
              key={label}
              className={`flex-1 text-center py-2 ${step === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <TriggerSelector workflow={workflow} handleChange={handleChange} />
        )}
        {step === 2 && (
          <ConditionEditor workflow={workflow} handleChange={handleChange} />
        )}
        {step === 3 && (
          <ActionEditor workflow={workflow} handleChange={handleChange} />
        )}
        {step === 4 && <ReviewPane workflow={workflow} />}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={step === 4 ? saveWorkflow : nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {step === 4 ? 'Save' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// TriggerSelector Component
const TriggerSelector = ({ workflow, handleChange }) => (
  <div>
    <h2 className="text-xl mb-4">Select Trigger</h2>
    <div className="mb-4">
      <label className="block mb-1">Domain</label>
      <select
        value={workflow.domain}
        onChange={(e) => handleChange('domain', e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Domain</option>
        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>
    </div>
    <div className="mb-4">
      <label className="block mb-1">Trigger Type</label>
      {triggerTypes.map((type) => (
        <div key={type} className="flex items-center mb-2">
          <input
            type="radio"
            name="triggerType"
            value={type}
            checked={workflow.triggerType === type}
            onChange={(e) => handleChange('triggerType', e.target.value)}
            className="mr-2"
          />
          <span>{type}</span>
        </div>
      ))}
    </div>
    {workflow.triggerType === 'Scheduled Time' && (
      <div className="mb-4">
        <label className="block mb-1">Schedule Time</label>
        <input
          type="time"
          value={workflow.scheduleTime}
          onChange={(e) => handleChange('scheduleTime', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
    )}
  </div>
);

// ConditionEditor Component with react-query-builder
const ConditionEditor = ({ workflow, handleChange }) => {
  const fields = [
    { name: 'status', label: 'Status' },
    { name: 'priority', label: 'Priority' },
    // Add more fields based on your domain schema
  ];

  return (
    <div>
      <h2 className="text-xl mb-4">Set Conditions</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={workflow.isAllRecords}
            onChange={(e) => handleChange('isAllRecords', e.target.checked)}
            className="mr-2"
          />
          Apply to All Records
        </label>
      </div>
      {!workflow.isAllRecords && (
        <QueryBuilder
          fields={fields}
          query={workflow.conditions}
          onQueryChange={(query) => handleChange('conditions', query)}
          controlClassnames={{ combinators: 'border p-1 rounded' }}
        />
      )}
    </div>
  );
};

// ActionEditor Component
const ActionEditor = ({ workflow, handleChange }) => {
  const addAction = () => {
    const newAction = { type: '', params: {}, isScheduled: false };
    handleChange('actions', [...workflow.actions, newAction]);
  };

  const updateAction = (index, key, value) => {
    const updatedActions = workflow.actions.map((action, i) =>
      i === index ? { ...action, [key]: value } : action
    );
    handleChange('actions', updatedActions);
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Define Actions</h2>
      {workflow.actions.map((action, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <select
            value={action.type}
            onChange={(e) => updateAction(index, 'type', e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Action</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {action.type === 'Send Email' && (
            <>
              <input
                type="text"
                placeholder="Recipient"
                value={action.params.to || ''}
                onChange={(e) => updateAction(index, 'params', { ...action.params, to: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Subject"
                value={action.params.subject || ''}
                onChange={(e) => updateAction(index, 'params', { ...action.params, subject: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
            </>
          )}
          {/* Add more action-specific fields as needed */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={action.isScheduled}
              onChange={(e) => updateAction(index, 'isScheduled', e.target.checked)}
              className="mr-2"
            />
            Schedule Action
          </label>
        </div>
      ))}
      <button onClick={addAction} className="px-4 py-2 bg-green-500 text-white rounded">
        Add Action
      </button>
    </div>
  );
};

// ReviewPane Component
const ReviewPane = ({ workflow }) => (
  <div>
    <h2 className="text-xl mb-4">Review Workflow</h2>
    <p><strong>Name:</strong> {workflow.name}</p>
    <p><strong>Description:</strong> {workflow.description}</p>
    <p><strong>Trigger:</strong> {workflow.domain} - {workflow.triggerType} {workflow.scheduleTime ? `at ${workflow.scheduleTime}` : ''}</p>
    <p><strong>Conditions:</strong> {workflow.isAllRecords ? 'All Records' : JSON.stringify(workflow.conditions)}</p>
    <p><strong>Actions:</strong></p>
    <ul>
      {workflow.actions.map((action, index) => (
        <li key={index}>
          {action.type} - {JSON.stringify(action.params)} {action.isScheduled ? '(Scheduled)' : '(Instant)'}
        </li>
      ))}
    </ul>
  </div>
);

// WorkflowManager (Parent Component Example)
const WorkflowManager = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]); // Fetch from Supabase in useEffect if needed

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Workflows</h1>
      <button
        onClick={() => setIsBuilderOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        Create Workflow
      </button>
      {/* WorkflowList component could go here */}
      <WorkflowBuilder isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
    </div>
  );
};

export default WorkflowManager;
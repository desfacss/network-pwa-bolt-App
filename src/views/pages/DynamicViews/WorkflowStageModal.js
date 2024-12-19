import React, { useState } from 'react';
import { Modal, notification } from 'antd';
import DynamicForm from '../DynamicForm';
import { generateSchemas } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';

const WorkflowStageModal = ({ visible, onCancel, data, entityType, handleWorkflowTransition, viewConfig, formData }) => {

    const handleSubmit = async (formData) => {
        console.log("pl", formData, data?.details)
        try {
            const updatedDetails = {
                ...data?.details,
                ...formData,
            };

            // Update the record in Supabase
            const { data: updateData, error } = await supabase
                .from(entityType)
                .update({ details: updatedDetails })
                .eq('id', data.id);

            if (error) {
                throw error;
            }

            // Call the parent's handler to handle transitions
            if (typeof handleWorkflowTransition === 'function') {
                await handleWorkflowTransition(data.id, updatedDetails);
            }

            // onCancel(); // Close the modal
        } catch (error) {
            notification.error({
                message: 'Error updating record',
                description: error.message,
            });
        }
    };

    // const { dataSchema: exitDataSchema, uiSchema: exitUiSchema } = generateSchemas(data.exit_criteria);
    // const schemas = generateSchemas(viewConfig?.form_schema, { entry_criteria: data?.entry_criteria, exit_criteria: data?.exit_criteria });
    const schemas = generateSchemas(viewConfig?.master_data_schema, data?.criteria, data?.details);
    console.log("m", data?.details, schemas)
    return (
        <Modal
            visible={visible}
            title="Update Workflow Stage"
            onCancel={onCancel}
            onOk={() => { }}
            footer={null} // Remove default footer to control submission
            width={600}
        >
            {/* <h3>Exit Criteria</h3>
            <Form
                schema={exitDataSchema}
                uiSchema={exitUiSchema}
                formData={data.exit_criteria}
                onSubmit={(e) => handleSubmit({ formData: { ...e.formData, ...data.entry_criteria } })}
            />
            <h3>Entry Criteria</h3> */}
            <DynamicForm
                schemas={schemas}
                formData={schemas?.form_data}
                // onFinish={(e) => handleSubmit({ formData: { ...data, ...e.formData } })}
                onFinish={handleSubmit}
            />
        </Modal>
    );
};

export default WorkflowStageModal;

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Checkbox, InputNumber, notification } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const WorkflowStageModal = ({ visible, onCancel, data, entityType, handleWorkflowTransition, formData }) => {
    const [form] = Form.useForm();

    // Prepare initial values from vd (extracted from your RPC function)
    const initialValues = {
        exit_criteria: data.exit_criteria,
        entry_criteria: data.entry_criteria,
    };

    // Dynamic field rendering for exit and entry criteria
    const renderCriteriaFields = (criteria, isExit) => {
        return Object.entries(criteria).map(([key, value]) => {
            if (typeof value === 'boolean') {
                return (
                    <Form.Item name={`${isExit ? 'exit_' : 'entry_'}criteria_${key}`} label={key} valuePropName="checked" key={key}>
                        <Checkbox>{key}</Checkbox>
                    </Form.Item>
                );
            }
            if (typeof value === 'number') {
                return (
                    <Form.Item name={`${isExit ? 'exit_' : 'entry_'}criteria_${key}`} label={key} key={key}>
                        <InputNumber min={0} defaultValue={value} style={{ width: '100%' }} />
                    </Form.Item>
                );
            }
            return (
                <Form.Item name={`${isExit ? 'exit_' : 'entry_'}criteria_${key}`} label={key} key={key}>
                    <Input defaultValue={value} />
                </Form.Item>
            );
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const updatedDetails = {
                ...data?.details,
                lead_score: values?.exit_criteria_lead_score || values?.entry_criteria_lead_score || data?.details?.lead_score,
                has_contacted: values?.exit_criteria_has_contacted || data?.details?.has_contacted,
                qualification_complete: values?.exit_criteria_qualification_complete || data?.details?.qualification_complete,
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
            if (typeof handleWorkflowTransition === "function") {
                await handleWorkflowTransition(data.id, updatedDetails);
            }

            onCancel(); // Close the modal
        } catch (error) {
            console.log("RT", data, error)
            notification.error({
                message: 'Error updating record',
                description: error.message,
            });
        }
    };


    return (
        <Modal
            visible={visible}
            title="Update Workflow Stage"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Update"
            cancelText="Cancel"
            width={600}
        >
            <Form form={form} initialValues={initialValues}>
                {/* <h3>Exit Criteria</h3> */}
                {renderCriteriaFields(data.exit_criteria, true)}

                {/* <h3>Entry Criteria</h3> */}
                {renderCriteriaFields(data.entry_criteria, false)}
            </Form>
        </Modal>
    );
};

export default WorkflowStageModal;

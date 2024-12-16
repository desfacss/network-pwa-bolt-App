import React, { useState } from 'react';
import { Modal, Form, Input, Button, Checkbox, InputNumber, notification } from 'antd';
import { supabase } from 'configs/SupabaseConfig';

const WorkflowStageModal = ({ visible, onCancel, data, entityType, formData }) => {
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
            console.log("VA", values)
            // Prepare the updated details object to be sent to Supabase
            const updatedDetails = {
                ...data.details,
                exit_criteria: {
                    ...data.exit_criteria,
                    lead_score: values.exit_criteria_lead_score,
                    has_contacted: values.exit_criteria_has_contacted,
                    qualification_complete: values.exit_criteria_qualification_complete,
                },
                entry_criteria: {
                    ...data.entry_criteria,
                    lead_score: values.entry_criteria_lead_score,
                },
            };

            // Update record in Supabase
            const { data: updateData, error } = await supabase
                .from('y_sales')
                .update({ details: updatedDetails })
                .eq('id', data.id);

            if (error) {
                throw error;
            }

            notification.success({
                message: 'Task updated successfully',
            });
            onCancel(); // Close the modal
        } catch (error) {
            console.error('Error updating record:', error);
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

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Switch, InputNumber, Collapse, message, Divider } from "antd";
import { supabase } from "configs/SupabaseConfig";
// import supabase from "../supabase"; // Adjust this import to your Supabase client instance

const { Panel } = Collapse;
const { Option } = Select;

const TimesheetSettings = ({ locationId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("locations")
            .select("details")
            .eq("id", locationId)
            .single();

        if (error) {
            message.error("Failed to fetch settings");
        } else {
            form.setFieldsValue(data.details);
        }
        setLoading(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        const { error } = await supabase
            .from("locations")
            .update({ details: values })
            .eq("id", locationId);

        if (error) {
            message.error("Failed to update settings");
        } else {
            message.success("Settings updated successfully");
        }
        setLoading(false);
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ approvalWorkflow: {}, overtimeTracking: {}, breakPolicy: {} }}
        >
            <Collapse defaultActiveKey={["1"]}>
                {/* 1. Timesheet Approval Workflow */}
                <Panel header="Timesheet Approval Workflow" key="1">
                    <Form.Item name={["approvalWorkflow", "enableApproval"]} label="Enable Approval Workflow" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["approvalWorkflow", "defaultApprover"]} label="Default Approver">
                        <Select>
                            <Option value="Line Manager">Line Manager</Option>
                            <Option value="HR Partner">HR Partner</Option>
                            <Option value="Admin">Admin</Option>
                            {/* <Option value="Custom">Custom</Option> */}
                        </Select>
                    </Form.Item>
                    {/* <Form.Item name={["approvalWorkflow", "multiLevelApproval"]} label="Multi-Level Approval" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["approvalWorkflow", "approvalLevels"]} label="Approval Levels">
                        <Select>
                            {[1, 2, 3].map(level => (
                                <Option key={level} value={level}>{level} Level{level > 1 && 's'}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name={["approvalWorkflow", "escalationApprover"]} label="Escalation Approver">
                        <Input />
                    </Form.Item>
                    <Form.Item name={["approvalWorkflow", "autoApprovalRules"]} label="Auto-Approval Rules">
                        <Input />
                    </Form.Item> */}
                    <Form.Item name={["approvalWorkflow", "timeLimitForApproval"]} label="Time Limit for Approval (Days)">
                        <InputNumber min={0} />
                    </Form.Item>
                </Panel>

                {/* 2. Time Entry Rounding */}
                <Panel header="Time Entry Rounding" key="2">
                    <Form.Item name={["timeEntryRounding", "roundTimeEntries"]} label="Round Time Entries" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["timeEntryRounding", "roundingIncrement"]} label="Rounding Increment">
                        <Select>
                            {[5, 10, 15, 30].map(minute => (
                                <Option key={minute} value={minute}>{minute} minutes</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* <Form.Item name={["timeEntryRounding", "roundingMethod"]} label="Rounding Method">
                        <Select>
                            <Option value="Round Up">Round Up</Option>
                            <Option value="Round Down">Round Down</Option>
                            <Option value="Nearest">Nearest</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name={["timeEntryRounding", "applyRoundingOn"]} label="Apply Rounding on">
                        <Select>
                            <Option value="start">Start Time</Option>
                            <Option value="end">End Time</Option>
                            <Option value="both">Both</Option>
                        </Select>
                    </Form.Item> */}
                </Panel>

                {/* 3. Default Working Hours */}
                <Panel header="Default Working Hours" key="3">
                    <Form.Item name={["workingHours", "standardDailyHours"]} label="Standard Daily Hours">
                        <InputNumber min={1} max={24} />
                    </Form.Item>
                    <Form.Item name={["workingHours", "standardWeeklyHours"]} label="Standard Weekly Hours">
                        <InputNumber min={1} max={168} />
                    </Form.Item>
                    {/* <Form.Item name={["workingHours", "shiftPatterns"]} label="Shift Patterns">
                        <Input />
                    </Form.Item>
                    <Form.Item name={["workingHours", "timeZoneDefaults"]} label="Time Zone-Based Defaults" valuePropName="checked">
                        <Switch />
                    </Form.Item> */}
                </Panel>

                {/* 4. Overtime Tracking */}
                <Panel header="Overtime Tracking" key="4">
                    <Form.Item name={["overtimeTracking", "enableOvertime"]} label="Enable Overtime" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    {/* <Form.Item name={["overtimeTracking", "overtimeRate"]} label="Overtime Rate (%)">
                        <InputNumber min={0} max={100} />
                    </Form.Item> */}
                    <Form.Item name={["overtimeTracking", "maxOvertimeHours"]} label="Max Overtime Hours">
                        <InputNumber min={0} />
                    </Form.Item>
                    {/* <Form.Item name={["overtimeTracking", "autoApprovalForOvertime"]} label="Auto Approval for Overtime" valuePropName="checked">
                        <Switch />
                    </Form.Item> */}
                </Panel>

                {/* 5. Break Policy */}
                <Panel header="Break Policy" key="5">
                    <Form.Item name={["breakPolicy", "enableBreakTracking"]} label="Enable Break Tracking" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "minBreakDuration"]} label="Minimum Break Duration (Minutes)">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "maxBreakDuration"]} label="Maximum Break Duration (Minutes)">
                        <InputNumber min={0} />
                    </Form.Item>
                    {/* <Form.Item name={["breakPolicy", "autoDeductBreakTime"]} label="Auto-Deduct Break Time" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "breakRounding"]} label="Break Time Rounding">
                        <Select>
                            <Option value="Round Up">Round Up</Option>
                            <Option value="Round Down">Round Down</Option>
                            <Option value="Nearest">Nearest</Option>
                        </Select>
                    </Form.Item> */}
                </Panel>

            </Collapse>

            <Divider />

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save Settings
                </Button>
            </Form.Item>
        </Form>
    );
};

export default TimesheetSettings;

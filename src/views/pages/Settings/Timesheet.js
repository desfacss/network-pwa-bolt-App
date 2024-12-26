import React, { useState, useEffect } from "react";
import { Form, Button, Select, Switch, InputNumber, Collapse, message, Divider } from "antd";
import { supabase } from "configs/SupabaseConfig";
import { useSelector } from "react-redux";
// import supabase from "../supabase"; // Adjust this import to your Supabase client instance

const { Panel } = Collapse;
const { Option } = Select;

const TimesheetSettings = ({ locationId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", session?.user?.organization?.id)
            .single();

        if (error) {
            message.error("Failed to fetch settings");
        } else {
            // console.log("data", data)
            form.setFieldsValue(data?.timesheet_settings);
        }
        setLoading(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        const { error } = await supabase
            .from("organizations")
            .update({ timesheet_settings: values })
            .eq("id", session?.user?.organization?.id);

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
        // initialValues={{ approvalWorkflow: { defaultApprover: 'manager' }, breakPolicy: {} }}
        >
            <Collapse defaultActiveKey={["1"]} >
                {/* 1. Timesheet Approval Workflow */}
                <Panel forceRender header="Approval Workflow" key="1">
                    {/* <Form.Item name={["approvalWorkflow", "enableApproval"]} label="Enable Approval Workflow" valuePropName="checked">
                        <Switch disabled />
                    </Form.Item> */}
                    <Form.Item name={["approvalWorkflow", "defaultApprover"]} label="Default Approver" required={true}>
                        <Select>
                            <Option value="manager">Line Manager</Option>
                            <Option value="hr">HR Partner</Option>
                            {/* <Option value="admin">Admin</Option>
                            <Option value="Custom">Custom</Option> */}
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
                    <Form.Item name={["approvalWorkflow", "submissionEmail"]} label="Send Email for submissin" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["approvalWorkflow", "reviewEmail"]} label="Send Email for Review" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Panel>

                {/* 2. Time Entry Rounding */}
                {/* <Panel forceRender header="Time Entry Rounding" key="2">
                    <Form.Item name={["timeEntryRounding", "roundTimeEntries"]} label="Round Time Entries" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["timeEntryRounding", "roundingIncrement"]} label="Rounding Increment">
                        <Select>
                            {[0, 15, 30,45].map(minute => (
                                <Option key={minute} value={minute}>{minute} minutes</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name={["timeEntryRounding", "roundingMethod"]} label="Rounding Method">
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
                    </Form.Item>
                </Panel> */}

                {/* 3. Default Working Hours */}
                <Panel forceRender header="Default Working Hours" key="3">
                    <Form.Item name={["workingHours", "standardDailyHours"]} label="Standard Daily Hours" disable >
                        <InputNumber min={1} max={24} />
                    </Form.Item>
                    <Form.Item name={["workingHours", "maxOvertimeHours"]} label="Max Overtime Hours">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["workingHours", "standardWeeklyHours"]} label="Standard Weekly Hours" disable >
                        <InputNumber min={1} max={168} />
                    </Form.Item>
                    <Form.Item name={["workingHours", "projectFinalHours"]} label="Project Warning Threshold(%)">
                        <InputNumber min={1} max={100} />
                    </Form.Item>
                    {/* <Form.Item name={["workingHours", "shiftPatterns"]} label="Shift Patterns">
                        <Input />
                    </Form.Item>
                    <Form.Item name={["workingHours", "timeZoneDefaults"]} label="Time Zone-Based Defaults" valuePropName="checked">
                        <Switch />
                    </Form.Item> */}
                </Panel>

                {/* 4. Contract Working Hours */}
                <Panel forceRender header="Contract Working Hours" key="4">
                    <Form.Item name={["contractWorkingHours", "standardDailyHours"]} label="Standard Daily Hours" disable >
                        <InputNumber min={0} max={24} />
                    </Form.Item>
                    <Form.Item name={["contractWorkingHours", "maxOvertimeHours"]} label="Max Overtime Hours">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["contractWorkingHours", "standardWeeklyHours"]} label="Standard Weekly Hours" disable >
                        <InputNumber min={0} max={168} />
                    </Form.Item>
                    <Form.Item name={["contractWorkingHours", "projectFinalHours"]} label="Project Warning Threshold(%)">
                        <InputNumber min={1} max={100} />
                    </Form.Item>
                </Panel>

                {/* 5. Overtime Tracking
                <Panel forceRender header="Overtime Tracking" key="5">
                    <Form.Item name={["overtimeTracking", "enableOvertime"]} label="Enable Overtime" valuePropName="checked">
                        <Switch disabled />
                    </Form.Item>
                    <Form.Item name={["overtimeTracking", "overtimeRate"]} label="Overtime Rate (%)">
                        <InputNumber min={0} max={100} />
                    </Form.Item>
                    <Form.Item name={["overtimeTracking", "maxOvertimeHours"]} label="Max Overtime Hours">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["overtimeTracking", "autoApprovalForOvertime"]} label="Auto Approval for Overtime" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Panel> */}

                {/* 6. Break Policy */}
                {/* <Panel forceRender header="Break Policy" key="6">
                    <Form.Item name={["breakPolicy", "enableBreakTracking"]} label="Enable Break Tracking" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "minBreakDuration"]} label="Minimum Break Duration (Minutes)">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "maxBreakDuration"]} label="Maximum Break Duration (Minutes)">
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "autoDeductBreakTime"]} label="Auto-Deduct Break Time" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name={["breakPolicy", "breakRounding"]} label="Break Time Rounding">
                        <Select>
                            <Option value="Round Up">Round Up</Option>
                            <Option value="Round Down">Round Down</Option>
                            <Option value="Nearest">Nearest</Option>
                        </Select>
                    </Form.Item>
                </Panel> */}

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

import React from "react";
import { Button, Upload, notification, Tooltip, Modal } from "antd";
import { supabase } from "configs/SupabaseConfig";
import Papa from "papaparse";
import { useSelector } from "react-redux";
import { ExportOutlined, ImportOutlined } from "@ant-design/icons";

const ExportImportButtons = ({ data, fetchData, entityType, viewConfig }) => {

    const { session } = useSelector((state) => state.auth);


    const handleExport = () => {
        if (!data || !data.length) {
            notification.warning({ message: "No data available to export." });
            return;
        }

        // Show confirmation dialog
        Modal.confirm({
            title: "Are you sure you want to export the data?",
            content: "This will export the current data to a CSV file.",
            onOk: () => {
                // Proceed with export if confirmed
                const csvData = data?.map((item) => item?.details)?.map((row) =>
                    Object.fromEntries(
                        Object.entries(row).map(([key, value]) => [
                            key,
                            typeof value === "object" ? JSON.stringify(value) : value,
                        ])
                    )
                );

                const csv = Papa.unparse(csvData);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "data_export.csv";
                link.click();
            },
            onCancel: () => {
                // Do nothing if canceled
                console.log("Export canceled");
            }
        });
    };

    const handleImport = (file) => {
        Papa.parse(file, {
            header: true,
            complete: async (result) => {
                const { data, errors } = result;

                if (errors.length) {
                    notification.error({
                        message: "Error parsing CSV",
                        description: errors.map((e) => e.message).join(", "),
                    });
                    return;
                }

                const config = viewConfig?.master_data_schema

                const validatedData = [];
                for (const row of data) {
                    const validatedRow = {};

                    // Check required fields
                    for (const field of config?.required) {
                        if (!row[field]) {
                            notification.error({
                                message: "Missing Required Fields",
                                description: `Row is missing required field: ${field}`,
                            });
                            return;
                        }
                        validatedRow[field] = row[field];
                    }

                    // Set default values for missing optional fields
                    for (const [key, property] of Object.entries(config.properties)) {
                        if (!row[key] && !config.required.includes(key)) {
                            validatedRow[key] =
                                property.type === "boolean" ? false :
                                    property.type === "array" ? [] :
                                        property.type === "number" ? null :
                                            "";
                        } else {
                            validatedRow[key] = row[key];
                        }
                    }

                    validatedData.push(validatedRow);
                }

                try {
                    const { error } = await supabase
                        .from(entityType)
                        // .insert(validatedData.map((row) => ({ details: row })));
                        .insert(
                            validatedData?.map((row) => ({
                                organization_id: session?.user?.organization_id,
                                created_by: session?.user?.id,
                                details: row,
                                is_active: true
                            }))
                        );
                    if (error) {
                        throw error;
                    }
                    notification.success({ message: "Data imported successfully." });
                    fetchData(); // Refresh data after import
                } catch (err) {
                    notification.error({
                        message: "Failed to import data",
                        description: err.message,
                    });
                }
            },
        });
    };


    return (
        <div style={{ marginBottom: 16, marginRight: 8 }}>
            {/* Export button with Tooltip and Icon */}
            <Tooltip title="Export to CSV">
                <Button
                    type="primary"
                    icon={<ExportOutlined />} // Ant Design export icon
                    onClick={handleExport}
                />
            </Tooltip>

            {/* Import button with Tooltip and Icon */}
            <Tooltip title="Import from CSV">
                <Upload
                    accept=".csv"
                    showUploadList={false}
                    beforeUpload={(file) => {
                        handleImport(file);
                        return false; // Prevent automatic upload
                    }}
                >
                    <Button
                        type="default"
                        icon={<ImportOutlined />} // Ant Design import icon
                        style={{ marginLeft: 8 }}
                    />
                </Upload>
            </Tooltip>
        </div>
    );
};

export default ExportImportButtons;

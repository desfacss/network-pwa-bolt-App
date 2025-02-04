import { notification } from 'antd';
import { supabase } from 'api/supabaseClient';
import { store } from 'store';

export const handleAllocations = async (formData, allocationsTable, mainEntityId) => {

    const state = store.getState();
    const session = state?.auth?.session

    const { table, rows, mapping, additionalFields, wholeRowColumn } = allocationsTable;
    const itemsList = formData[rows];

    if (Array.isArray(itemsList)) {
        const formattedRows = itemsList?.map(item => {
            const newRow = {};

            // If wholeRowColumn is specified, store the entire row as a single value
            if (wholeRowColumn) {
                newRow[wholeRowColumn] = item;
            } else {
                // Map specific fields to columns
                Object.keys(mapping).forEach(key => {
                    newRow[mapping[key]] = item[key];
                });
            }

            // Add additional fields to each row
            if (additionalFields) {
                Object.keys(additionalFields).forEach(fieldKey => {
                    const fieldValue = additionalFields[fieldKey];

                    // If the value in additionalFields is 'mainEntityId', use the mainEntityId
                    if (fieldValue === 'mainEntityId') {
                        newRow[fieldKey] = mainEntityId;
                    } else if (formData[fieldValue] !== undefined) {
                        // Otherwise, use the value from formData
                        newRow[fieldKey] = formData[fieldValue];
                    } else {
                        // If no value in formData, use the fixed value specified in additionalFields
                        newRow[fieldKey] = fieldValue;
                    }
                });
            }

            return { ...newRow, organization_id: session?.user?.organization_id };
        });
        console.log("rw", formattedRows)
        // Insert rows into allocations table
        const { data, error } = await supabase
            .from(table)
            .insert(formattedRows);

        if (error) {
            notification.error({ message: `Failed to add to ${table}` });
            console.error('Error:', error);
        }
    }
};
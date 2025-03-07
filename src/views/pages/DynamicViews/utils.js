import { notification } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
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

export function transformData(data, data_config) {
    const details2 = data?.details2 || {};
    const details = data?.details || {};

    const mergedDetails = { ...details2, ...details }; // Merge with priority

    const formData = {};

    data_config.forEach(config => {
        const key = config.key;
        const value = getValueByKey(data, key);

        if (value !== undefined) {
            const finalKey = key.substring(key.lastIndexOf(".") + 1); // Extract key
            formData[finalKey] = value;
        }
    });

    // Add the rest of the mergedDetails not already covered.
    for (const key in mergedDetails) {
        if (!(key in formData)) { // Only add if not already in formData
            formData[key] = mergedDetails[key];
        }
    }

    return formData;
}

function getValueByKey(obj, key) {
    if (!obj || typeof obj !== 'object' || !key) {
        return undefined;
    }

    const keys = key.split('.');
    let current = obj;

    for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
            current = current[k];
        } else {
            return undefined;
        }
    }

    return current;
}

export function removeNullFields(obj) {
    const newObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (value !== null) {
                if (typeof value === 'object' && value !== null) {  // Recurse for nested objects
                    const nestedObj = removeNullFields(value);
                    if (Object.keys(nestedObj).length > 0) { // Only add if nested object is not empty after null removal
                        newObj[key] = nestedObj;
                    }
                } else {
                    newObj[key] = value;
                }
            }
        }
    }
    return newObj;
}
import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { supabase } from "configs/SupabaseConfig";

export const useData = (entityType, dateRange, fetchConfig, setData, setRawData) => {
    const { isPending, error, data } = useQuery({
        queryKey: ["datas", entityType, dateRange],
        queryFn: async () => {
            // Ensure the query only runs if the date range is valid
            if (dateRange.length === 2) {
                try {
                    const { data, error } = await supabase
                        .from(entityType)
                        .select("*")
                    // .gte("created_at", dateRange[0].format()) // Uncomment if using date range filter
                    // .lte("created_at", dateRange[1].format()); // Uncomment if using date range filter

                    if (error) throw error;
                    if (data) {
                        setData(data);
                        let sales = [];

                        // Loop through each sale and process foreign keys from the details field
                        for (let sale of data) {
                            const details = sale.details;

                            // Loop through each foreign key in the details and fetch related data based on config
                            for (const key in details) {
                                const foreignKey = details[key];
                                if (fetchConfig[key]) {
                                    const { table, column } = fetchConfig[key];

                                    // Fetch data from the related table
                                    const { data: relatedData, error: relatedError } = await supabase
                                        .from(table)
                                        .select('*')
                                        .eq('id', foreignKey);

                                    if (relatedError) throw relatedError;

                                    // Store the related data in a separate object for now
                                    sale.related_data = sale.related_data || {};
                                    sale.related_data[key] = relatedData[0]; // Store by key
                                }
                            }
                        }
                        setRawData(data);  // Update raw data after all operations are completed
                        return data;
                    }
                    return [];  // Return empty array if no data fetched
                } catch (err) {
                    notification.error({ message: err.message || "Failed to fetch data" });
                    return [];  // Return empty if there's an error
                }
            }
            return [];  // Return empty if date range is invalid
        },
        enabled: !!entityType && dateRange.length === 2,  // Prevent query from running unnecessarily
        refetchOnWindowFocus: false,  // Disable refetching when the window is focused
        retry: false,  // Avoid retrying on failure (can be controlled)
    });

    // Optionally, you can log the state and errors for debugging
    // console.log("Query state:", { isPending, error, data });
};

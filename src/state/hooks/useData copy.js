import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { supabase } from "configs/SupabaseConfig";

export const useData = (entityType, dateRange, fetchConfig, setData, setRawData) => {
    const { isPending, error, data } = useQuery({
        queryKey: ["datas", entityType, dateRange],
        queryFn: async () => {

            if (dateRange.length === 2) {
                const { data, error } = await supabase
                    .from(entityType)
                    .select("*")
                // console.log('g', data)
                // .gte("created_at", dateRange[0].format())
                // .lte("created_at", dateRange[1].format());
                if (error) throw error;
                if (data) {

                    setData(data)
                    let sales = []
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
                                    .select('*') // Use * to fetch all columns if no specific column is mentioned
                                    .eq('id', foreignKey);

                                if (relatedError) throw relatedError;

                                // Store the related data in a separate object for now
                                sale.related_data = sale.related_data || {};
                                sale.related_data[key] = relatedData[0]; // Store by key
                            }
                        }
                    }
                    console.log("Dta", data, data.map(item => ({ ...item.details, id: item?.id })))// data.map(task => ({ ...task.details, id: task?.id })))
                    setRawData(data);
                    return data;
                }
                return [];
            }
        }
        // ,
        // onSuccess: (data) => {
        //     console.log("DT", data)
        //     setData(data);
        // },
        // onError: (error) => {
        //     notification.error({ message: error.message || "Failed to fetch data" });
        // },
        // enabled: !!entityType && dateRange.length === 2, // Ensures the query doesn't run unnecessarily
    });
    // console.log("c", isPending, error, data)
};

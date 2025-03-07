// import { useQuery } from "@tanstack/react-query";
// import { notification } from "antd";
// import { supabase } from "configs/SupabaseConfig";

// export const useViewConfig = (entityType, setViewConfig) => {
//     console.log("vd", entityType)
//     useQuery({
//         queryKey: ["viewConfig", entityType],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("y_view_config")
//                 .select("*")
//                 .eq("entity_type", entityType);
//             if (error) throw error;
//             return data[0];
//         },
//         onSuccess: (data) => {
//             console.log("VC", data)
//             setViewConfig(data);
//         },
//         onError: (error) => {
//             notification.error({ message: error.message || "Failed to fetch View Config" });
//         },
//         enabled: !!entityType, // Ensures the query doesn't run without an entityType
//     });
// };



import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { supabase } from "configs/SupabaseConfig";

export const useViewConfig = (entityType, setViewConfig) => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["viewConfig", entityType],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("y_view_config")
                .select("*")
                .eq("entity_type", entityType);
            if (error) throw error;
            setViewConfig(data[0])
            return data[0];
        }

        // onSuccess: (data) => {
        //     console.log("View Config fetched:", data);
        //     setViewConfig(data);
        // },
        // onError: (error) => {
        //     console.error("Query Error:", error);
        //     notification.error({
        //         message: error.message || "Failed to fetch View Config",
        //     });
        // },
        // enabled: !!entityType, // Ensure the query runs only when entityType is available
    });

    // return { data, error, isLoading };
};

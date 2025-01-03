// import { useQuery } from "@tanstack/react-query";
// import { notification } from "antd";
// import { supabase } from "api/supabaseClient";

// export const useWorkflowConfig = (entityType, session, setWorkflowConfig) => {
//     const { data, error, isLoading } = useQuery({
//         queryKey: ["workflowConfig", entityType, session],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("workflow_configurations")
//                 .select("*")
//             // .eq("entity_type", entityType)
//             // .eq("organization_id", session?.user?.organization?.id);
//             if (error) throw error;
//             console.log("Workflow Config fetched:", session, data);
//             setWorkflowConfig(data)
//             return data[0];
//         }

//         // onSuccess: (data) => {
//         //     console.log("Workflow Config fetched:", data);
//         //     setWorkflowConfig(data);
//         // },
//         // onError: (error) => {
//         //     console.error("Query Error:", error);
//         //     notification.error({
//         //         message: error.message || "Failed to fetch Workflow Config",
//         //     });
//         // },
//         // enabled: !!entityType && !!session, // Ensure query runs only when both entityType and session are available
//     });

//     // return { data, error, isLoading };
// };


import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { supabase } from "api/supabaseClient";

export const useWorkflowConfig = (entityType, session, setWorkflowConfig) => {
    const { data, error, isLoading } = useQuery({
        queryKey: session ? ["workflowConfig", entityType, session.user?.organization?.id] : ["workflowConfig", entityType],
        queryFn: async () => {
            console.log("Wor", entityType, session.user?.organization?.id);
            const { data, error } = await supabase
                .from("workflow_configurations")
                .select("*")
                .eq("organization_id", session?.user?.organization?.id)
                // .eq("entity_type", entityType)
                .eq("entity_type", entityType)
            if (error) throw error;
            console.log("Workflow Config fetched:", session, data);
            return data[0];
        },
        onSuccess: (data) => {
            console.log("Workflow Config successfully set:", data);
            setWorkflowConfig(data);
        },
        onError: (error) => {
            console.error("Query Error:", error);
            notification.error({
                message: error.message || "Failed to fetch Workflow Config",
            });
        },
        enabled: !!entityType && !!session, // Only enable the query when both entityType and session are defined
    });

    return { data, error, isLoading };
};

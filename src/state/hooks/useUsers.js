import { useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { supabase } from "configs/SupabaseConfig";

export const useUsers = (setUsers) => {
    // const { isPending, error, data } = useQuery({
    //     queryKey: ['repoData'],
    //     queryFn: async () =>
    //         await supabase.from("users").select("*"),
    // })
    useQuery({
        queryKey: ["usersr"],
        queryFn: async () => {
            const { data, error } = await supabase.from("users").select("*");
            // console.log('g', data)
            if (error) throw error;
            setUsers(data)
            return data;
        }
        //     onSuccess: (data) => {
        //         // console.log("us", data)
        //         setUsers(data);
        //     },
        //     onError: (error) => {
        //         notification.error({ message: error.message || "Failed to fetch Users" });
        //     },
    });
    // console.log("q", isPending, error, data)
};

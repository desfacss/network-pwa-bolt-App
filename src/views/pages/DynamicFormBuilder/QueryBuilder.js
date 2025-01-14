import { supabase } from "api/supabaseClient";
import React, { useState } from "react";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";


const fields = [
    { name: "id", label: "ID", type: "uuid" },
    { name: "organization_id", label: "Organization ID", type: "uuid" },
    { name: "role_type", label: "Role Type", type: "text" },
    { name: "details", label: "Details", type: "jsonb" },
    { name: "user_name", label: "User Name", type: "text" },
    { name: "z_is_manager_x", label: "Is Manager", type: "boolean" },
    { name: "is_active", label: "Is Active", type: "boolean" },
    { name: "created_at", label: "Created At", type: "datetime" },
];

export const QueryFilter = () => {
    const [query, setQuery] = useState({});
    const [data, setData] = useState([]);
    const [sqlFilter, setSqlFilter] = useState("");

    const handleFetch = async () => {
        const sqlFilter = formatQuery(query, {
            format: "sql",
            fields,
        });

        setSqlFilter(sqlFilter);

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .filter(...parseSqlToSupabase(sqlFilter));

        if (error) {
            console.error("Error fetching data:", error);
        } else {
            setData(data);
        }
    };

    const parseSqlToSupabase = (sql) => {
        // A simple parser to convert SQL-like conditions to Supabase filters.
        // Example: id = '123' -> ['id', 'eq', '123']
        const match = sql.match(/(\w+)\s*=\s*'([^']+)'/);
        return match ? [match[1], "eq", match[2]] : [];
    };

    return (
        <div>
            <h2>Query Builder</h2>
            <QueryBuilder
                fields={fields}
                query={query}
                onQueryChange={setQuery}
                controlElements={{
                    combinatorSelector: (props) => (
                        <select {...props}>
                            <option value="and">AND</option>
                            <option value="or">OR</option>
                        </select>
                    ),
                }}
            />
            <button onClick={handleFetch}>Fetch Data</button>
            <h3>SQL Filter:</h3>
            <pre>{sqlFilter}</pre>
            <h3>Results:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

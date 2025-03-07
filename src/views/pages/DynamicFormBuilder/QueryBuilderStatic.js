import { supabase } from "configs/SupabaseConfig";
import React, { useState } from "react";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

const fields = [
    { name: "id", label: "ID", type: "string" },
    { name: "organization_id", label: "Organization ID", type: "string" },
    { name: "role_type", label: "Role Type", type: "string" },
    { name: "details", label: "Details", type: "string" },
    { name: "user_name", label: "User Name", type: "string" },
    { name: "z_is_manager_x", label: "Is Manager", type: "boolean" },
    { name: "is_active", label: "Is Active", type: "boolean" },
    { name: "created_at", label: "Created At", type: "datetime" },
];

// Static data for testing
const staticData = [
    { id: "1", organization_id: "org1", role_type: "Admin", details: "Some details", user_name: "Alice", z_is_manager_x: true, is_active: true, created_at: "2025-01-01T00:00:00" },
    { id: "2", organization_id: "org2", role_type: "User", details: "Some other details", user_name: "Bob", z_is_manager_x: false, is_active: true, created_at: "2025-01-02T00:00:00" },
    { id: "3", organization_id: "org1", role_type: "User", details: "More details", user_name: "Charlie", z_is_manager_x: false, is_active: false, created_at: "2025-01-03T00:00:00" },
    { id: "4", organization_id: "org3", role_type: "Manager", details: "Manager details", user_name: "David", z_is_manager_x: true, is_active: true, created_at: "2025-01-04T00:00:00" },
];

export const QueryFilter = () => {
    const [query, setQuery] = useState({
        combinator: "and",
        rules: [
            { field: "is_active", operator: "eq", value: "true" }, // Example default filter
        ],
    });
    const [data, setData] = useState(staticData); // Initially show static data
    const [sqlFilter, setSqlFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const parseSqlToSupabase = (sql) => {
        const match = sql.match(/(\w+)\s*(=|!=|<|>|<=|>=)\s*'([^']+)'/);
        if (!match) return null;
        const [_, field, operator, value] = match;

        const operatorMap = {
            "=": "eq",
            "!=": "neq",
            "<": "lt",
            ">": "gt",
            "<=": "lte",
            ">=": "gte",
        };

        return [field, operatorMap[operator], value];
    };

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        console.log("Query state before formatting:", query);

        try {
            const sqlFilter = formatQuery(query, {
                format: "sql",
                fields,
            });

            console.log("Generated SQL filter:", sqlFilter);
            setSqlFilter(sqlFilter);

            const filters = sqlFilter
                .split(" AND ")
                .map((condition) => parseSqlToSupabase(condition.trim()))
                .filter(Boolean);  // Remove null entries

            console.log("Parsed filters:", filters);

            let filteredData = staticData; // Start with static data

            filters.forEach(([field, operator, value]) => {
                console.log(`Applying filter: ${field} ${operator} ${value}`);
                filteredData = filteredData.filter((item) => {
                    if (operator === "eq") return item[field] === value;
                    if (operator === "neq") return item[field] !== value;
                    if (operator === "lt") return item[field] < value;
                    if (operator === "gt") return item[field] > value;
                    if (operator === "lte") return item[field] <= value;
                    if (operator === "gte") return item[field] >= value;
                    return true;
                });
            });

            setData(filteredData);
        } catch (err) {
            console.error("Error during query execution:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    console.log("Fields passed to QueryBuilder:", fields);
    console.log("Query state:", query);

    return (
        <div>
            <h2>Query Builder</h2>
            <QueryBuilder
                fields={fields}
                query={query}
                onQueryChange={(newQuery) => {
                    console.log("Query updated:", newQuery);
                    setQuery(newQuery);
                }}
                controlElements={{
                    combinatorSelector: (props) => (
                        <select {...props}>
                            <option value="and">AND</option>
                            <option value="or">OR</option>
                        </select>
                    ),
                    valueEditor: (props) => {
                        console.log("Value editor props:", props);
                        if (props.fieldData?.type === "boolean") {
                            return (
                                <select {...props}>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            );
                        } else if (props.fieldData?.type === "datetime") {
                            return <input {...props} type="datetime-local" />;
                        }
                        return <input {...props} />;
                    },
                }}
            />
            <button onClick={handleFetch} disabled={loading}>
                {loading ? "Loading..." : "Fetch Data"}
            </button>
            <h3>SQL Filter:</h3>
            <pre>{sqlFilter}</pre>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <h3>Results:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

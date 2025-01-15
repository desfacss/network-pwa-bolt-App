import { supabase } from 'api/supabaseClient';
import React, { useState, useEffect } from 'react';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Function to fetch column names and data types using raw SQL
const fetchFields = async (tableName) => {
    const { data, error } = await supabase.rpc('get_columns', {
      tablename: tableName // Changed to match function definition
    });
  
    if (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  
    return data;
};

// Helper to map database type to QueryBuilder type
const mapType = (dbType) => {
    switch(dbType) {
      case 'character varying': 
      case 'text': return 'string'; // 'text' added here
      case 'timestamp with time zone': return 'datetime';
      case 'boolean': return 'boolean';
      case 'integer': return 'number';
      case 'uuid': return 'string'; // UUID treated as string for simplicity
      case 'jsonb': return 'json'; 
      default: return 'string'; // Default to string if no match
    }
};

export const QueryFilter = () => {
    const [domain, setDomain] = useState('users'); 
    const [query, setQuery] = useState({ combinator: 'and', rules: [] });
    const [data, setData] = useState([]);
    const [sqlFilter, setSqlFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fields, setFields] = useState([]);
  
    useEffect(() => {
      const loadFields = async () => {
        setLoading(true);
        try {
          const columns = await fetchFields(domain);
          const formattedFields = columns.map(col => ({
            name: col.column_name,
            label: col.column_name.replace('_', ' ').toUpperCase(),
            type: mapType(col.data_type)
          }));
          setFields(formattedFields);
        } catch (err) {
          setError("Error loading fields: " + err.message);
        } finally {
          setLoading(false);
        }
      };
      loadFields();
    }, [domain]);

    // Parse SQL string to Supabase query conditions
    // const parseSqlToSupabase = (sql) => {
    //   const match = sql.match(/(\w+)\s*(=|!=|<|>|<=|>=)\s*'([^']+)'/);
    //   if (!match) return null;
    //   const [_, field, operator, value] = match;

    //   const operatorMap = {
    //     '=': 'eq',
    //     '!=': 'neq',
    //     '<': 'lt',
    //     '>': 'gt',
    //     '<=': 'lte',
    //     '>=': 'gte',
    //   };

    //   return [field, operatorMap[operator], value];
    // };

    // const parseSqlToSupabase = (sql) => {
    //     const conditions = sql.split(' or ').map(condition => condition.trim());
    //     return conditions.map(condition => {
    //       const match = condition.match(/(\w+)\s*(=|!=|<|>|<=|>=|like)\s*'([^']+)'/);
    //       if (!match) return null;
    //       const [_, field, operator, value] = match;
      
    //       const operatorMap = {
    //         '=': 'eq',
    //         '!=': 'neq',
    //         '<': 'lt',
    //         '>': 'gt',
    //         '<=': 'lte',
    //         '>=': 'gte',
    //         'like': 'like',
    //       };
      
    //       return [field, operatorMap[operator], value];
    //     }).filter(Boolean);
    //   };

    const parseSqlToSupabase = (sql) => {
        const match = sql.match(/(\w+)\s*(=|!=|<|>|<=|>=|like|not like)\s*'([^']+)'/);
        if (!match) return null;
        const [, field, operator, value] = match;
      
        const operatorMap = {
          '=': 'eq',
          '!=': 'neq',
          '<': 'lt',
          '>': 'gt',
          '<=': 'lte',
          '>=': 'gte',
          'like': 'ilike',
          'not like': 'not.ilike', // Use 'not.ilike' for not like operation
        };
      
        return [field, operatorMap[operator], value];
      };
      
      


    // const handleFetch = async () => {
    //     setLoading(true);
    //     setError(null);
      
    //     try {
    //       const sqlFilter = formatQuery(query, {
    //         format: 'sql',
    //         fields,
    //       });
      
    //       console.log('Generated SQL filter:', sqlFilter);
    //       setSqlFilter(sqlFilter);
      
    //       const conditions = parseSqlToSupabase(sqlFilter);
      
    //       let queryBuilder = supabase.from(domain).select('*');
      
    //       // Handle OR conditions by chaining or operations
    //       conditions.forEach(([field, operator, value], index) => {
    //         if (index === 0) {
    //           queryBuilder = queryBuilder[operator](field, value);
    //         } else {
    //           queryBuilder = queryBuilder.or(`${field}.${operator}.${value}`);
    //         }
    //       });
      
    //       const { data, error } = await queryBuilder;
      
    //       if (error) {
    //         setError(error.message);
    //       } else {
    //         setData(data);
    //       }
    //     } catch (err) {
    //       setError(err.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    // const handleFetch = async () => {
    //     setLoading(true);
    //     setError(null);
      
    //     try {
    //       const sqlFilter = formatQuery(query, {
    //         format: 'sql',
    //         fields,
    //       });
      
    //       console.log('Generated SQL filter:', sqlFilter);
    //       setSqlFilter(sqlFilter);
      
    //       let queryBuilder = supabase.from(domain).select('*');
      
    //       const filterConditions = sqlFilter.split(' AND ').map((andPart) => {
    //         if (andPart.includes(' OR ')) {
    //           const orParts = andPart.split(' OR ').map((orPart) => {
    //             const parsed = parseSqlToSupabase(orPart.trim());
    //             return parsed ? `${parsed[0]}.${parsed[1]}.${parsed[2]}` : null;
    //           }).filter(Boolean).join(',');
    //           return `(${orParts})`;
    //         } else {
    //           const parsed = parseSqlToSupabase(andPart.trim());
    //           return parsed ? `${parsed[0]}.${parsed[1]}.${parsed[2]}` : null;
    //         }
    //       }).filter(Boolean).join(',');
      
    //       if (filterConditions) {
    //         queryBuilder = queryBuilder.or(filterConditions);
    //       }
      
    //       const { data, error } = await queryBuilder;
      
    //       if (error) {
    //         setError(error.message);
    //       } else {
    //         setData(data);
    //       }
    //     } catch (err) {
    //       setError(err.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
      
        try {
          const sqlFilter = formatQuery(query, {
            format: 'sql',
            fields,
          });
      
          console.log('Generated SQL filter:', sqlFilter);
          setSqlFilter(sqlFilter);
      
          let queryBuilder = supabase.from(domain).select('*');
      
          // Function to parse and apply filters
          const applyFilters = (filter) => {
            if (filter.includes(' AND ')) {
              const andParts = filter.split(' AND ').map((part) => applyFilters(part.trim()));
              return andParts.filter(Boolean).join(','); // Join with comma for Supabase OR query
            } else if (filter.includes(' OR ')) {
              const orParts = filter.split(' OR ').map((part) => applyFilters(part.trim()));
              return orParts.filter(Boolean).join(' or '); // Fix: Join using ' or ' between conditions
            } else {
              const parsed = parseSqlToSupabase(filter);
              return parsed ? `${parsed[0]}.${parsed[1]}.${parsed[2]}` : null;
            }
          };
      
          const filterConditions = applyFilters(sqlFilter);
      
          if (filterConditions) {
            queryBuilder = queryBuilder.or(filterConditions);  // Keep 'or' method as is
          }
      
          const { data, error } = await queryBuilder;
      
          if (error) {
            setError(error.message);
          } else {
            setData(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
            
      
                  
      

    // Use onUpdateValue instead of setValue
    const valueEditor = (props) => {
        const { fieldData, field, value, handleOnChange } = props;
      
        const handleLocalChange = (e) => {
          if (fieldData?.type === 'boolean') {
            handleOnChange(e.target.value === 'true');
          } else {
            handleOnChange(e.target.value);
          }
        };
      
        if (fieldData?.type === 'boolean') {
          return (
            <select value={value === true ? 'true' : 'false'} onChange={handleLocalChange}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          );
        } else if (fieldData?.type === 'datetime') {
          return <input type="datetime-local" value={value || ''} onChange={handleLocalChange} />;
        }
      
        return <input type="text" value={value || ''} onChange={handleLocalChange} />;
      };

    return (
      <div>
        <h2>Query Builder for Table: 
          <input 
            type="text" 
            value={domain} 
            onChange={(e) => { 
              setDomain(e.target.value); 
              setFields([]); 
            }} 
            placeholder="Enter table name"
          />
        </h2>
        {fields.length > 0 ? (
        //   <QueryBuilder
        //     fields={fields}
        //     query={query}
        //     onQueryChange={(newQuery) => setQuery(newQuery)}
        //     controlElements={{
        //       combinatorSelector: (props) => (
        //         <select value={props.value} onChange={(e) => props.handleOnChange(e.target.value)}>
        //           <option value="and">AND</option>
        //           <option value="or">OR</option>
        //         </select>
        //       ),
        //       valueEditor: (props) => valueEditor(props),
        //     }}
        //   />
            <QueryBuilder
                fields={fields}
                query={query}
                onQueryChange={(newQuery) => setQuery(newQuery)}
                controlElements={{
                    combinatorSelector: (props) => (
                    <select value={props.value} onChange={(e) => props.handleOnChange(e.target.value)}>
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                    </select>
                    ),
                    valueEditor: valueEditor, // Or valueEditor: (props) => valueEditor(props) if that's what you prefer
                }}
            />
        ) : loading ? (
          <p>Loading fields...</p>
        ) : (
          <p>No fields available. Please enter a valid table name.</p>
        )}
        <button onClick={handleFetch} disabled={loading || fields.length === 0}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        <h3>SQL Filter:</h3>
        <pre>{sqlFilter}</pre>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <h3>Results:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
};
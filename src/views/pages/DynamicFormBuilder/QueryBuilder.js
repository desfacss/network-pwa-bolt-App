
import { supabase } from 'api/supabaseClient'; // Ensure this is the same import you're using elsewhere
import React, { useState, useEffect } from 'react';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Function to fetch column names and data types using raw SQL
const fetchFields = async (tableName) => {
    const { data, error } = await supabase.rpc('get_table_columns', {
      tablename: tableName  // Note: Use the parameter name as defined in the function
    });
  
    if (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  
    // Since the function returns an array of objects with 'columnname', we might need to adjust this:
    return data.map(item => ({
      column_name: item.columnname,
      data_type: 'unknown' // You'll need to determine this based on your needs or modify the function to return data_type as well
    }));
  };

// Or directly with SQL, if you have the permissions:
/*
const fetchFields = async (tableName) => {
  const { data, error } = await supabase
    .rpc('execute_sql', {
      sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      params: [tableName]
    });

  if (error) {
    console.error('Error fetching columns:', error);
    return [];
  }

  return data;
};
*/

// Helper to map database type to QueryBuilder type
const mapType = (dbType) => {
    switch(dbType) {
      case 'character varying': return 'string';
      case 'timestamp with time zone': return 'datetime';
      case 'boolean': return 'boolean';
      case 'integer': return 'number';
      case 'uuid': return 'string';
      case 'jsonb': return 'json'; // Assuming JSON type for jsonb
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
  const parseSqlToSupabase = (sql) => {
    const match = sql.match(/(\w+)\s*(=|!=|<|>|<=|>=)\s*'([^']+)'/);
    if (!match) return null;
    const [_, field, operator, value] = match;

    const operatorMap = {
      '=': 'eq',
      '!=': 'neq',
      '<': 'lt',
      '>': 'gt',
      '<=': 'lte',
      '>=': 'gte',
    };

    return [field, operatorMap[operator], value];
  };

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

      const filters = sqlFilter
        .split(' AND ')
        .map((condition) => parseSqlToSupabase(condition.trim()))
        .filter(Boolean);

      let queryBuilder = supabase.from(domain).select('*');

      filters.forEach(([field, operator, value]) => {
        queryBuilder = queryBuilder[operator](field, value);
      });

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

  const valueEditor = (props) => {
    const { fieldData, field, value, setValue } = props; // Destructure setValue
  
    const handleChange = (e) => {
      if (fieldData?.type === 'boolean') {
        setValue(e.target.value === 'true');
      } else if (fieldData?.type === 'datetime') {
        setValue(e.target.value); // For datetime, you might need to parse this into a proper date object if your backend expects it in a specific format
      } else {
        setValue(e.target.value);
      }
    };
  
    if (fieldData?.type === 'boolean') {
      return (
        <select value={value === true ? 'true' : 'false'} onChange={handleChange}>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    } else if (fieldData?.type === 'datetime') {
      return <input type="datetime-local" value={value || ''} onChange={handleChange} />;
    }
  
    return <input type="text" value={value || ''} onChange={handleChange} />;
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
            // valueEditor,
            valueEditor: (props) => valueEditor(props), // Ensure props are passed
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
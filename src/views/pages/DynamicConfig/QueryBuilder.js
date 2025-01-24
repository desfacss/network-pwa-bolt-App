import React, { useState, useEffect } from 'react';
import { supabase } from 'api/supabaseClient'; // Ensure this path is correct in your project
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Developer Note: This component expects 'entityType' as a prop to fetch 
// the appropriate table's columns for query building.

const QueryBuilderComponent = ({ entityType }) => {
  // State for managing query, data, SQL filter, loading state, error, and fields
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });
  const [data, setData] = useState([]);
  const [sqlFilter, setSqlFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);

  // Developer Note: This effect runs whenever entityType changes, fetching 
  // the fields for the new table.
  useEffect(() => {
    const loadFields = async () => {
      setLoading(true);
      console.log('Starting to load fields for entityType:', entityType);

      try {
        const columns = await fetchFields(entityType);
        console.log('Columns fetched:', columns);

        const formattedFields = columns.map(col => ({
          name: col.column_name,
          label: col.column_name.replace('_', ' ').toUpperCase(),
          type: mapType(col.data_type)
        }));
        console.log('Formatted fields:', formattedFields);
        setFields(formattedFields);
      } catch (err) {
        console.error('Error loading fields:', err);
        setError("Error loading fields: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (entityType) { // Only fetch if entityType is provided
      console.log('Entity type provided, fetching fields...');
      loadFields();
    } else {
      console.log('No entity type provided, skipping field fetch.');
    }
  }, [entityType]);

  // Developer Note: Helper function to fetch column metadata from Supabase
  const fetchFields = async (tableName) => {
    console.log('Fetching fields for table:', tableName);
    const { data, error } = await supabase.rpc('get_columns', {
      tablename: tableName 
    });
  
    if (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  
    console.log('Fields data:', data);
    return data;
  };

  // Developer Note: Maps database types to QueryBuilder compatible types
  const mapType = (dbType) => {
    console.log('Mapping database type:', dbType);
    switch(dbType) {
      case 'character varying': 
      case 'text': 
        return 'string';
      case 'timestamp with time zone': 
        return 'datetime';
      case 'boolean': 
        return 'boolean';
      case 'integer': 
        return 'number';
      case 'uuid': 
        return 'string'; 
      case 'jsonb': 
        return 'json'; 
      default: 
        console.log('Defaulting to string for unknown type:', dbType);
        return 'string'; 
    }
  };

  // Developer Note: Converts SQL-like query to Supabase filter conditions
  const parseSqlToSupabase = (sql) => {
    console.log('Parsing SQL to Supabase format:', sql);
    const match = sql.match(/(\w+)\s*(=|!=|<|>|<=|>=|like|not like)\s*'([^']+)'/);
    if (!match) {
      console.warn('No match found for SQL condition:', sql);
      return null;
    }
    const [, field, operator, value] = match;
  
    const operatorMap = {
      '=': 'eq',
      '!=': 'neq',
      '<': 'lt',
      '>': 'gt',
      '<=': 'lte',
      '>=': 'gte',
      'like': 'ilike',
      'not like': 'not.ilike',
    };
  
    console.log('Parsed condition:', [field, operatorMap[operator], value]);
    return [field, operatorMap[operator], value];
  };

  // Developer Note: Handles data fetching based on the built query
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
  
      let queryBuilder = supabase.from(entityType).select('*');
  
      const applyFilters = (filter) => {
        if (filter.includes(' AND ')) {
          const andParts = filter.split(' AND ').map((part) => applyFilters(part.trim()));
          return andParts.filter(Boolean).join(','); 
        } else if (filter.includes(' OR ')) {
          const orParts = filter.split(' OR ').map((part) => applyFilters(part.trim()));
          return orParts.filter(Boolean).join(' or ');
        } else {
          const parsed = parseSqlToSupabase(filter);
          return parsed ? `${parsed[0]}.${parsed[1]}.${parsed[2]}` : null;
        }
      };
  
      const filterConditions = applyFilters(sqlFilter);
  
      if (filterConditions) {
        queryBuilder = queryBuilder.or(filterConditions);
      }
  
      const { data, error } = await queryBuilder;
  
      if (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } else {
        console.log('Data fetched successfully:', data);
        setData(data);
      }
    } catch (err) {
      console.error('Unexpected error in handleFetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Developer Note: Custom value editor for different field types
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

  // Developer Note: Render method, shows QueryBuilder when fields are loaded
  return (
    <div>
      <h2>Query Builder for Table: {entityType || 'Select a table'}</h2>
      {fields.length > 0 ? (
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={(newQuery) => {
            console.log('Query updated:', newQuery);
            setQuery(newQuery);
          }}
          controlElements={{
            combinatorSelector: (props) => (
              <select value={props.value} onChange={(e) => props.handleOnChange(e.target.value)}>
                <option value="and">AND</option>
                <option value="or">OR</option>
              </select>
            ),
            valueEditor: valueEditor,
          }}
        />
      ) : loading ? (
        <p>Loading fields...</p>
      ) : (
        <p>No fields available. Please select a valid entity type.</p>
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

export default QueryBuilderComponent;
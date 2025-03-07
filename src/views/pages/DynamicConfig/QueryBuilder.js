import React, { useState, useEffect } from 'react';
import { supabase } from 'configs/SupabaseConfig';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Developer Note: Dynamic QueryBuilder component for flexible data filtering
const QueryBuilderComponent = ({ entityType, masterObject }) => {
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });
  const [data, setData] = useState([]);
  const [sqlFilter, setSqlFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);

  // Developer Note: Advanced Supabase filtering function
  const buildSupabaseFilter = (query, fields) => {
    console.log('Building Supabase filter for query:', JSON.stringify(query, null, 2));

    const operatorMap = {
      '=': 'eq',
      '!=': 'neq',
      '<': 'lt',
      '>': 'gt',
      '<=': 'lte',
      '>=': 'gte',
      'like': 'ilike',
      'ILIKE': 'ilike',
      'not like': 'not.ilike',
    };

    const processRule = (rule) => {
      console.log('Processing individual rule:', JSON.stringify(rule, null, 2));

      const field = rule.field;
      const operator = rule.operator;
      const value = rule.value;

      // Find the field configuration
      const fieldConfig = fields.find(f => f.name === field);
      console.log('Field configuration:', fieldConfig);

      // Handle nested JSONB fields
      const parseFieldName = (fieldName) => {
        const parts = fieldName.split('.');
        if (parts.length > 1) {
          const baseField = parts[0];
          const nestedPath = parts.slice(1).join('->');
          return { baseField, nestedPath };
        }
        return { baseField: fieldName };
      };

      const { baseField, nestedPath } = parseFieldName(field);
      console.log('Parsed field:', { baseField, nestedPath });

      // Map the operator
      const mappedOperator = operatorMap[operator] || operator;
      console.log('Mapped operator:', mappedOperator);

      // Handle different field types
      if (nestedPath) {
        // JSONB nested field handling
        return nestedPath
          ? `${baseField}->>${nestedPath}.${mappedOperator}.${JSON.stringify(value)}`
          : `${baseField}.${mappedOperator}.${JSON.stringify(value)}`;
      }

      // Regular field handling
      return `${field}.${mappedOperator}.${JSON.stringify(value)}`;
    };

    const processGroup = (group) => {
      console.log('Processing query group:', JSON.stringify(group, null, 2));

      const conditions = group.rules.map(rule => {
        if (rule.rules) {
          // Recursive processing for nested groups
          return processGroup(rule);
        }
        return processRule(rule);
      });

      // Join conditions based on the group combinator
      const combinator = group.combinator === 'and'
        ? '(' + conditions.join(',') + ')'
        : conditions.join(',');

      console.log('Processed group conditions:', combinator);
      return combinator;
    };

    // Process the entire query
    return processGroup(query);
  };

  // Developer Note: Map database types and handle foreign keys
  const mapType = (dbType, item) => {
    console.log('Mapping database type:', dbType, 'Item:', item);

    if (item && item.foreign_key) {
      return 'select';
    }

    switch (dbType) {
      case 'bigint':
      case 'integer':
        return 'number';
      case 'character varying':
      case 'text':
      case 'uuid':
        return 'string';
      case 'timestamp with time zone':
        return 'datetime';
      case 'boolean':
        return 'boolean';
      case 'jsonb':
        return 'json';
      case 'ARRAY':
        return 'array';
      default:
        console.log('Defaulting to string for unknown type:', dbType);
        return 'string';
    }
  };

  // Developer Note: Initialize fields based on master object
  useEffect(() => {
    const loadFields = async () => {
      console.log('Starting to load fields for entityType:', entityType);
      setLoading(true);

      try {
        const columns = masterObject;
        console.log('Master Object:', columns);

        const formattedFields = columns.map(col => ({
          name: col.key,
          label: col.key.replace('_', ' ').toUpperCase(),
          type: mapType(col.type, col),
          values: col.foreign_key ? [] : undefined,
          inputType: col.foreign_key ? 'select' : undefined
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

    if (entityType) {
      console.log('Entity type provided, fetching fields...');
      loadFields();
    } else {
      console.log('No entity type provided, skipping field fetch.');
    }
  }, [entityType, masterObject]);

  // Developer Note: Fetch data based on constructed query
  const handleFetch = async () => {
    console.log('Starting data fetch with query:', JSON.stringify(query, null, 2));
    setLoading(true);
    setError(null);

    try {
      // Generate the Supabase filter string
      const filterConditions = buildSupabaseFilter(query, fields);
      console.log('Generated Supabase filter conditions:', filterConditions);

      // Construct the query
      let queryBuilder = supabase.from(entityType).select('*');

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

  // Developer Note: Custom value editor for dynamic dropdowns
  const DynamicSelect = ({ foreignKeyConfig, value, onChange }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
      const fetchOptions = async () => {
        try {
          console.log('Fetching options for:', foreignKeyConfig.source_table);
          const { data, error } = await supabase
            .from(foreignKeyConfig.source_table)
            .select(`${foreignKeyConfig.source_column}, ${foreignKeyConfig.display_column}`)
            .order(foreignKeyConfig.display_column, { ascending: true });

          if (error) throw error;

          setOptions(data.map(item => ({
            value: item[foreignKeyConfig.source_column],
            label: item[foreignKeyConfig.display_column]
          })));
        } catch (err) {
          console.error('Failed to fetch options:', err);
        }
      };
      fetchOptions();
    }, [foreignKeyConfig]);

    return (
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  };

  // Developer Note: Generic value editor with type-based rendering
  const valueEditor = (props) => {
    const { fieldData, field, value, handleOnChange } = props;
    const item = masterObject.find(item => item.key === fieldData.name);

    console.log('Rendering value editor for:', fieldData, 'Item:', item);

    if (item && item.foreign_key) {
      return (
        <DynamicSelect
          foreignKeyConfig={item.foreign_key}
          value={value}
          onChange={handleOnChange}
        />
      );
    } else if (fieldData.type === 'boolean') {
      return (
        <select value={value === true ? 'true' : 'false'} onChange={(e) => handleOnChange(e.target.value === 'true')}>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    } else if (fieldData.type === 'datetime') {
      return <input type="datetime-local" value={value || ''} onChange={(e) => handleOnChange(e.target.value)} />;
    }

    return <input type="text" value={value || ''} onChange={(e) => handleOnChange(e.target.value)} />;
  };

  // Developer Note: Main render method
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
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>Fetched Results:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

// Future Enhancements:
// - Implement caching for foreign key dropdown options to reduce API calls.
// - Add debounce for dropdown selection to reduce API calls on frequent changes.
// - Support for more complex query conditions like nested fields or array elements.

// Performance Issues:
// - Frequent API calls for each foreign key dropdown might lead to performance issues in large applications. Consider memoizing or caching results.
// - If `masterObject` changes often, consider optimizing the useEffect dependency array or splitting out the field setup logic.

export default QueryBuilderComponent;
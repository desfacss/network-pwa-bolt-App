import React, { useState, useEffect } from 'react';
import { Tabs, Button, message, Select } from 'antd';
import Form from '@rjsf/antd';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from 'configs/SupabaseConfig'; // Import Supabase client
import TableViewConfig from './TableViewConfig'; // Import the TableViewConfig component

const { TabPane } = Tabs;
const { Option } = Select;

const YViewConfigManager = () => {
  const [configs, setConfigs] = useState([]); // All rows from y_view_config
  const [selectedConfig, setSelectedConfig] = useState(null); // Current row to edit or add
  const [activeTab, setActiveTab] = useState('tableview'); // Active tab
  const [dropdownOptions, setDropdownOptions] = useState([]); // Dropdown options for db_table_name
  const [selectedRow, setSelectedRow] = useState(null); // Selected row from dropdown
  const [availableColumns, setAvailableColumns] = useState([]); // Available columns for the selected table

  useEffect(() => {
    // Fetch existing configurations
    const fetchConfigs = async () => {
      const { data, error } = await supabase.from('y_view_config').select('*');
      if (error) {
        message.error('Failed to fetch configurations');
      } else {
        setConfigs(data);
      }
    };

    fetchConfigs();
  }, []);

  useEffect(() => {
    // Fetch table names in public schema
    const fetchTables = async () => {
      const { data, error } = await supabase.rpc('get_public_tables'); // Assume a stored procedure exists
      if (error) {
        message.error('Failed to fetch table names');
      } else {
        setDropdownOptions(data);
      }
    };

    fetchTables();
  }, []);

  // Updated useEffect for fetching columns based on selectedConfig
  useEffect(() => {
    // Fetch columns from the selected table name
    const fetchColumns = async (tableName) => {
      try {
        if (!tableName) {
          console.warn("No table name provided.");
          return;
        }

        // Log the table name that is being passed
        console.log("Fetching columns for table:", tableName);

        // Call the RPC function
        const { data, error } = await supabase.rpc('get_table_columns', {
          tablename: tableName,
        });

        // If there was an error in the RPC function call
        if (error) {
          console.error("Error Fetching Columns:", error);
          message.error(`Failed to fetch columns for ${tableName}`);
          throw error;
        }

        // Log the data returned from the RPC function
        console.log("Fetched Columns:", data);

        // Update state with the fetched columns or an empty array if no data is returned
        setAvailableColumns(data || []);
      } catch (err) {
        console.error("Error Fetching Columns:", err);
        message.error('Failed to fetch table columns');
      }
    };

    // Check if the selectedConfig and db_table_name are available
    if (selectedConfig?.db_table_name) {
      console.log("Table name from selectedConfig:", selectedConfig.db_table_name);
      fetchColumns(selectedConfig.db_table_name);
    } else {
      console.warn("No db_table_name found in selectedConfig");
    }
  }, [selectedConfig]); // Re-run when selectedConfig changes

  const handleSave = async (viewName, formData) => {
    try {
      const updatedConfig = {
        ...selectedConfig,
        [viewName]: formData,
        id: selectedConfig?.id || uuidv4(),
      };

      if (selectedConfig?.id) {
        // Update existing row
        const { error } = await supabase
          .from('y_view_config')
          .update(updatedConfig)
          .eq('id', selectedConfig.id);

        if (error) throw error;
        message.success('Configuration updated successfully');
      } else {
        // Insert new row
        const { error } = await supabase.from('y_view_config').insert([updatedConfig]);
        if (error) throw error;
        message.success('Configuration added successfully');
      }

      setSelectedConfig(null); // Reset selection
      setActiveTab('tableview');
    } catch (error) {
      message.error('Failed to save configuration');
    }
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setActiveTab('tableview');
  };

  const renderTabContent = (viewName) => {
    const schema: RJSFSchema = selectedConfig?.data_schema || {};
    const uiSchema = selectedConfig?.ui_schema || {};
    const formData = selectedConfig?.[viewName] || {};

    if (viewName === 'tableview') {
      return (
        <TableViewConfig
          configData={formData}
          availableColumns={availableColumns} // Pass dynamically fetched columns
          onSave={(updatedData) => handleSave(viewName, updatedData)}
        />
      );
    }

    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        onSubmit={({ formData }) => handleSave(viewName, formData)}
      >
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>View Config Manager</h1>
      <div style={{ marginBottom: '20px' }}>
        <Select
          placeholder="Select existing row"
          style={{ width: '60%', marginRight: '10px' }}
          onChange={async (value) => {
            console.log("Dropdown value selected:", value); // Log the selected value from the dropdown

            const selectedConfig = configs.find((config) => config.id === value);
            console.log("Selected Config Object:", selectedConfig); // Log the matching config object

            setSelectedRow(value);
            setSelectedConfig(selectedConfig || null);

            // Check if the selected config has a valid table name
            if (selectedConfig?.db_table_name) {
              console.log("Table Name from Config:", selectedConfig.db_table_name); // Log the table name

              try {
                // Call the RPC function to fetch table columns
                // const { data, error } = await supabase.rpc('get_table_columns', {
                //   table_name: selectedConfig.db_table_name, // Ensure correct parameter name
                // });

                console.log("Calling RPC to fetch table columns for:", selectedConfig.db_table_name);

const { data, error } = await supabase.rpc('get_table_columns', {
  tablename: selectedConfig.db_table_name
});

console.log("RPC call completed. Data received:", data);
if (error) {
  console.error("Error fetching table columns:", error);
} else {
  console.log("Successfully fetched table columns:", data);
}
                  

                // Log the results of the RPC call
                if (error) {
                  console.error("RPC Error Details:", error); // Log detailed RPC error
                  throw error;
                }

                console.log("Fetched Columns Data:", data); // Log the returned columns
                setAvailableColumns(data || []);
              } catch (err) {
                console.error("Caught Error in Fetching Columns:", err); // Log any caught error
                message.error('Failed to fetch table columns');
              }
            } else {
              console.warn("No Table Name Found in Selected Config"); // Log if no table name is present
            }
          }}
          value={selectedRow}
        >
          {configs.map((config) => (
            <Option key={config.id} value={config.id}>
              {config.db_table_name}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          onClick={() => {
            setSelectedRow(null);
            setSelectedConfig({});
            setAvailableColumns([]); // Reset available columns when adding new
          }}
        >
          Add New Configuration
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Table View" key="tableview">
          {renderTabContent('tableview')}
        </TabPane>
        <TabPane tab="Grid View" key="gridview">
          {renderTabContent('gridview')}
        </TabPane>
        <TabPane tab="Gantt View" key="ganttview">
          {renderTabContent('ganttview')}
        </TabPane>
        <TabPane tab="Kanban View" key="kanbanview">
          {renderTabContent('kanbanview')}
        </TabPane>
        <TabPane tab="Form View" key="formview">
          {renderTabContent('formview')}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default YViewConfigManager;

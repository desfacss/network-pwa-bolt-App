import React, { useState, useEffect } from 'react';
import { Tabs, Button, message, Select, Input } from 'antd';
import Form from '@rjsf/antd';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from 'configs/SupabaseConfig'; // Import Supabase client
import TableViewConfig from './TableViewConfig'; // Import the TableViewConfig component
// import CrudTableConfig from './FormSchema';
// import Status from './Status';
import CrudTableConfig from './Forms';
import MasterObject from './MasterObject';
import QueryBuilderComponent from './QueryBuilder';
import FormBuilder from '../DynamicFormBuilder';
import ConfigEditor from './Detailview';
import GridViewConfig from './GridViewConfig';
import DynamicViews from '../DynamicViews';

const { TabPane } = Tabs;
const { Option } = Select;

const YViewConfigManager = () => {
  const [configs, setConfigs] = useState([]); // All rows from y_view_config
  const [selectedConfig, setSelectedConfig] = useState(null); // Current row to edit or add
  const [workflowConfigurations, setWorkflowConfigurations] = useState([]);
  const [selectedWorkflowConfiguration, setSelectedWorkflowConfiguration] = useState(null);
  const [activeTab, setActiveTab] = useState('master_object'); // Active tab
  const [dropdownOptions, setDropdownOptions] = useState([]); // Dropdown options for entity_type
  const [selectedRow, setSelectedRow] = useState(null); // Selected row from dropdown
  const [availableColumns, setAvailableColumns] = useState([]); // Available columns for the selected table

  // Fetch existing configurations
  const fetchConfigs = async () => {
    const { data, error } = await supabase.from('y_view_config').select('*');
    if (error) {
      message.error(error?.message || 'Failed to fetch configurations');
    } else {
      console.log("YC", data)
      setConfigs(data);
      if (selectedConfig) {
        setSelectedConfig(data?.find(item => item?.id === selectedConfig?.id))
      }
    }
  };

  const fetchWorkflowConfigurations = async () => {
    const { data, error } = await supabase.from('workflow_configurations').select('*');
    if (error) {
      message.error(error?.message || 'Failed to fetch Workflow Configurations');
    } else {
      console.log("WC", data)
      setWorkflowConfigurations(data);
    }
  };
  useEffect(() => {

    fetchConfigs();
    fetchWorkflowConfigurations()
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
        // Instead of this rpc, pass the actual + related data to get the column names 
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

    // Check if the selectedConfig and entity_type are available
    if (selectedConfig?.entity_type) {
      console.log("Table name from selectedConfig:", selectedConfig.entity_type);
      fetchColumns(selectedConfig.entity_type);
    } else {
      console.warn("No Entity Type found in selectedConfig");
    }
  }, [selectedConfig]); // Re-run when selectedConfig changes

  useEffect(() => {
    // console.log("Selected config:", selectedConfig);
    handleFetchTable()
  }, [selectedRow])
  useEffect(() => {
    console.log("Selected config t:", selectedConfig?.master_object);
  }, [selectedConfig])

  const handleSave = async (viewName, formData) => {
    // console.log("grt", formData);
    // const enable_view = formData?.showFeatures?.includes('enable_view')
    // formData.showFeatures = formData?.showFeatures?.filter(e => e !== 'enable_view')
    try {
      const updatedConfig = {
        ...selectedConfig,
        [viewName]: formData,
        // views_config: {
        //   ...selectedConfig.views_config,
        //   [viewName]: enable_view
        // },
        // id: selectedConfig?.id || uuidv4(),
      };

      if (selectedConfig?.id) {
        // Update existing row
        const { error } = await supabase
          .from('y_view_config')
          .update(updatedConfig)
          .eq('id', selectedConfig.id);

        if (error) throw error;
        message.success('Configuration updated successfully');
        fetchConfigs();
      } else {
        // Insert new row
        const { error } = await supabase.from('y_view_config').insert([updatedConfig]);
        if (error) throw error;
        message.success('Configuration added successfully');
      }

      // setSelectedConfig(null); // Reset selection
      // setActiveTab('tableview');
    } catch (error) {
      message.error('Failed to save configuration');
    }
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setActiveTab('tableview');
  };

  const renderTabContent = (viewName) => {
    const schema: RJSFSchema = selectedConfig?.master_data_schema || {};
    const uiSchema = selectedConfig?.ui_schema || {};
    const formData = selectedConfig?.[viewName] || {};
    // // console.log("ij", configs[0])
    // const config = selectedConfig ? selectedConfig : configs && configs[0]
    // const data = config && Object.entries(config?.data_schema?.properties)?.map(([fieldName, fieldData], index) => ({
    //   columnname: fieldName,
    // }))
    // Improved null/undefined handling:
    const configDataSchemaProperties = selectedConfig?.data_schema?.properties;

    const data = configDataSchemaProperties && Object.entries(configDataSchemaProperties)?.map(([fieldName, fieldData], index) => ({
      columnname: fieldName,
    })) || []; // Provide a default empty array

    if (viewName === 'tableview') {
      return (
        <TableViewConfig
          configData={formData}
          availableColumns={data || availableColumns} // Pass dynamically fetched columns
          onSave={(updatedData) => handleSave(viewName, updatedData)}
          masterObject={selectedConfig?.master_object}
        />
      );
    }
    if (viewName === 'gridview') {
      return (
        <GridViewConfig
          configData={formData}
          availableColumns={data || availableColumns} // Pass dynamically fetched columns
          onSave={(updatedData) => handleSave(viewName, updatedData)}
          masterObject={selectedConfig?.master_object}
        />
      );
    }
    if (viewName === 'detailview') {
      return (
        <ConfigEditor
          // configData={formData}
          // availableColumns={data || availableColumns} // Pass dynamically fetched columns
          onSave={(updatedData) => handleSave(viewName, updatedData)}
          // masterObject={selectedConfig?.master_object}
          detailView={selectedConfig?.detailview} entityType={selectedConfig?.entity_type}
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

  const handleFetchTable = async () => {
    try {
      const { data, error } = await supabase.from('y_view_config').select('*').eq('entity_type', selectedRow);
      if (error) {
        message.error(error?.message || 'Failed to fetch configurations');
      } else {
        if (data.length > 0) {
          setSelectedConfig(data[0]);
          setSelectedWorkflowConfiguration(workflowConfigurations.find(config => config.name === data[0].entity_type) || null);
        } else {
          setSelectedConfig({ entity_type: selectedRow }); // New configuration for a new table
          setSelectedWorkflowConfiguration(null);
        }
      }
    } catch (err) {
      console.error("Error Fetching Config:", err);
      message.error('An error occurred while fetching the configuration');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>View Config Manager</h1>
      <div style={{ marginBottom: '20px' }}>
        <Input
          placeholder="Enter table name"
          style={{ width: '60%', marginRight: '10px' }}
          value={selectedRow}
          onChange={(e) => setSelectedRow(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleFetchTable}
        >
          Fetch
        </Button>
        <Select
          placeholder="Select existing row"
          style={{ width: '60%', marginRight: '10px' }}
          onChange={async (value) => {
            console.log("Dropdown value selected:", value); // Log the selected value from the dropdown

            const selectedConfig = configs?.find((config) => config?.id === value);
            const selectedWorkflowConfiguration = workflowConfigurations?.find((config) => config?.name === selectedConfig?.entity_type);
            console.log("Selected Config Object:", selectedConfig, selectedWorkflowConfiguration); // Log the matching config object

            setSelectedRow(value);
            setSelectedConfig(selectedConfig || null);
            setSelectedWorkflowConfiguration(selectedWorkflowConfiguration || null);

            // Check if the selected config has a valid table name
            if (selectedConfig?.entity_type) {
              console.log("Table Name from Config:", selectedConfig.entity_type)

              try {
                // Call the RPC function to fetch table columns
                // const { data, error } = await supabase.rpc('get_table_columns', {
                //   table_name: selectedConfig.entity_type/ Ensure correct parameter name
                // });

                console.log("Calling RPC to fetch table columns for:", selectedConfig.entity_type);

                const { data, error } = await supabase.rpc('get_table_columns', {
                  tablename: selectedConfig.entity_type
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
            <Option key={config.id} value={config.entity_type}>
              {config.entity_type}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          onClick={() => {
            setSelectedRow(null);
            setSelectedConfig({});
            setSelectedWorkflowConfiguration({});
            setAvailableColumns([]); // Reset available columns when adding new
          }}
        >
          Add New
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Master object" key="master_object">
          <MasterObject entityType={selectedRow} masterObjectInit={selectedConfig?.master_object} fetchConfigs={fetchConfigs} />
        </TabPane>
        <TabPane tab="Query Builder" key="query_builder">
          <QueryBuilderComponent entityType={selectedRow} masterObject={selectedConfig?.master_object} />
        </TabPane>
        <TabPane tab="Form Builder" key="form_builder">
          <FormBuilder masterObjectInit={selectedConfig?.master_object} />
        </TabPane>
        {/* <TabPane tab="Fields" key="fields">
          <CrudTableConfig jsonSchema={selectedConfig?.master_data_schema || {}} onSave={handleSave} />
          <CrudTableConfig initialData={selectedConfig?.form_schema || {}}
            onSave={(updatedData) => {
              const updatedConfig = { ...selectedConfig, form_schema: updatedData };
              handleSave('form_schema', updatedData);
            }} />
        </TabPane> */}
        <TabPane tab="Table View" key="tableview">
          {selectedConfig && activeTab === "tableview" && renderTabContent('tableview')}
        </TabPane>
        <TabPane tab="Grid View" key="gridview">
          {selectedConfig && activeTab === "gridview" && renderTabContent('gridview')}
        </TabPane>
        <TabPane tab="Detail View" key="detail_view">
          {selectedConfig && activeTab === "detail_view" && renderTabContent('detailview')}
        </TabPane>
        <TabPane tab="View" key="view">
          {activeTab === 'view' && activeTab === "view" && <DynamicViews entityType={selectedConfig?.entity_type} />}
        </TabPane>
        {/* <TabPane tab="Kanban View" key="kanbanview">
          {renderTabContent('kanbanview')}
        </TabPane>
        <TabPane tab="Grid View" key="gridview">
          {renderTabContent('gridview')}
        </TabPane>
        <TabPane tab="Gantt View" key="ganttview">
          {renderTabContent('ganttview')}
        </TabPane>
        <TabPane tab="Form View" key="formview">
          {renderTabContent('formview')}
        </TabPane> */}
        {/* <TabPane tab="Type" key="type">
          <Status />
        </TabPane> */}
        {/* <TabPane tab="Status rules" key="status_rules">
          <Status />
        </TabPane> */}
      </Tabs>
    </div>
  );
};

export default YViewConfigManager;

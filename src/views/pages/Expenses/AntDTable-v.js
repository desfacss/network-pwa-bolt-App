import React, { useState } from 'react';
import { Table, Input, Button, Select } from 'antd';
// import 'antd/dist/antd.css';  // Import Ant Design styles

const { Option } = Select;

const projectOptions = ['Project A', 'Project B', 'Project C'];

const Timesheet = () => {
  const [projects, setProjects] = useState(['Proj1', 'Proj2', 'Proj3']);
  const [dataSource, setDataSource] = useState([
    { date: 'Oct 14', key: 'Oct 14' },
    { date: 'Oct 15', key: 'Oct 15' },
    { date: 'Oct 16', key: 'Oct 16' },
    { date: 'Oct 17', key: 'Oct 17' },
    { date: 'Oct 18', key: 'Oct 18' },
    { date: 'Oct 19', key: 'Oct 19' },
    { date: 'Oct 20', key: 'Oct 20' },
  ]);

  // Add a new project column
  const addNewProject = () => {
    const newProject = `Proj${projects.length + 1}`;
    setProjects([...projects, newProject]);
  };

  // Generate columns dynamically based on the projects and include dropdowns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
    },
    ...projects.map((project, index) => ({
      title: (
        <Select defaultValue={projectOptions[index % projectOptions.length]} style={{ width: 120 }}>
          {projectOptions.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      ),
      dataIndex: project,
      key: project,
      render: (_, record) => (
        <Input
          type="number"
          value={record[project] || ''}
          onChange={e => handleInputChange(e, record.key, project)}
        />
      ),
    })),
    {
      title: ' Daily Total',
      key: 'total',
      render: (_, record) => calculateTotalHours(record),
    }
  ];

  // Calculate total hours for each day (row)
  const calculateTotalHours = (record) => {
    return projects.reduce((sum, project) => sum + (parseFloat(record[project]) || 0), 0);
  };

  // Handle input change for hours input
  const handleInputChange = (e, date, project) => {
    const value = e.target.value;
    setDataSource(prevData =>
      prevData.map(item =>
        item.key === date ? { ...item, [project]: value } : item
      )
    );
  };

  // Calculate the total hours for each project (column)
  const calculateColumnTotal = (project) => {
    return dataSource.reduce((sum, record) => sum + (parseFloat(record[project]) || 0), 0);
  };

  return (
    <div>
      <Button type="primary" onClick={addNewProject} style={{ marginBottom: 16 }}>
        Add Project Column
      </Button>
      <Table
        columns={columns}
        dataSource={[...dataSource]}
        pagination={false}
        summary={pageData => {
          return (
            <>
              {/* First Summary Row - Project Total */}
              <Table.Summary.Row>
                <Table.Summary.Cell>
                  <strong>Project Total</strong>
                </Table.Summary.Cell>
                {projects.map((project, index) => (
                  <Table.Summary.Cell key={index}>
                    {calculateColumnTotal(project)}
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell>
                  {/* Total hours for all projects across all days */}
                  {dataSource.reduce((total, record) => total + calculateTotalHours(record), 0)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
  
              {/* Second Summary Row - Balance Hours */}
              <Table.Summary.Row>
                <Table.Summary.Cell>
                  <strong>Balance Hours</strong>
                </Table.Summary.Cell>
                {projects.map((project, index) => (
                  <Table.Summary.Cell key={index}>
                    {/* {calculateBalanceHours(project)} */}
                    100
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell className="sticky-right">
                  {/* Total balance hours for all projects */}
                  {/* {dataSource.reduce((total, record) => total + calculateBalance(record), 0)} */}
                  {/* 20 */}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    </div>
  );
  
};

export default Timesheet;

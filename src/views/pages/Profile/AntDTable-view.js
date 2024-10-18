import React from 'react';
import { Table } from 'antd';
// import 'antd/dist/antd.css';  // Import Ant Design styles
import './Tableview.css';  // Custom styles for vertical text alignment

const ViewOnlyTimesheet = () => {
  // Sample data for the week
  const dataSource = [
    { date: 'Oct 14', Proj1: 2, Proj2: 4, Proj3: 3, description: 'Worked on initial setup' },
    { date: 'Oct 15', Proj1: 5, Proj2: 1, Proj3: 2, description: 'Code implementation' },
    { date: 'Oct 16', Proj1: 3, Proj2: 5, Proj3: 4, description: 'Client meeting and fixes' },
    { date: 'Oct 17', Proj1: 4, Proj2: 2, Proj3: 6, description: 'Test case preparation' },
    { date: 'Oct 18', Proj1: 7, Proj2: 3, Proj3: 2, description: 'Bug fixing and testing' },
    { date: 'Oct 19', Proj1: 6, Proj2: 4, Proj3: 1, description: 'Documentation updates' },
    { date: 'Oct 20', Proj1: 4, Proj2: 6, Proj3: 3, description: 'Final deployment review' },
  ];

  // Static columns with vertical header alignment and a description column
  const columns = [
    {
      title:  <div className="vertical-header">Date</div>,
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      align: 'center',
    },
    {
      title: <div className="vertical-header">Proj1</div>,
      dataIndex: 'Proj1',
      key: 'Proj1',
      align: 'center',
    },
    {
      title: <div className="vertical-header">Proj2</div>,
      dataIndex: 'Proj2',
      key: 'Proj2',
      align: 'center',
    },
    {
      title: <div className="vertical-header">Proj3</div>,
      dataIndex: 'Proj3',
      key: 'Proj3',
      align: 'center',
    },
    {
      title: <div className="vertical-header">Daily Total</div>,
      key: 'total',
      align: 'center',
      fixed: 'right',
      render: (_, record) => calculateTotalHours(record),
    },
    {
      title: <div className="vertical-header">Description</div>,
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      fixed: 'right',
      width: 'max-content',  // Takes up the maximum available space
    },
  ];

  // Function to calculate total hours for each day
  const calculateTotalHours = (record) => {
    return (parseFloat(record.Proj1) || 0) + (parseFloat(record.Proj2) || 0) + (parseFloat(record.Proj3) || 0);
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
};

export default ViewOnlyTimesheet;

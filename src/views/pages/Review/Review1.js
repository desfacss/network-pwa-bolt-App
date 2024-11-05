import React, { useEffect, useState } from 'react';
import { Button, Col, Input, message, Modal, Row, Select, Table } from 'antd';
// import 'antd/dist/antd.css';  // Import Ant Design styles
import './Tableview.css';  // Custom styles for vertical text alignment
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { useSelector } from 'react-redux';
import { supabase } from 'configs/SupabaseConfig';
import { WarningOutlined } from '@ant-design/icons';
// import { sendEmail } from 'components/common/SendEmail';
const { Option } = Select;

const Review1 = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [disabled, setDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
  const [existingTimesheet, setExistingTimesheet] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [timeSheetData, setTimeSheetData] = useState();
  const [hideNext, SetHideNext] = useState(true);
  const [isApproveModal, setIsApproveModal] = useState(false);
  const [isRejectModal, setIsRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeesId, setSelectedEmployeeId] = useState();
  const [columns, setColumns] = useState([]);
  const { session } = useSelector((state) => state.auth);

  const checkExistingTimesheet = async () => {
    if (!selectedEmployeesId) {
      // message.error('User is not authenticated.');
      return;
    }

    const { data, error } = await supabase
      .from('x_timesheet_3')
      .select('*')
      .eq('user_id', selectedEmployeesId)
      .eq('timesheet_date', currentDate.toISOString())
      .eq('timesheet_type', viewMode);

    if (error) {
      console.log('Error fetching timesheet:', error.message);
      setExistingTimesheet(null);
      setTimeSheetData();
    } else if (data && data.length > 0 && data[0]?.status !== 'Draft') {
      console.log('Existing timesheet:', data[0]);
      // setDataSource(data[0]?.details);
      setExistingTimesheet(data[0]);
      setDisabled(!['Submitted'].includes(data[0]?.status));
      const timesheetDetails = data[0]?.details;

      if (timesheetDetails) {
        const newDataSource = timesheetDetails.map(entry => {
          const dailyEntries = entry.dailyEntries;
          const projects = Object.entries(dailyEntries).map(([projectName, { hours, description }]) => ({
            date: entry.date,
            projectName: projectName,
            hours: hours,
            description: description
          }));
          return projects;
        }).flat();

        setTimeSheetData(newDataSource);


        const { columns, dataSource } = getDynamicColumnsAndDataSource(timesheetDetails);
        setColumns(columns); // Store columns in state if needed
        console.log("formatted Data", dataSource)
        setTimeSheetData(dataSource);

      }

      // if (timesheetDetails) {
      //   // Initialize an object to hold date entries
      //   const dateMap = {};

      //   // Populate the dateMap with project details grouped by date
      //   timesheetDetails.forEach((entry) => {
      //     if (entry.dailyEntries) {
      //       Object.entries(entry.dailyEntries).forEach(([date, { hours, description }]) => {
      //         if (!dateMap[date]) {
      //           dateMap[date] = {
      //             title: date,
      //             key: date,
      //             children: []
      //           };
      //         }
      //         // Push project details into the respective date's children
      //         dateMap[date].children.push({
      //           title: `${entry.project} - ${hours} hours - ${description}`,
      //           key: `${entry.key}-${date}-child`
      //         });
      //       });
      //     } else {
      //       console.warn(`dailyEntries is missing for entry with key: ${entry.key}`);
      //     }
      //   });

      //   // Convert the dateMap object to an array for tree data
      //   const treeData = Object.values(dateMap);
      //   setTimeSheetData(treeData);
      // }
    } else {
      console.log('No existing timesheet found');
      setExistingTimesheet();
      setTimeSheetData();
      setDisabled(true)
    }
  };

  const getEmployees = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*')
      if (error) {
        throw error;
      }
      // console.log("em", data)
      setEmployees(data)
      // return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      // return null;
    }
  }

  useEffect(() => {
    // const employeesData = getEmployees();
    // console.log("E", employeesData)
    // setEmployees(employeesData)
    getEmployees()
    checkExistingTimesheet();
    setDisabled(isTimesheetDisabled(viewMode, currentDate));
    SetHideNext(isHideNext(currentDate));
  }, [currentDate, viewMode, selectedEmployeesId]);

  // Sample data for the week
  // const dataSource = [
  //   { date: 'Oct 14', Proj1: 2, Proj2: 4, Proj3: 3, description: 'Worked on initial setup' },
  //   { date: 'Oct 15', Proj1: 5, Proj2: 1, Proj3: 2, description: 'Code implementation' },
  //   { date: 'Oct 16', Proj1: 3, Proj2: 5, Proj3: 4, description: 'Client meeting and fixes' },
  //   { date: 'Oct 17', Proj1: 4, Proj2: 2, Proj3: 6, description: 'Test case preparation' },
  //   { date: 'Oct 18', Proj1: 7, Proj2: 3, Proj3: 2, description: 'Bug fixing and testing' },
  //   { date: 'Oct 19', Proj1: 6, Proj2: 4, Proj3: 1, description: 'Documentation updates' },
  //   { date: 'Oct 20', Proj1: 4, Proj2: 6, Proj3: 3, description: 'Final deployment review' },
  // ];

  const getDynamicColumnsAndDataSource = (timesheetData) => {
    // Extract project names from dailyEntries
    const projectNames = new Set();

    timesheetData.forEach(detail => {
      Object.keys(detail.dailyEntries).forEach(project => {
        projectNames.add(project);
      });
    });

    const columns = [
      {
        title: <div className="vertical-header">Date</div>,
        dataIndex: 'date',
        key: 'date',
        fixed: 'left',
        align: 'center',
      },
      ...Array.from(projectNames).map(project => ({
        title: <div className="vertical-header">{project}</div>,
        dataIndex: project,
        key: project,
        align: 'center',
        render: (_, record) => record[project]?.hours || '0',
      })),
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
        width: 'max-content',
      },
    ];

    const dataSource = timesheetData.map(detail => ({
      date: detail.date,
      ...Object.entries(detail.dailyEntries).reduce((acc, [project, entry]) => {
        acc[project] = { hours: entry.hours, description: entry.description };
        return acc;
      }, {}),
      description: Object.entries(detail.dailyEntries).map(([project, entry]) => entry.description).join(', '), // Concatenate descriptions
    }));

    return { columns, dataSource };
  };


  // Static columns with vertical header alignment and a description column
  // const columns = [
  //   {
  //     title: <div className="vertical-header">Date</div>,
  //     dataIndex: 'date',
  //     key: 'date',
  //     fixed: 'left',
  //     align: 'center',
  //   },
  //   {
  //     title: <div className="vertical-header">Proj1</div>,
  //     dataIndex: 'Proj1',
  //     key: 'Proj1',
  //     align: 'center',
  //   },
  //   {
  //     title: <div className="vertical-header">Proj2</div>,
  //     dataIndex: 'Proj2',
  //     key: 'Proj2',
  //     align: 'center',
  //   },
  //   {
  //     title: <div className="vertical-header">Proj3</div>,
  //     dataIndex: 'Proj3',
  //     key: 'Proj3',
  //     align: 'center',
  //   },
  //   {
  //     title: <div className="vertical-header">Daily Total</div>,
  //     key: 'total',
  //     align: 'center',
  //     fixed: 'right',
  //     render: (_, record) => calculateTotalHours(record),
  //   },
  //   {
  //     title: <div className="vertical-header">Description</div>,
  //     dataIndex: 'description',
  //     key: 'description',
  //     align: 'left',
  //     fixed: 'right',
  //     width: 'max-content',  // Takes up the maximum available space
  //   },
  // ];

  // // Function to calculate total hours for each day
  // const calculateTotalHours = (record) => {
  //   return (parseFloat(record.Proj1) || 0) + (parseFloat(record.Proj2) || 0) + (parseFloat(record.Proj3) || 0);
  // };

  const calculateTotalHours = (record) => {
    // Extracting project keys dynamically (excluding 'date' and 'description')
    return Object.keys(record).reduce((total, key) => {
      if (key !== 'date' && key !== 'description') {
        total += parseFloat(record[key]?.hours) || 0; // Summing up hours for each project
      }
      return total;
    }, 0);
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
    setCurrentDate(newDate);
  };

  const newfunction = async (status) => {
    // if (!session?.user?.id) {
    //   message.error('User is not authenticated.');
    //   return;
    // }

    // const timesheetData = {
    //   user_id: session.user.id,
    //   details: dataSource,
    //   status,
    //   timesheet_date: currentDate,
    //   timesheet_type: viewMode,
    //   approver: null,
    //   submitted_time: currentDate,
    // };

    // let result;
    // console.log(currentDate, timesheetData);

    // if (existingTimesheetId) {
    //     // Update the existing timesheet
    //     console.log("update", existingTimesheetId);
    //     result = await supabase
    //         .from('x_timesheet_3')
    //         .update(timesheetData)
    //         .eq('id', existingTimesheetId);
    // } else {
    //     console.log("create");
    //     // Insert a new timesheet
    //     result = await supabase
    //         .from('x_timesheet_3')
    //         .insert([timesheetData]);
    // }

    // const { data, error } = result;

    // if (error) {
    //     message.error(`Failed to submit timesheet: ${error.message}`);
    // } else {
    //     message.success('Timesheet submitted successfully.');
    //     console.log('Submitted data:', data);
    //     if (data?.length > 0) {
    //         setExistingTimesheetId(data[0].id); // Update the ID in case of new insertion
    //     }
    // }
  };

  useEffect(() => {
    (employees && !selectedEmployeesId) && setSelectedEmployeeId(employees[employees?.length - 1]?.id)
  }, [employees])
  const handleSubmit = async () => {
    const { data, error } = await supabase.from('x_timesheet_3').update({ status: isApproveModal ? "Approved" : "Rejected" }).eq('id', existingTimesheet.id);
    if (error) {
      console.error('Error updating status:', error);
      message.error(`Error updating status: ${error}`);
    } else {
      console.log('Status updated successfully:', data);
      // sendEmail()
      if (isApproveModal) {
        setIsApproveModal(false);
      } else {
        setIsRejectModal(false);
        setRejectComment('');
      }
      checkExistingTimesheet()
      message.success(`${isApproveModal ? "Approved" : "Rejected"} successfully`);
    }
    // Add your approve logic here
  };

  const handleCancel = () => {
    setIsApproveModal(false);
    setIsRejectModal(false);
    setRejectComment('');
  };

  return (
    <div>
      {(isApproveModal || isRejectModal) &&
        <Modal
          title={"Confirm " + (isApproveModal ? "Approval" : "Rejection")}
          visible={isApproveModal || isRejectModal}
          onOk={handleSubmit}
          onCancel={handleCancel}
        >
          <p>{`Are you sure you want to ${isApproveModal ? "Approve" : "Reject"}?`}</p>
          {isRejectModal && <Input.TextArea
            rows={4}
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Please provide a reason for rejection"
          />}
        </Modal>
      }
      <Row justify="space-between" align="middle">
        {/* Left-aligned section */}
        <Col>
          {/* <Select
            className="ml-2"
            value={viewMode}
            onChange={handleViewModeChange}
            options={[
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
            ]}
          /> */}
          {employees && <Select showSearch placeholder="Select a Employee" value={selectedEmployeesId} onChange={(e) => setSelectedEmployeeId(e)}
          // loading={loading} notFoundContent={loading ? <Spin size="small" /> : 'No users found'} style={{ width: 200 }}
          >
            {employees.length > 0 && employees?.map(user => (
              <Option key={user?.id} value={user?.id}>
                {user?.user_name || 'Unnamed User'}
              </Option>
            ))}
          </Select>}
        </Col>

        {/* Center-aligned section */}
        <Col>
          <Button onClick={() => setCurrentDate(goToPrevious(viewMode, currentDate))}>Previous</Button>
          <label className="ml-2 mr-2">{formatDate(currentDate)}</label>
          {!hideNext && (
            <Button onClick={() => setCurrentDate(goToNext(viewMode, currentDate))}>Next</Button>
          )}
        </Col>

        {/* Right-aligned section */}
        {disabled ? <div style={{ width: 200 }}>{existingTimesheet?.status}</div> :
          timeSheetData ? <Col>
            <Button type="primary" className="mr-2" onClick={() => setIsApproveModal(true)}>Approve</Button>
            <Button type="primary" onClick={() => setIsRejectModal(true)} >Reject</Button>
          </Col> : <div style={{ width: 200 }}></div>}
      </Row>
      {timeSheetData ? <Table
        columns={columns}
        // dataSource={dataSource}
        dataSource={timeSheetData}
        pagination={false}
        locale={{ emptyText: 'No data available , Check for different employee or date' }}
      /> : <div className='pt-5' style={{ fontSize: 16 }}><WarningOutlined style={{ color: 'orange' }} /> No data available , Check for different employee or date</div>}
    </div>
  );
};

export default Review1;

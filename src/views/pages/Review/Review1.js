import React, { useEffect, useState } from 'react';
import { Button, Col, Input, message, Modal, Row, Select, Table } from 'antd';
// import 'antd/dist/antd.css';  // Import Ant Design styles
import './Tableview.css';  // Custom styles for vertical text alignment
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { useSelector } from 'react-redux';
import { supabase } from 'configs/SupabaseConfig';
const { Option } = Select;

const Review = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [disabled, setDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
  const [existingTimesheetId, setExistingTimesheetId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [timesheetData, setTimeSheetData] = useState();
  const [hideNext, SetHideNext] = useState(true);
  const [isApproveModal, setIsApproveModal] = useState(false);
  const [isRejectModal, setIsRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeesId, setSelectedEmployeeId] = useState();

  const { session } = useSelector((state) => state.auth);

  const checkExistingTimesheet = async () => {
    if (!selectedEmployeesId) {
      // message.error('User is not authenticated.');
      return;
    }

    const { data, error } = await supabase
      .from('x_timesheet_duplicate')
      .select('*')
      .eq('user_id', selectedEmployeesId)
      .eq('timesheet_date', currentDate.toISOString())
      .eq('timesheet_type', viewMode);

    if (error) {
      console.log('Error fetching timesheet:', error.message);
      setExistingTimesheetId(null);
    } else if (data && data.length > 0) {
      console.log('Existing timesheet:', data[0]);
      // setDataSource(data[0]?.details);
      setExistingTimesheetId(data[0]?.id);
      setDisabled(['Approved'].includes(data[0]?.status));
      const timesheetDetails = data[0]?.details;
      if (timesheetDetails) {
        // Initialize an object to hold date entries
        const dateMap = {};

        // Populate the dateMap with project details grouped by date
        timesheetDetails.forEach((entry) => {
          if (entry.dailyEntries) {
            Object.entries(entry.dailyEntries).forEach(([date, { hours, description }]) => {
              if (!dateMap[date]) {
                dateMap[date] = {
                  title: date,
                  key: date,
                  children: []
                };
              }
              // Push project details into the respective date's children
              dateMap[date].children.push({
                title: `${entry.project} - ${hours} hours - ${description}`,
                key: `${entry.key}-${date}-child`
              });
            });
          } else {
            console.warn(`dailyEntries is missing for entry with key: ${entry.key}`);
          }
        });

        // Convert the dateMap object to an array for tree data
        const treeData = Object.values(dateMap);
        setTimeSheetData(treeData);
      }
    } else {
      console.log('No existing timesheet found');
      setExistingTimesheetId(null);
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
      title: <div className="vertical-header">Date</div>,
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
    //         .from('x_timesheet_duplicate')
    //         .update(timesheetData)
    //         .eq('id', existingTimesheetId);
    // } else {
    //     console.log("create");
    //     // Insert a new timesheet
    //     result = await supabase
    //         .from('x_timesheet_duplicate')
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

  const handleSubmit = () => {
    if (isApproveModal) {
      setIsApproveModal(false);
    } else {
      setIsRejectModal(false);
      setRejectComment('');
    }
    message.success(`${isApproveModal ? "Approved" : "Rejected"} successfully`);
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
          {/* <Button onClick={addNewProject}>Add New Project</Button> */}
          <Select
            className="ml-2"
            value={viewMode}
            onChange={handleViewModeChange}
            options={[
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
            ]}
          />
          {employees && <Select showSearch placeholder="Select a Employee" onChange={(e) => setSelectedEmployeeId(e)}
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
        <Col>
          <Button type="primary" className="mr-2" onClick={() => setIsApproveModal(true)}>Approve</Button>
          <Button type="primary" onClick={() => setIsRejectModal(true)} >Reject</Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
};

export default Review;

import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Select, message, Row, Col, notification } from 'antd';
import { useSelector } from 'react-redux';
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';
// import 'antd/dist/antd.css';  // Import Ant Design styles

const { Option } = Select;

const projectOptions = ['Project A', 'Project B', 'Project C'];

const Timesheet = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [disabled, setDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
  const [existingTimesheetId, setExistingTimesheetId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [timesheetData, setTimeSheetData] = useState();
  const [hideNext, SetHideNext] = useState(true);

  const { session } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]
    // ['Proj1', 'Proj2', 'Proj3']
  );
  const [dataSource, setDataSource] = useState(
    []
    // { date: 'Oct 14', key: 'Oct 14' },
    // { date: 'Oct 15', key: 'Oct 15' },
    // { date: 'Oct 16', key: 'Oct 16' },
    // { date: 'Oct 17', key: 'Oct 17' },
    // { date: 'Oct 18', key: 'Oct 18' },
    // { date: 'Oct 19', key: 'Oct 19' },
    // { date: 'Oct 20', key: 'Oct 20' },
  );

  const fetchProjects = async () => {
    let { data, error } = await supabase.from('projects').select('*');
    if (data) {
      console.log("projects", data)
      setProjects(data);  // .map(project => project.project_name)
    }
    if (error) {
      notification.error({ message: "Failed to fetch projects" });
    }
  };

  const checkExistingTimesheet = async () => {
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }
    const { data, error } = await supabase
      .from('x_timesheet_duplicate')
      .select('*')
      .eq('user_id', session.user.id)
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
  const handleProjectChange = (projectName) => {
    const newRows = generateRows(projectName);
    setDataSource(newRows);
  };
  const generateRows = (projectName) => {
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

    return Array.from({ length: rowCount }, (_, dayIndex) => {
      const dateValue = formatDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex)
      );

      return {
        key: dateValue,
        date: dateValue,
        dailyEntries: {
          [projectName]: {
            hours: 0,
            description: "",
          }
        }
      };
    });
  };

  // const generateRows = (projectName) => {
  //   const startDate = new Date(currentDate);
  //   const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  //   const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

  //   return Array.from({ length: rowCount }, (_, dayIndex) => {
  //     const dateValue = formatDate(
  //       new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex)
  //     );

  //     return {
  //       key: `${dayIndex + 1}`, // Change the key generation as needed
  //       project: projectName,
  //       balanceHours: 0, // Set balanceHours to a default value
  //       date: dateValue,
  //       dailyEntries: {
  //         [projectName]: {
  //           hours: 0,
  //           description: "",
  //         }
  //       }
  //     };
  //   });
  // };

  useEffect(() => {
    fetchProjects();
    checkExistingTimesheet();
    setDisabled(isTimesheetDisabled(viewMode, currentDate));
    SetHideNext(isHideNext(currentDate));
  }, [currentDate, viewMode]);

  // Add a new project column
  const addNewProject = () => {
    // const newProject = `Proj${projects.length + 1}`;
    const newProject = projects[0];
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
        <Select defaultValue={projects[index % projects?.length]} style={{ width: 120 }} onChange={handleProjectChange}>
          {projects?.map(option => (
            <Option key={option?.project_name} value={option?.project_name}>{option?.project_name}</Option>
          ))}
        </Select>
      ),
      dataIndex: project?.project_name,
      key: project?.project_name,
      render: (_, record) => (
        <div>
          <Input
            type="number"
            placeholder="Hours"
            value={record.dailyEntries?.[project?.project_name]?.hours || ''}
            onChange={e => handleInputChange(e.target.value, record.date, project?.project_name, 'hours')}
            disabled={disabled}
          />
          <Input
            type="text"
            placeholder="Description"
            value={record.dailyEntries?.[project?.project_name]?.description || ''}
            onChange={e => handleInputChange(e.target.value, record.date, project?.project_name, 'description')}
            disabled={disabled}
            style={{ marginTop: '4px' }}
          />
        </div>
      ),
    })),
    {
      title: 'Daily Total',
      key: 'total',
      render: (_, record) => {
        return projects.reduce((sum, project) => sum + (parseFloat(record.dailyEntries?.[project]?.hours) || 0), 0);
      },
    },
  ];

  // Calculate total hours for each day (row)
  const calculateTotalHours = (record) => {
    return projects.reduce((sum, project) => sum + (parseFloat(record[project]) || 0), 0);
  };

  // // Handle input change for hours input
  // const handleInputChange = (e, date, project) => {
  //   const value = e.target.value;
  //   setDataSource(prevData =>
  //     prevData.map(item =>
  //       item.key === date ? { ...item, [project]: value } : item
  //     )
  //   );
  // };
  const handleInputChange = (value, date, project, field) => {
    setDataSource(prevData =>
      prevData.map(item =>
        item.key === date
          ? {
            ...item,
            dailyEntries: {
              ...item.dailyEntries,
              [project]: {
                ...item.dailyEntries[project],
                [field]: value,
              },
            },
          }
          : item
      )
    );
  };

  // const handleInputChange = (value, date, project, field) => {
  //   setDataSource(prevData =>
  //     prevData.map(item =>
  //       item.key === date
  //         ? {
  //           ...item,
  //           dailyEntries: {
  //             ...item.dailyEntries,
  //             [project]: {
  //               ...item.dailyEntries[project],
  //               [field]: value, // Update the specific field with the new value
  //             },
  //           },
  //         }
  //         : item // Return the item unchanged if the key does not match
  //     )
  //   );
  // };

  // Calculate the total hours for each project (column)
  const calculateColumnTotal = (project) => {
    return dataSource.reduce((sum, record) => sum + (parseFloat(record[project]) || 0), 0);
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
    setCurrentDate(newDate);
  };

  const handleSubmit = async (status) => {
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }

    const timesheetData = {
      user_id: session.user.id,
      details: dataSource,
      status,
      timesheet_date: currentDate,
      timesheet_type: viewMode,
      approver: null,
      submitted_time: currentDate,
    };

    let result;
    console.log(dataSource, currentDate, timesheetData);
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

  return (
    <div>
      {/* <Button onClick={addNewProject}>Add New Project</Button>
      <Select
        value={viewMode}
        onChange={handleViewModeChange}
        options={[
          { label: 'Weekly', value: 'Weekly' },
          { label: 'Monthly', value: 'Monthly' },
        ]}
      />
      <Button onClick={() => setCurrentDate(goToPrevious(viewMode, currentDate))}>Previous</Button>
      <label className='ml-2 mr-2'>{formatDate(currentDate)}</label>
      {!hideNext && <Button onClick={() => setCurrentDate(goToNext(viewMode, currentDate))}>Next</Button>}
      <Button type="primary" onClick={handleSubmit}>Save</Button>
      <Button type="primary" onClick={handleSubmit}>Submit</Button> */}
      <Row justify="space-between" align="middle">
        {/* Left-aligned section */}
        <Col>
          <Button onClick={addNewProject}>Add New Project</Button>
          <Select
            className="ml-2"
            value={viewMode}
            onChange={handleViewModeChange}
            options={[
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
            ]}
          />
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
          <Button type="primary" onClick={() => handleSubmit("Draft")} className="mr-2">Save</Button>
          <Button type="primary" onClick={() => handleSubmit("Submitted")}>Submit</Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        // dataSource={Object.keys(dataSource)?.map(date => ({ date, ...dataSource[date] }))}
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

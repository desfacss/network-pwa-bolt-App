import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Select, message, Row, Col, notification, Card, Drawer } from 'antd';
import { useSelector } from 'react-redux';
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';
import MyTimesheetTable from './MyTimesheetTable';

const { Option } = Select;

const Timesheet = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [disabled, setDisabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
  const [existingTimesheetId, setExistingTimesheetId] = useState(null);
  const [hideNext, setHideNext] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectData, setProjectData] = useState({});
  const [selectedProjectColumns, setSelectedProjectColumns] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [defaultData, setDefaultData] = useState();

  const { session } = useSelector((state) => state.auth);

  const { timesheet_settings } = session?.user?.location

  // Function to open the drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // Function to close the drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
    setProjectData()
    setSelectedProjectColumns(defaultData)
    // form.resetFields();
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('x_projects').select('*')
      .or(`project_users.cs.{${session?.user?.id}},is_static.eq.true`)
    // .contains('project_users', [session?.user?.id]);
    if (data) {
      setProjects(data);
      console.log("T", data.slice(0, 2))

      // Automatically initialize project columns and data
      const projectColumns = {};
      const projectDataMap = {};
      data.forEach((project) => {
        projectColumns[project.id] = project?.id;
        projectDataMap[project.id] = generateRows(project.id);
      });
      const firstKey = Object.keys(projectColumns)[0];
      // Get the first key-value pair
      const firstObject = { [firstKey]: firstKey };
      console.log("TT", projectColumns, projectDataMap, firstObject)
      setDefaultData(firstObject)
      setSelectedProjectColumns(firstObject);
      setProjectData(projectDataMap);
    } else {
      notification.error({ message: 'Failed to fetch projects' });
    }
  };

  const checkExistingTimesheet = async () => {
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }

    const { data, error } = await supabase
      .from('x_timesheet_3')
      .select('*')
      .eq('user_id', session?.user?.id)
      .eq('timesheet_date', currentDate.toISOString())
      .eq('timesheet_type', viewMode);

    if (error) {
      console.error('Error fetching timesheet:', error.message);
      setExistingTimesheetId(null);
    } else if (data && data.length > 0) {
      const timesheetDetails = data[0]?.details || [];
      const projectDataMap = {};

      // Transform timesheetDetails to the structure needed for the table
      timesheetDetails.forEach((day) => {
        const date = day.date;
        const dailyEntries = day.dailyEntries;

        // For each project, initialize the array if not present, and push the day entry
        Object.keys(dailyEntries).forEach((projectName) => {
          if (!projectDataMap[projectName]) {
            projectDataMap[projectName] = [];
          }

          // Push the formatted data for each project
          projectDataMap[projectName].push({
            key: date,
            date: date,
            dailyEntries: {
              [projectName]: {
                hours: dailyEntries[projectName]?.hours || '0',
                description: dailyEntries[projectName]?.description || '',
              },
            },
          });
        });
      });
      // console.log("Existing Data", projectDataMap, projectData)
      const columns = Object.keys(projectDataMap).reduce((acc, id) => {
        acc[id] = id;
        return acc;
      }, {});
      setSelectedProjectColumns(columns)
      setProjectData(projectDataMap);
      setExistingTimesheetId(data[0]?.id);
      setDisabled(['Approved'].includes(data[0]?.status));
    } else {
      setExistingTimesheetId(null);
    }
  };


  const handleSubmit = async (status) => {
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }


    const timesheetDetails = generateRows(selectedProjectColumns[0]).map(day => {
      const dailyEntry = {
        key: day.key,
        date: day.date,
        dailyEntries: {},
      };

      // const filteredData = Object.fromEntries(
      //   Object.entries(projectData).filter(([id, entries]) =>
      //     entries.some(entry =>
      //       entry.dailyEntries[id].hours !== "0"
      //     )
      //   )
      // );

      const filteredData = Object.fromEntries(
        Object.entries(projectData).filter(([id, entries]) =>
          entries.some(entry =>
            entry?.dailyEntries[id]?.hours && Number(entry.dailyEntries[id]?.hours) > 0
          )
        )
      );

      // // Fill in the daily entries for each project
      // for (let projectName of Object.keys(projectData)) {
      //   dailyEntry.dailyEntries[projectName] = {
      //     hours: projectData[projectName]?.find(entry => entry?.key === day?.key)?.dailyEntries[projectName]?.hours || '0',
      //     description: projectData[projectName]?.find(entry => entry?.key === day?.key)?.dailyEntries[projectName]?.description || '',
      //   };
      // }

      // Fill in the daily entries for each project
      for (let projectName of Object.keys(filteredData)) {
        const hours = filteredData[projectName]?.find(entry => entry?.key === day?.key)?.dailyEntries[projectName]?.hours || '0'
        dailyEntry.dailyEntries[projectName] = {
          hours: hours,
          description: (hours && hours !== '0') ? filteredData[projectName]?.find(entry => entry?.key === day?.key)?.dailyEntries[projectName]?.description || '' : '',
        };
      }
      console.log("PU", filteredData)

      return dailyEntry;
    });

    const today = new Date();
    const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 3)));


    const timesheetPayload = {
      user_id: session.user.id,
      timesheet_date: currentDate.toISOString(),
      timesheet_type: viewMode,
      status,
      details: timesheetDetails,
      approver_id: session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover]?.id,
      last_date: lastDate.toISOString()
    };

    console.log("Payload", timesheetDetails)
    try {
      if (existingTimesheetId) {
        // Update existing timesheet
        const { error } = await supabase
          .from('x_timesheet_3')
          .update(timesheetPayload)
          .eq('id', existingTimesheetId);

        if (error) throw error;
        message.success('Timesheet updated successfully.');
      } else {
        // Insert new timesheet
        const { error } = await supabase
          .from('x_timesheet_3')
          .insert(timesheetPayload);

        if (error) throw error;
        message.success('Timesheet submitted successfully.');
        // form.resetFields();
        setProjectData()
        closeDrawer()
      }

      // Refetch the timesheet data after submission
      checkExistingTimesheet();
    } catch (error) {
      message.error(`Error submitting timesheet: ${error.message}`);
    }
  };

  // Generate rows only for a specific project
  const generateRows = (projectName) => {
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

    const newRows = Array.from({ length: rowCount }, (_, dayIndex) => {
      const dateValue = formatDate(
        new Date(currentDate?.getFullYear(), currentDate?.getMonth(), currentDate?.getDate() + dayIndex)
      );

      const existingRow = projectData && projectData[projectName]?.find(row => row.key === dateValue);

      return existingRow
        ? { ...existingRow }
        : {
          key: dateValue,
          date: dateValue,
          dailyEntries: {
            [projectName]: { hours: 0, description: "" },
          },
        };
    });

    return newRows;
  };


  // Function to get the list of available projects for selection
  const getAvailableProjects = () => {
    const selectedProjects = Object.values(selectedProjectColumns);
    return projects.map((project) => ({
      ...project,
      disabled: selectedProjects.includes(project.id),
    }));
  };


  const addNewProject = () => {
    // Find the first project that is not selected
    const unselectedProjects = projects.filter(
      (project) => !Object.values(selectedProjectColumns).includes(project.id)
    );

    if (unselectedProjects.length > 0) {
      const newProject = unselectedProjects[0];
      const newProjectIndex = Object.keys(selectedProjectColumns)?.length;
      console.log("D", selectedProjectColumns, projectData, newProjectIndex)
      setSelectedProjectColumns((prevState) => ({
        ...prevState,
        // [newProjectIndex]: newProject.id,
        [newProject?.id]: newProject?.id,
      }));

      setProjectData((prevData) => ({
        ...prevData,
        [newProject?.id]: generateRows(newProject?.id),
      }));
    } else {
      notification.warning({ message: 'No more projects available to add.' });
    }
  };

  const handleProjectChange = (projectName, columnIndex) => {
    setSelectedProjectColumns((prevState) => ({
      ...prevState,
      [columnIndex]: projectName,
    }));

    if (!projectData[projectName]) {
      setProjectData((prevData) => ({
        ...prevData,
        [projectName]: generateRows(projectName),
      }));
    }
  };

  const handleInputChange = (inputValue, date, project, field) => {
    const hours = field === 'hours' ? Number(inputValue.trim().replace(".", "")) : 0
    const value = field === 'hours' ? (hours > 0 ? Math.round(hours) : 0) : inputValue;
    // console.log("first", inputValue)
    setProjectData(prevData => ({
      ...prevData,
      [project]: prevData[project]?.map(item =>
        item?.key === date
          ? {
            ...item,
            dailyEntries: {
              ...item?.dailyEntries,
              [project]: {
                ...item?.dailyEntries[project],
                [field]: value,
              },
            },
          }
          : item
      ),
    }));
    console.log("second", projectData)
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
    setCurrentDate(newDate);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
    },
    ...Object.keys(selectedProjectColumns)?.map((columnIndex) => {
      const projectName = selectedProjectColumns[columnIndex];
      return {
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select defaultValue={projectName} style={{ width: '100%' }} onChange={(value) => handleProjectChange(value, columnIndex)} >
              {getAvailableProjects()?.map((option) => (
                <Option key={option?.id} value={option?.id} disabled={option?.disabled}>
                  {option?.project_name}
                </Option>
              ))}
            </Select>
            <Button type="link" style={{ marginLeft: 8 }} onClick={() => handleRemoveProject(columnIndex)} >
              X
            </Button>
          </div>
        ),
        dataIndex: projectName,
        key: projectName,
        render: (_, record) => (
          <div>
            <Input
              type="number"
              placeholder="Hours" min={0} precision={0}
              value={record?.dailyEntries[projectName]?.hours}
              onChange={(e) => handleInputChange(e?.target?.value, record?.date, projectName, 'hours')}
              disabled={disabled}
              style={{ width: '100%' }}
            />
            <Input
              type="text"
              placeholder="Description"
              value={record?.dailyEntries[projectName]?.description}
              onChange={(e) => handleInputChange(e?.target?.value, record?.date, projectName, 'description')}
              disabled={disabled}
              style={{ marginTop: '4px', width: '100%' }}
            />
          </div>
        ),
      };
    }),
    {
      title: 'Daily Total',
      key: 'total',
      fixed: 'right',
      render: (_, record) => {
        var dailyTotal = projects?.reduce((sum, project) => sum + (parseFloat(record.dailyEntries?.[project.id]?.hours) || 0), 0)
        // var invalid=dailyTotal > 10 || dailyTotal<8
        console.log("first", timesheet_settings?.workingHours?.standardDailyHours)
        var invalid = dailyTotal > (timesheet_settings?.workingHours?.standardDailyHours + timesheet_settings?.overtimeTracking?.maxOvertimeHours || 8)
        var warning = dailyTotal > (timesheet_settings?.workingHours?.standardDailyHours || 8)
        if (invalid) {
          setSubmitDisabled(true)
        }
        return (
          <div style={{ color: ((warning && !invalid) ? 'gold' : ((invalid) && 'red')) }}>
            {dailyTotal}
          </div>);
      },
    },
  ];

  useEffect(() => {
    fetchProjects();
    checkExistingTimesheet();
    setDisabled(isTimesheetDisabled(viewMode, currentDate));
    setHideNext(isHideNext(currentDate));
  }, [currentDate, viewMode]);

  const handleRemoveProject = (columnIndex) => {
    // Create a copy of selectedProjectColumns and projectData
    const newSelectedColumns = { ...selectedProjectColumns };
    const projectNameToRemove = newSelectedColumns[columnIndex];
    delete newSelectedColumns[columnIndex];

    const newProjectData = { ...projectData };
    delete newProjectData[projectNameToRemove];

    // Update the state with the new values
    setSelectedProjectColumns(newSelectedColumns);
    setProjectData(newProjectData);
  };

  console.log("G", projectData, generateRows(Object.keys(selectedProjectColumns)))

  const generateAllRows = () => {
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

    // Create a map to accumulate rows by date
    const rowsMap = {};

    // Iterate over each selected project to generate rows
    Object.values(selectedProjectColumns).forEach((projectName) => {
      const projectRows = generateRows(projectName);

      projectRows.forEach((row) => {
        if (!rowsMap[row?.key]) {
          // If row doesn't exist for the date, create a new entry
          rowsMap[row.key] = {
            key: row?.key,
            date: row?.date,
            dailyEntries: {},
          };
        }

        // Merge project data into the existing entry for that date
        rowsMap[row?.key].dailyEntries[projectName] = row?.dailyEntries[projectName];
      });
    });

    // Convert rows map to an array for the table data source
    return Object.values(rowsMap);
  };

  // Add the summary to display the project-wise total at the bottom of the table
  const getSummary = () => {
    const projectTotals = {};
    setSubmitDisabled(false)
    // Calculate totals for each project
    projectData && Object.keys(projectData)?.forEach((projectName) => {
      projectTotals[projectName] = projectData && projectData[projectName]?.reduce(
        (sum, entry) => sum + (parseFloat(entry?.dailyEntries[projectName]?.hours) || 0),
        0
      );
    });

    // const { balance, total } = calculateBalanceHours(projectName, projectTotals)

    return (
      <Table.Summary>
        <Table.Summary.Row>
          <Table.Summary.Cell fixed="left">Project Total</Table.Summary.Cell>
          {Object.keys(selectedProjectColumns).map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            return (
              <Table.Summary.Cell key={projectName}>
                {projectTotals[projectName] || 0}
              </Table.Summary.Cell>
            );
          })}
          <Table.Summary.Cell>
            {Object.values(projectTotals).reduce((total, value) => total + value, 0)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
        <Table.Summary.Row>
          <Table.Summary.Cell fixed="left">Balance Hours</Table.Summary.Cell>
          {Object.keys(selectedProjectColumns)?.map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            const { balance, total, color } = calculateBalanceHours(projectName, projectTotals)
            console.log(color)
            return (
              <Table.Summary.Cell key={projectName} style={{ backgroundColor: color }}>
                {/* {calculateBalanceHours(projectName, projectTotals)} */}
                <div style={{ color }}>
                  {total ? `${balance} of ${total}` : ''}
                </div>
              </Table.Summary.Cell>
            );
          })}
          <Table.Summary.Cell>
            {/* {Object.values(projectTotals).reduce((total, value) => total + value, 0)} */}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const calculateBalanceHours = (projectName, projectTotals) => {
    const project = projects.find((p) => p.id === projectName);
    console.log("YR", project, projectName, projectTotals)
    if (!project || !project?.details?.project_users) return 0;

    const userDetails = project?.details?.project_users?.find(user => user.user_id === session?.user?.id);
    if (!userDetails) return 0;

    const allocatedHours = parseInt(userDetails?.allocated_hours, 10) || 0;
    const expensedHours = parseInt(userDetails?.expensed_hours, 10) || 0;

    var color = null
    var balance = allocatedHours - expensedHours - projectTotals[projectName]

    if (balance <= ((100 - timesheet_settings?.workingHours?.projectFinalHours) / 100) * allocatedHours) {
      color = 'gold'
    }
    if (balance < 0) {
      color = 'red'
      setSubmitDisabled(true)
    }
    return { balance, total: allocatedHours, color }
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} style={{ marginBottom: 16 }}>
        Add Timesheet
      </Button>
      <MyTimesheetTable />
      {(drawerVisible && selectedProjectColumns) && <Drawer
        title="Add Timesheet"
        width={'100%'}
        onClose={closeDrawer}
        visible={drawerVisible}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Button onClick={addNewProject}>Add New Project</Button>
            {/* <Select defaultValue={viewMode} style={{ width: 120 }} onChange={handleViewModeChange}>
            <Option value="Weekly">Weekly</Option>
            <Option value="Monthly">Monthly</Option>
          </Select> */}
          </Col>
          <Col>
            <Button onClick={() => setCurrentDate(goToPrevious(viewMode, currentDate))}>Previous</Button>
            <span className='m-2'>{currentDate.toDateString()}</span>
            <Button onClick={() => setCurrentDate(goToNext(viewMode, currentDate))} disabled={hideNext}>Next</Button>
          </Col>
          <Col>
            <Button onClick={() => handleSubmit('Draft')} disabled={submitDisabled}>Save</Button>
            <Button onClick={() => handleSubmit('Submitted')} disabled={submitDisabled}>Submit</Button>
          </Col>
        </Row>

        {/* <Table columns={columns} dataSource={generateRows(Object.keys(selectedProjectColumns)[0])} pagination={false} /> */}
        <Table columns={columns} dataSource={generateAllRows()} pagination={false}
          summary={getSummary}
        // <>{getSummary}{renderBalanceHoursSummary}</>}
        />
      </Drawer>}
    </>
  );
};

export default Timesheet;

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Table, Input, Button, Select, message, Row, Col, notification, Card, Drawer, Modal, Spin, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';
// import MyTimesheetTable from './MyTimesheetTable';
import { EditFilled, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import './Tableview.css';
import TimesheetInstructions from './TimesheetInstructions';

const { confirm } = Modal;
const { Option } = Select;

const Timesheet = forwardRef(({ startDate, endDate }, ref) => {

  useImperativeHandle(ref, () => ({
    showDrawer,
  }));

  const [viewMode, setViewMode] = useState('Weekly');
  const [approvedTimeSheet, setApprovedTimeSheet] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));
  const [existingTimesheetId, setExistingTimesheetId] = useState(null);
  const [hideNext, setHideNext] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectData, setProjectData] = useState({});
  const [selectedProjectColumns, setSelectedProjectColumns] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState();
  const [defaultData, setDefaultData] = useState();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState();
  // const [timesheetToDelete, setTimesheetToDelete] = useState();

  const { session } = useSelector((state) => state.auth);

  const { timesheet_settings } = session?.user?.organization

  useEffect(() => {
    if (startDate && endDate) {
      fetchTimesheets()
    }
  }, [startDate, endDate])

  // Function to open the drawer
  const showDrawer = () => {
    setCurrentDate(getMonday(new Date()))
    setDrawerVisible(true);
  };

  // Function to close the drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
    setProjectData()
    setSelectedProjectColumns(defaultColumn)
    // form.resetFields();
  };

  // Fetch timesheet data from your backend
  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('timesheet')
        .select('*')
        .eq('user_id', session?.user?.id)
        .gte('timesheet_date', startDate)
        .lte('timesheet_date', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        throw error;
      }

      setTimesheets(data);
    } catch (error) {
      message.error('Failed to load timesheet data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    // const { data, error } = await supabase.from('projects').select('*')
    // .or(`project_users.cs.{${session?.user?.id}},project_users.is.null`)
    // .neq('is_closed', true)
    // .order('is_non_project', { ascending: true })  // is_non_project=false rows come first
    // .order('project_name', { ascending: true });

    const { data, error } = await supabase.rpc('get_projects_with_allocation', { userid: session?.user?.id })


    // .contains('project_users', [session?.user?.id]);
    if (data) {
      setProjects(data);
      console.log("TE", data)

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
      // console.log("TT", projectColumns, projectDataMap, firstObject)
      setDefaultColumn(firstObject)
      // setDefaultData(projectDataMap)
      setDefaultData(data)
      setSelectedProjectColumns(firstObject);
      setProjectData(projectDataMap);
    } else {
      notification.error({ message: error?.message || 'Failed to fetch projects' });
    }
  };

  const setCurrentTimesheet = (data) => {
    // console.log("edit", data)
    // console.log("CET")
    const timesheetDetails = data?.details || [];
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
              hours: Number(dailyEntries[projectName]?.hours) || '0',
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
    // console.log("IT", data?.id, data?.status, columns, projectDataMap)
    setSelectedProjectColumns(columns)
    setProjectData(projectDataMap);
    setExistingTimesheetId(data?.id);
    setApprovedTimeSheet(['Approved'].includes(data?.status));
  }

  const checkExistingTimesheet = async () => {
    setLoading(true);
    // console.log("CET")
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }

    const { data, error } = await supabase
      .from('timesheet')
      .select('*')
      .eq('user_id', session?.user?.id)
      .eq('timesheet_date', currentDate.toISOString())
      .eq('timesheet_type', viewMode);

    if (error) {
      console.error('Error fetching timesheet:', error.message);
      // console.log("CET-E")
      setExistingTimesheetId(null);
    } else if (data && data.length > 0) {
      // console.log("CET-D")
      setCurrentTimesheet(data[0])

      // const timesheetDetails = data[0]?.details || [];
      // const projectDataMap = {};

      // // Transform timesheetDetails to the structure needed for the table
      // timesheetDetails.forEach((day) => {
      //   const date = day.date;
      //   const dailyEntries = day.dailyEntries;

      //   // For each project, initialize the array if not present, and push the day entry
      //   Object.keys(dailyEntries).forEach((projectName) => {
      //     if (!projectDataMap[projectName]) {
      //       projectDataMap[projectName] = [];
      //     }

      //     // Push the formatted data for each project
      //     projectDataMap[projectName].push({
      //       key: date,
      //       date: date,
      //       dailyEntries: {
      //         [projectName]: {
      //           hours: dailyEntries[projectName]?.hours || '0',
      //           description: dailyEntries[projectName]?.description || '',
      //         },
      //       },
      //     });
      //   });
      // });
      // // console.log("Existing Data", projectDataMap, projectData)
      // const columns = Object.keys(projectDataMap).reduce((acc, id) => {
      //   acc[id] = id;
      //   return acc;
      // }, {});
      // setSelectedProjectColumns(columns)
      // setProjectData(projectDataMap);
      // setExistingTimesheetId(data[0]?.id);
      // setDisabled(['Approved'].includes(data[0]?.status));


    } else {
      setExistingTimesheetId(null);
      // console.log("CET-N")
      setSelectedProjectColumns(defaultColumn)
      const projectDataMap = {};
      defaultData?.forEach((project) => {
        // projectColumns[project.id] = project?.id;
        projectDataMap[project.id] = generateRows(project.id);
      });
      setProjectData(projectDataMap)
    }
    setLoading(false);
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
      // console.log("PU", filteredData)

      return dailyEntry;
    });

    const today = new Date();
    const lastDate = new Date(today.setDate(today.getDate() + (timesheet_settings?.approvalWorkflow?.timeLimitForApproval || 0)));

    const projectTotals = {};
    const projectDetails = {};

    // Calculate totals for each project
    projectData && Object.keys(projectData)?.forEach((projectName) => {
      projectTotals[projectName] = projectData && projectData[projectName]?.reduce(
        (sum, entry) => sum + (parseFloat(entry?.dailyEntries[projectName]?.hours) || 0),
        0
      );
    })

    {
      Object.keys(selectedProjectColumns)?.map((columnIndex) => {
        const projectName = selectedProjectColumns[columnIndex];
        const { balance, allocated, expensed, color } = calculateBalanceHours(projectName, projectTotals)
        const weekly_total = projectTotals[projectName]
        projectDetails[projectName] = {
          balance, allocated, expensed, weekly_total
        }
      })
    }


    const timesheetPayload = {
      user_id: session.user.id,
      timesheet_date: currentDate.toISOString(),
      timesheet_type: viewMode,
      status,
      details: timesheetDetails,
      project_details: projectDetails,
      approver_id: session?.user[timesheet_settings?.approvalWorkflow?.defaultApprover || 'manager_id']?.id,
      last_date: lastDate.toISOString(),
      submitted_time: new Date()
    };

    // console.log("Payload", timesheetDetails)
    try {
      if (existingTimesheetId) {
        // Update existing timesheet
        const { error } = await supabase
          .from('timesheet')
          .update(timesheetPayload)
          .eq('id', existingTimesheetId);

        if (error) throw error;
        message.success('Timesheet updated successfully.');
      } else {
        // Insert new timesheet
        const { error } = await supabase
          .from('timesheet')
          .insert(timesheetPayload);

        if (error) throw error;
        message.success('Timesheet submitted successfully.');
        // form.resetFields();
        setProjectData()
        closeDrawer()
      }
      // console.log("Pr", projectDetails)
      fetchTimesheets()
      // // Refetch the timesheet data after submission
      // checkExistingTimesheet();
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
      // console.log("D", selectedProjectColumns, projectData, newProjectIndex)
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
    console.log("PC", projectName, columnIndex, selectedProjectColumns, projectData)

    // setSelectedProjectColumns((prevState) => ({
    //   ...prevState,
    //   [columnIndex]: projectName,
    // }));

    // if (!projectData[projectName]) {
    //   setProjectData((prevData) => ({
    //     ...prevData,
    //     // [projectName]: generateRows(projectName),
    //     [projectName]: projectData[columnIndex],
    //   }));
    // }

    // if (!projectData[projectName]) {
    setProjectData((prevData) => {
      const newState = {
        ...prevData,
        // [projectName]: generateRows(projectName),
        [projectName]: projectData[columnIndex],
      }
      delete newState[columnIndex];
      return newState
    });
    // }

    setSelectedProjectColumns((prevState) => {
      // Create a shallow copy of prevState
      const newState = { ...prevState, [projectName]: projectName };

      // Delete the key (or object) by columnIndex
      delete newState[columnIndex];

      return newState;
    });

    // // Update projectData
    // if (!projectData[projectName]) {
    //   setProjectData((prevData) => ({
    //     ...prevData,
    //     [projectName]: generateRows(projectName),
    //   }));
    // } else {
    //   setProjectData((prevData) => {
    //     const newData = { ...prevData };

    //     // Delete the data associated with the columnIndex if needed
    //     delete newData[columnIndex];

    //     return newData;
    //   });
    // }

  };

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

  const handleInputChange = (inputValue, date, project, field) => {
    const hours = field === 'hours' ? Number(inputValue.trim().replace(".", "")) : 0
    const value = field === 'hours' ? (hours > 0 ? Math.round(hours) : 0) : inputValue;
    console.log("HC", field, inputValue, value, date, project)
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
                ...(field === 'hours' && value === 0 ? { description: "" } : null),
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

  const checkDescriptionIsNull = (hours, description) => {
    // console.log("hr", hours)
    if (Number(hours) !== 0 && description === '') {
      setSubmitDisabled(true)
      return 'error'
    }
  }

  const checkhoursIsNull = (hours, description) => {
    if (Number(hours) === 0 && description !== '') {
      setSubmitDisabled(true)
      return 'error'
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      className: 'sticky-left',
    },
    ...(selectedProjectColumns
      ? Object.keys(selectedProjectColumns)?.map((columnIndex) => {
        const projectName = selectedProjectColumns[columnIndex];
        return {
          title: (
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <Select defaultValue={projectName} style={{ width: '100%', fontWeight: 'bold' }} onChange={(value) => handleProjectChange(value, columnIndex)} >
                {getAvailableProjects()?.map((option) => (
                  <Option key={option?.id} value={option?.id} disabled={option?.disabled} style={{ fontWeight: 'bold' }}>
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
                status={checkhoursIsNull(record?.dailyEntries[projectName]?.hours, record?.dailyEntries[projectName]?.description)}
                onChange={(e) => handleInputChange(e?.target?.value, record?.date, projectName, 'hours')}
                disabled={approvedTimeSheet}
                style={{ width: '100%' }}
              />
              <Input
                type="text"
                placeholder="Description"
                value={record?.dailyEntries[projectName]?.description}
                status={checkDescriptionIsNull(record?.dailyEntries[projectName]?.hours, record?.dailyEntries[projectName]?.description)}
                onChange={(e) => handleInputChange(e?.target?.value, record?.date, projectName, 'description')}
                disabled={!record?.dailyEntries[projectName]?.hours || approvedTimeSheet}
                style={{ marginTop: '4px', width: '100%' }}
              />
            </div>
          ),
        };
      })
      : []),
    ,
    {
      title: 'Daily Total',
      key: 'total',
      fixed: 'right',
      className: 'sticky-right',
      render: (_, record) => {
        var dailyTotal = projects?.reduce((sum, project) => sum + (parseFloat(record.dailyEntries?.[project.id]?.hours) || 0), 0)
        // var invalid=dailyTotal > 10 || dailyTotal<8
        // console.log("first", timesheet_settings?.workingHours?.standardDailyHours)

        var isWeekend = record?.weekend;
        var minHrs = timesheet_settings?.workingHours?.standardDailyHours || 8
        var maxHrs = timesheet_settings?.overtimeTracking?.maxOvertimeHours || 16

        var invalid = (isWeekend ? false : dailyTotal < (minHrs)) || dailyTotal > (minHrs + maxHrs)
        var warning = dailyTotal > (minHrs)
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
  }, []);
  useEffect(() => {
    // fetchProjects();
    checkExistingTimesheet();
    setApprovedTimeSheet(isTimesheetDisabled(viewMode, currentDate));
    setHideNext(isHideNext(currentDate));
  }, [currentDate, viewMode]);

  // console.log("G", projectData, generateRows(Object.keys(selectedProjectColumns)))

  const generateAllRows = () => {
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

    // Create a map to accumulate rows by date
    const rowsMap = {};

    // Iterate over each selected project to generate rows
    Object.values(selectedProjectColumns).forEach((projectName) => {
      const projectRows = generateRows(projectName);
      // console.log("R", projectRows)

      projectRows.forEach((row, i) => {
        // console.log("ii", i, row?.date)
        if (!rowsMap[row?.key]) {
          // If row doesn't exist for the date, create a new entry
          rowsMap[row.key] = {
            key: row?.key,
            date: row?.date,
            dailyEntries: {},
            weekend: i > 4,
          };
        }

        // Merge project data into the existing entry for that date
        rowsMap[row?.key].dailyEntries[projectName] = row?.dailyEntries[projectName];
      });
    });
    // Convert rows map to an array for the table data source
    // console.log("T", Object.values(rowsMap))
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
    const total = Object.values(projectTotals).reduce((total, value) => total + value, 0)
    const invalidweeklyTotal = total < (timesheet_settings?.workingHours?.standardWeeklyHours || 40)
    if (invalidweeklyTotal) {
      setSubmitDisabled(true)
    }
    // const { balance, total } = calculateBalanceHours(projectName, projectTotals)

    return (
      <Table.Summary>
        <Table.Summary.Row className="table-summary-row sticky-left">
          <Table.Summary.Cell fixed="left">Total</Table.Summary.Cell>
          {Object.keys(selectedProjectColumns).map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            return (
              <Table.Summary.Cell key={projectName}>
                {projectTotals[projectName] || 0}
              </Table.Summary.Cell>
            );
          })}
          <Table.Summary.Cell>
            <div style={{ color: invalidweeklyTotal && 'red' }}>
              {total}
            </div>
          </Table.Summary.Cell>
        </Table.Summary.Row>
        <Table.Summary.Row className="table-summary-row sticky-left">
          <Table.Summary.Cell fixed="left">Balance Hours</Table.Summary.Cell>
          {Object.keys(selectedProjectColumns)?.map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            const { balance, allocated, expensed, color } = calculateBalanceHours(projectName, projectTotals)
            const spent = projectTotals[projectName]
            {/* setProjectDetails({
              ...projectDetails,
              [projectName]: {
                balance, allocated, expensed, spent
              }
            }) */}
            {/* console.log(color) */ }
            return (
              <Table.Summary.Cell key={projectName} style={{ backgroundColor: color }}>
                {/* {calculateBalanceHours(projectName, projectTotals)} */}
                <div style={{ color }}>
                  {allocated ? `${balance} of ${allocated}` : ''}
                </div>
              </Table.Summary.Cell>
            );
          })}
          <Table.Summary.Cell>
            {/* {Object.values(projectTotals).reduce((allocated, value) => allocated + value, 0)} */}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const calculateBalanceHours = (projectName, projectTotals) => {
    const project = projects.find((p) => p.id === projectName);
    // console.log("YR", project, projectName, projectTotals)
    console.log("pro", project)
    if (!project || !project?.project_users) return 0;
    // const userDetails = project?.details?.project_users?.find(user => user.user_id === session?.user?.id);
    const userDetails = project?.project_users;
    if (!userDetails) return 0;

    const allocatedHours = parseInt(userDetails?.allocated_hours, 10) || 0;
    const expensedHours = parseInt(userDetails?.expensed_hours, 10) || 0;

    var color = null
    var balance = allocatedHours - expensedHours - (approvedTimeSheet ? 0 : projectTotals[projectName])

    if (balance <= ((100 - (timesheet_settings?.workingHours?.projectFinalHours || 80)) / 100) * allocatedHours) {
      color = 'gold'
    }
    if (balance < 0) {
      color = 'red'
      setSubmitDisabled(true)
    }
    // setProjectDetails({
    //   ...projectDetails,
    //   [projectName]: {
    //     balance, allocated: allocatedHours, expensed: expensedHours, spent: projectTotals[projectName]
    //   }
    // })
    return { balance, allocated: allocatedHours, expensed: expensedHours, color }
  };

  const handleDelete = async (record) => {
    // console.log("Record", record)
    if (record) {
      const { error } = await supabase.from('timesheet').delete().eq('id', record?.id);
      if (!error) {
        notification.success({ message: "Client deleted successfully" });
        fetchTimesheets();
      } else {
        notification.error({ message: error?.message || "Failed to delete client" });
      }
    }
    // setTimesheetToDelete();
  }

  // Define the columns for the table
  const timesheetColumns = [
    {
      title: 'Timesheet Date',
      dataIndex: 'timesheet_date',
      key: 'timesheet_date',
      // render: (date) => new Date(date).toLocaleDateString(), // Format date as needed
    },
    {
      title: 'Submitted Time',
      // dataIndex: 'details',
      key: 'submitted_time',
      render: (record) => (
        <div>
          {record?.submitted_time?.replace("T", " ")?.replace(/\.\d+\+\d+:\d+$/, "")}
        </div>
      )
    },
    {
      title: 'Review Time',
      // dataIndex: 'details',
      key: 'approver_details',
      render: (record) => (
        <div>
          {record?.approver_details?.approved_time?.replace("T", " ").replace(/\.\d+Z$/, "")}
        </div>
      )
    },
    // {
    //   title: 'Review Comment',
    //   // dataIndex: 'details',
    //   key: 'approver_id',
    //   render: (record) => (
    //     <div>
    //       {record?.approver_details?.comment}
    //     </div>
    //   )
    // },
    {
      title: 'Review Comment',
      key: 'approver_id',
      render: (record) => {
        const comment = record?.approver_details?.comment || '';  // Ensure the comment is defined
        const truncatedComment = comment.length > 150 ? `${comment.substring(0, 100)}...` : comment;

        return (
          <Tooltip title={comment}>  {/* Tooltip will show the full comment */}
            <div style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px', // You can adjust this based on your table column width
            }}>
              {truncatedComment}  {/* Truncated comment for the table cell */}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: Array.from(
        new Set(timesheets?.map((record) => record?.status))
      )?.map((status) => ({ text: status, value: status })), // Create unique filters from status
      onFilter: (value, record) => record?.status === value,
    },
    // {
    //   title: 'Last Updated',
    //   dataIndex: 'updated_at',
    //   key: 'updated_at',
    //   render: (date) => new Date(date).toLocaleString(), // Format date and time
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="d-flex">
          {record?.status !== 'Approved' &&
            <Tooltip title="Edit">
              <Button
                type="primary"
                icon={<EditFilled />}
                size="small"
                className="mr-2"
                onClick={() => { setCurrentDate(new Date(record?.timesheet_date)); setCurrentTimesheet(record); setDrawerVisible(true) }}
              />
            </Tooltip>
          }
          {record?.status !== 'Approved' &&
            <Tooltip title="Delete">
              <Button
                type="primary" ghost
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => showDeleteConfirm(record)}
              />
            </Tooltip>
          }
        </div>
      ),
    },
  ];

  const showDeleteConfirm = (record) => {
    confirm({
      title: `Are you sure delete ${record?.timesheet_date} timesheet?`,
      icon: <ExclamationCircleFilled />,
      // content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDelete(record);
      },
      onCancel() {

      },
    });
  };

  return (
    <>
      {/* <Button type="primary" onClick={showDrawer} style={{ marginBottom: 16 }}>
        Add Timesheet
      </Button> */}
      {/* <Modal visible={timesheetToDelete} closable={false}
        title={`Confirm Delete ${timesheetToDelete?.timesheet_date} Timesheet`}
        onCancel={() => setTimesheetToDelete()} onOk={handleDelete}
      >
      </Modal> */}
      {/* <MyTimesheetTable /> */}
      <Table size={'small'}
        columns={timesheetColumns}
        dataSource={timesheets}
        rowKey="id" // Assuming `id` is unique
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      {(drawerVisible && selectedProjectColumns) && <Drawer
        title="Add Timesheet"
        width={'100%'}
        onClose={closeDrawer}
        visible={drawerVisible} maskClosable={false}
      >
        <Spin spinning={loading}>
          <Row justify="space-between" align="middle">
            <Col>
              <Button onClick={addNewProject}>Add Project Column</Button>
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
            {approvedTimeSheet ? "Approved" : <Col>
              <Button onClick={() => handleSubmit('Draft')}>Save</Button>
              <Button onClick={() => handleSubmit('Submitted')} disabled={submitDisabled} className='ml-2 mr-2'>Submit</Button>
              <TimesheetInstructions />
            </Col>}
          </Row>

          {/* <Table size={'small'} size={'small'} columns={columns} dataSource={generateRows(Object.keys(selectedProjectColumns)[0])} pagination={false} /> */}

          <Table size={'small'} columns={columns} dataSource={generateAllRows()} pagination={false}
            summary={getSummary}
          // <>{getSummary}{renderBalanceHoursSummary}</>}
          />
        </Spin>
      </Drawer>}
    </>
  );
});

export default Timesheet;

import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Select, message, Row, Col, notification } from 'antd';
import { useSelector } from 'react-redux';
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';

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

  const { session } = useSelector((state) => state.auth);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('x_projects').select('*');
    if (data) {
      setProjects(data);
      console.log("T", data.slice(0, 2))

      // Automatically initialize project columns and data
      const projectColumns = {};
      const projectDataMap = {};
      data.forEach((project) => {
        projectColumns[project.project_name] = project.project_name;
        projectDataMap[project.project_name] = generateRows(project.project_name);
      });
      console.log("TT", projectColumns, projectDataMap)
      setSelectedProjectColumns(projectColumns);
      setProjectData(projectDataMap);
    } else {
      notification.error({ message: 'Failed to fetch projects' });
    }
  };

  // const checkExistingTimesheet = async () => {
  //   if (!session?.user?.id) {
  //     message.error('User is not authenticated.');
  //     return;
  //   }

  //   const { data, error } = await supabase
  //     .from('x_timesheet_3')
  //     .select('*')
  //     .eq('user_id', session.user.id)
  //     .eq('timesheet_date', currentDate.toISOString())
  //     .eq('timesheet_type', viewMode);

  //   if (error) {
  //     console.error('Error fetching timesheet:', error.message);
  //     setExistingTimesheetId(null);
  //   } else if (data && data.length > 0) {
  //     const timesheetDetails = data[0]?.details || [];
  //     const projectDataMap = {};

  //     timesheetDetails.forEach((row) => {
  //       Object.keys(row.dailyEntries).forEach((projectName) => {
  //         if (!projectDataMap[projectName]) projectDataMap[projectName] = [];
  //         projectDataMap[projectName].push(row);
  //       });
  //     });
  //     console.log("Existing Data", projectDataMap, projectData)
  //     setProjectData(projectDataMap);
  //     setExistingTimesheetId(data[0]?.id);
  //     setDisabled(['Approved'].includes(data[0]?.status));
  //   } else {
  //     setExistingTimesheetId(null);
  //   }
  // };

  const checkExistingTimesheet = async () => {
    if (!session?.user?.id) {
      message.error('User is not authenticated.');
      return;
    }

    const { data, error } = await supabase
      .from('x_timesheet_3')
      .select('*')
      .eq('user_id', session.user.id)
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
      console.log("Existing Data", projectDataMap, projectData)
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

      // Fill in the daily entries for each project
      for (let projectName of Object.keys(projectData)) {
        dailyEntry.dailyEntries[projectName] = {
          hours: projectData[projectName].find(entry => entry.key === day.key)?.dailyEntries[projectName]?.hours || '0',
          description: projectData[projectName].find(entry => entry.key === day.key)?.dailyEntries[projectName]?.description || '',
        };
      }

      return dailyEntry;
    });

    const timesheetPayload = {
      user_id: session.user.id,
      timesheet_date: currentDate.toISOString(),
      timesheet_type: viewMode,
      status,
      details: timesheetDetails,
    };
    console.log("Payload", timesheetPayload)
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
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayIndex)
      );

      const existingRow = projectData[projectName]?.find(row => row.key === dateValue);

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

  // const addNewProject = () => {
  //   const newProjectIndex = projects.length; // Use length to create unique index
  //   const newProject = { project_name: `New Project ${newProjectIndex + 1}` };

  //   setProjects([...projects, newProject]);

  //   setSelectedProjectColumns(prevState => ({
  //     ...prevState,
  //     [newProjectIndex]: newProject.project_name,
  //   }));

  //   // Initialize rows for the new project
  //   setProjectData(prevData => ({
  //     ...prevData,
  //     [newProject.project_name]: generateRows(newProject.project_name),
  //   }));
  // };

  // Function to get the list of available projects for selection
  const getAvailableProjects = () => {
    const selectedProjects = Object.values(selectedProjectColumns);
    return projects.map((project) => ({
      ...project,
      disabled: selectedProjects.includes(project.project_name),
    }));
  };


  const addNewProject = () => {
    // Find the first project that is not selected
    const unselectedProjects = projects.filter(
      (project) => !Object.values(selectedProjectColumns).includes(project.project_name)
    );

    if (unselectedProjects.length > 0) {
      const newProject = unselectedProjects[0];
      const newProjectIndex = Object.keys(selectedProjectColumns).length;

      setSelectedProjectColumns((prevState) => ({
        ...prevState,
        [newProjectIndex]: newProject.project_name,
      }));

      setProjectData((prevData) => ({
        ...prevData,
        [newProject.project_name]: generateRows(newProject.project_name),
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

  const handleInputChange = (value, date, project, field) => {
    console.log("first", projectData, value, date, project, field)
    setProjectData(prevData => ({
      ...prevData,
      [project]: prevData[project].map(item =>
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
      ),
    }));
    console.log("second", projectData)
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    const newDate = value === 'Weekly' ? getMonday(new Date()) : getFirstDayOfMonth(new Date());
    setCurrentDate(newDate);
  };

  //   const columns = [
  //     {
  //       title: 'Date',
  //       dataIndex: 'date',
  //       key: 'date',
  //       fixed: 'left',
  //     },
  //     ...Object.keys(selectedProjectColumns).map((columnIndex) => {
  //       const projectName = selectedProjectColumns[columnIndex];
  //       return {
  //         title: (
  //           <Select defaultValue={projectName} style={{ width: 120 }} onChange={(value) => handleProjectChange(value, columnIndex)}>
  //             {projects?.map(option => (
  //               <Option key={option?.project_name} value={option?.project_name}>
  //                 {option?.project_name}
  //               </Option>
  //             ))}
  //           </Select>
  //         ),
  //         dataIndex: projectName,
  //         key: projectName,
  //         render: (_, record) => (
  //           <div>
  //             <Input
  //               type="number"
  //               placeholder="Hours"
  //               value={record.dailyEntries?.[projectName]?.hours || ''}
  //               onChange={e => handleInputChange(e.target.value, record.date, projectName, 'hours')}
  //               disabled={disabled}
  //             />
  //             <Input
  //               type="text"
  //               placeholder="Description"
  //               value={record.dailyEntries?.[projectName]?.description || ''}
  //               onChange={e => handleInputChange(e.target.value, record.date, projectName, 'description')}
  //               disabled={disabled}
  //               style={{ marginTop: '4px' }}
  //             />
  //           </div>
  //         ),
  //       };
  //     }),
  //     {
  //       title: 'Daily Total',
  //       key: 'total',
  //       render: (_, record) => {
  //         return projects.reduce(
  //           (sum, project) => sum + (parseFloat(record.dailyEntries?.[project.project_name]?.hours) || 0),
  //           0
  //         );
  //       },
  //     },
  //   ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
    },
    // ...Object.keys(selectedProjectColumns).map((columnIndex) => {
    //   const projectName = selectedProjectColumns[columnIndex];
    //   return {
    //     title: (
    //       <Select
    //         defaultValue={projectName}
    //         style={{ width: 120 }}
    //         onChange={(value) => handleProjectChange(value, columnIndex)}
    //       >
    //         {projects?.map((option) => (
    //           <Option key={option?.project_name} value={option?.project_name}>
    //             {option?.project_name}
    //           </Option>
    //         ))}
    //       </Select>
    //     ),
    //     dataIndex: projectName,
    //     key: projectName,
    //     render: (_, record) => (
    //       <div>
    //         <Input
    //           type="number"
    //           placeholder="Hours"
    //           value={record.dailyEntries?.[projectName]?.hours || ''}
    //           onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'hours')}
    //           disabled={disabled}
    //           style={{ width: '100%' }} // Ensure full width
    //         />
    //         <Input
    //           type="text"
    //           placeholder="Description"
    //           value={record.dailyEntries?.[projectName]?.description || ''}
    //           onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'description')}
    //           disabled={disabled}
    //           style={{ marginTop: '4px', width: '100%' }} // Ensure full width and margin
    //         />
    //       </div>
    //     ),
    //   };
    // }),
    ...Object.keys(selectedProjectColumns).map((columnIndex) => {
      const projectName = selectedProjectColumns[columnIndex];
      return {
        // title: (
        //   <Select
        //     defaultValue={projectName}
        //     style={{ width: 120 }}
        //     onChange={(value) => handleProjectChange(value, columnIndex)}
        //   >
        //     {getAvailableProjects().map((option) => (
        //       <Option key={option.project_name} value={option.project_name} disabled={option.disabled}>
        //         {option.project_name}
        //       </Option>
        //     ))}
        //   </Select>
        // ),
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select defaultValue={projectName} style={{ width: 120 }} onChange={(value) => handleProjectChange(value, columnIndex)} >
              {getAvailableProjects().map((option) => (
                <Option key={option.project_name} value={option.project_name} disabled={option.disabled}>
                  {option.project_name}
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
              placeholder="Hours"
              value={record.dailyEntries[projectName]?.hours}
              onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'hours')}
              disabled={disabled}
              style={{ width: '100%' }}
            />
            <Input
              type="text"
              placeholder="Description"
              value={record.dailyEntries[projectName]?.description}
              onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'description')}
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
      render: (_, record) => {
        var dailyTotal = projects.reduce((sum, project) => sum + (parseFloat(record.dailyEntries?.[project.project_name]?.hours) || 0), 0)
        // var invalid=dailyTotal > 10 || dailyTotal<8
        var invalid = dailyTotal > 8
        if (invalid) {
          setSubmitDisabled(true)
        }
        return (
          <div style={{ color: (invalid) && 'red' }}>
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
        if (!rowsMap[row.key]) {
          // If row doesn't exist for the date, create a new entry
          rowsMap[row.key] = {
            key: row.key,
            date: row.date,
            dailyEntries: {},
          };
        }

        // Merge project data into the existing entry for that date
        rowsMap[row.key].dailyEntries[projectName] = row.dailyEntries[projectName];
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
    Object.keys(projectData).forEach((projectName) => {
      projectTotals[projectName] = projectData[projectName].reduce(
        (sum, entry) => sum + (parseFloat(entry.dailyEntries[projectName]?.hours) || 0),
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
          {Object.keys(selectedProjectColumns).map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            const { balance, total, color } = calculateBalanceHours(projectName, projectTotals)
            console.log(color)
            return (
              <Table.Summary.Cell key={projectName} style={{ backgroundColor: color }}>
                {/* {calculateBalanceHours(projectName, projectTotals)} */}
                <div style={{ color }}>
                  {balance} of {total}
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
    const project = projects.find((p) => p.project_name === projectName);
    if (!project || !project.details.project_users) return 0;

    const userDetails = project.details.project_users.find(user => user.user_id === session?.user?.id);
    if (!userDetails) return 0;

    const allocatedHours = parseInt(userDetails.allocated_hours, 10) || 0;
    const expensedHours = parseInt(userDetails.expensed_hours, 10) || 0;
    // const projectTotalHours = project.details.project_users.reduce((total, user) => {
    //   return total + (parseInt(user.allocated_hours, 10) || 0);
    // }, 0);

    // // Calculate balance hours
    // return allocatedHours - projectTotalHours;
    // return { balance: allocatedHours - expensedHours - projectTotals[projectName], total: allocatedHours }
    var color = null
    var balance = allocatedHours - expensedHours - projectTotals[projectName]

    if (balance < 0.2 * allocatedHours) {
      color = 'gold'
    }
    if (balance < 0) {
      color = 'red'
      setSubmitDisabled(true)
    }
    return { balance, total: allocatedHours, color }
  };

  // const renderBalanceHoursSummary = () => {
  //   return (
  //     <div style={{ margin: '20px 0' }}>
  //       <Title level={4}>Balance Hours Summary</Title>
  //       {projects.map((project) => {
  //         const balanceHours = calculateBalanceHours(project.project_name);
  //         return (
  //           <Row key={project.id} justify="space-between" style={{ marginBottom: '8px' }}>
  //             <Col>{project.project_name}</Col>
  //             <Col>{balanceHours}</Col>
  //           </Row>
  //         );
  //       })}
  //     </div>
  //   );
  // };
  const renderBalanceHoursSummary = () => {
    return (
      <Table.Summary>
        <Table.Summary.Row>
          <Table.Summary.Cell fixed="left">Balance Hours</Table.Summary.Cell>
          {Object.keys(selectedProjectColumns).map((columnIndex) => {
            const projectName = selectedProjectColumns[columnIndex];
            return (
              <Table.Summary.Cell key={projectName}>
                {calculateBalanceHours(projectName)}
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

  return (
    <div>
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
    </div >
  );
};

export default Timesheet;

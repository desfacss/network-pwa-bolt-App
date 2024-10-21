import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Select, message, Row, Col, notification } from 'antd';
import { useSelector } from 'react-redux';
import { formatDate, getFirstDayOfMonth, getMonday, goToNext, goToPrevious, isHideNext, isTimesheetDisabled } from 'components/common/utils';
import { supabase } from 'configs/SupabaseConfig';

const { Option } = Select;

const Timesheet = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [disabled, setDisabled] = useState(false);
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

      // Automatically initialize project columns and data
      const projectColumns = {};
      const projectDataMap = {};
      data.forEach((project) => {
        projectColumns[project.project_name] = project.project_name;
        projectDataMap[project.project_name] = generateRows(project.project_name);
      });
      setSelectedProjectColumns(projectColumns);
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
      .from('x_timesheet_2')
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

      timesheetDetails.forEach((row) => {
        Object.keys(row.dailyEntries).forEach((projectName) => {
          if (!projectDataMap[projectName]) projectDataMap[projectName] = [];
          projectDataMap[projectName].push(row);
        });
      });

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

    const timesheetDetails = Object.keys(projectData).map(projectName => ({
      project_name: projectName,
      dailyEntries: projectData[projectName],
    }));

    const timesheetPayload = {
      user_id: session.user.id,
      timesheet_date: currentDate.toISOString(),
      timesheet_type: viewMode,
      status,
      details: timesheetDetails,
    };

    try {
      if (existingTimesheetId) {
        // Update existing timesheet
        const { error } = await supabase
          .from('x_timesheet_2')
          .update(timesheetPayload)
          .eq('id', existingTimesheetId);

        if (error) throw error;
        message.success('Timesheet updated successfully.');
      } else {
        // Insert new timesheet
        const { error } = await supabase
          .from('x_timesheet_2')
          .insert(timesheetPayload);

        if (error) throw error;
        message.success('Timesheet submitted successfully.');
      }

      // Optionally, you could refetch the timesheet data after submission
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

  const addNewProject = () => {
    const newProject = { project_name: `New Project ${projects.length + 1}` };
    setProjects(prevProjects => [...prevProjects, newProject]);

    setSelectedProjectColumns(prevState => ({
      ...prevState,
      [newProject.project_name]: newProject.project_name,
    }));

    setProjectData(prevData => ({
      ...prevData,
      [newProject.project_name]: generateRows(newProject.project_name),
    }));
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
    ...Object.keys(selectedProjectColumns).map((columnIndex) => {
      const projectName = selectedProjectColumns[columnIndex];
      return {
        title: (
          <Select defaultValue={projectName} style={{ width: 120 }} onChange={(value) => handleProjectChange(value, columnIndex)}>
            {projects?.map(option => (
              <Option key={option?.project_name} value={option?.project_name}>
                {option?.project_name}
              </Option>
            ))}
          </Select>
        ),
        dataIndex: projectName,
        key: projectName,
        render: (_, record) => (
          <div>
            <Input
              type="number"
              placeholder="Hours"
              value={record.dailyEntries?.[projectName]?.hours || ''}
              onChange={e => handleInputChange(e.target.value, record.date, projectName, 'hours')}
              disabled={disabled}
            />
            <Input
              type="text"
              placeholder="Description"
              value={record.dailyEntries?.[projectName]?.description || ''}
              onChange={e => handleInputChange(e.target.value, record.date, projectName, 'description')}
              disabled={disabled}
              style={{ marginTop: '4px' }}
            />
          </div>
        ),
      };
    }),
    {
      title: 'Daily Total',
      key: 'total',
      render: (_, record) => {
        return projects.reduce(
          (sum, project) => sum + (parseFloat(record.dailyEntries?.[project.project_name]?.hours) || 0),
          0
        );
      },
    },
  ];

  useEffect(() => {
    fetchProjects();
    checkExistingTimesheet();
    setDisabled(isTimesheetDisabled(viewMode, currentDate));
    setHideNext(isHideNext(currentDate));
  }, [currentDate, viewMode]);

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col>
          <Button onClick={addNewProject}>Add New Project</Button>
          <Select defaultValue={viewMode} style={{ width: 120 }} onChange={handleViewModeChange}>
            <Option value="Weekly">Weekly</Option>
            <Option value="Monthly">Monthly</Option>
          </Select>
        </Col>
        <Col>
          <Button onClick={() => goToPrevious(viewMode, setCurrentDate)}>Previous</Button>
          <Button onClick={() => goToNext(viewMode, setCurrentDate)} disabled={hideNext}>Next</Button>
          <span>{currentDate.toDateString()}</span>
        </Col>
        <Col>
          <Button onClick={() => handleSubmit('Draft')}>Save</Button>
          <Button onClick={() => handleSubmit('Submitted')}>Submit</Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={generateRows(Object.keys(selectedProjectColumns)[0])} pagination={false} />
    </div>
  );
};

export default Timesheet;

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
  const [selectedProjectColumns, setSelectedProjectColumns] = useState([]);

  const { session } = useSelector((state) => state.auth);

  // Fetch all projects and initialize project columns and data
  const fetchProjects = async () => {
    const { data, error } = await supabase.from('x_projects').select('*');
    if (data) {
      setProjects(data);

      // Automatically initialize project columns and data
      const projectColumns = data.map(project => project.project_name);
      const projectDataMap = {};
      projectColumns.forEach((projectName) => {
        projectDataMap[projectName] = generateRows(projectName);
      });
      setSelectedProjectColumns(projectColumns);
      setProjectData(projectDataMap);
    } else {
      notification.error({ message: 'Failed to fetch projects' });
    }
  };

  // Check if timesheet exists
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

  // Handle form submission (save/submit)
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
      selectedProjectColumns.forEach(projectName => {
        dailyEntry.dailyEntries[projectName] = {
          hours: projectData[projectName]?.find(entry => entry.key === day.key)?.dailyEntries?.[projectName]?.hours || '0',
          description: projectData[projectName]?.find(entry => entry.key === day.key)?.dailyEntries?.[projectName]?.description || '',
        };
      });

      return dailyEntry;
    });

    const timesheetPayload = {
      user_id: session.user.id,
      timesheet_date: currentDate.toISOString(),
      timesheet_type: viewMode,
      status,
      details: timesheetDetails,
    };

    try {
      if (existingTimesheetId) {
        const { error } = await supabase
          .from('x_timesheet_2')
          .update(timesheetPayload)
          .eq('id', existingTimesheetId);
        if (error) throw error;
        message.success('Timesheet updated successfully.');
      } else {
        const { error } = await supabase
          .from('x_timesheet_2')
          .insert(timesheetPayload);
        if (error) throw error;
        message.success('Timesheet submitted successfully.');
      }
      checkExistingTimesheet(); // Refetch after submission
    } catch (error) {
      message.error(`Error submitting timesheet: ${error.message}`);
    }
  };

  // Generate rows for a specific project
  const generateRows = (projectName) => {
    const startDate = new Date(currentDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const rowCount = viewMode === 'Weekly' ? 7 : daysInMonth;

    return Array.from({ length: rowCount }, (_, dayIndex) => {
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
  };

  const addNewProject = () => {
    const newProjectIndex = projects.length;
    const newProject = { project_name: `New Project ${newProjectIndex + 1}` };
  
    setProjects([...projects, newProject]);
    setSelectedProjectColumns([...selectedProjectColumns, newProject.project_name]);

    setProjectData(prevData => ({
      ...prevData,
      [newProject.project_name]: generateRows(newProject.project_name),
    }));
  };

  const handleProjectChange = (projectName, columnIndex) => {
    const updatedColumns = [...selectedProjectColumns];
    updatedColumns[columnIndex] = projectName;
    setSelectedProjectColumns(updatedColumns);

    if (!projectData[projectName]) {
      setProjectData(prevData => ({
        ...prevData,
        [projectName]: generateRows(projectName),
      }));
    }
  };

  const handleInputChange = (value, date, projectName, field) => {
    setProjectData(prevData => ({
      ...prevData,
      [projectName]: prevData[projectName].map(item =>
        item.key === date
          ? {
              ...item,
              dailyEntries: {
                ...item.dailyEntries,
                [projectName]: {
                  ...item.dailyEntries[projectName],
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
    ...selectedProjectColumns.map((projectName, columnIndex) => ({
      title: (
        <Select
          defaultValue={projectName}
          style={{ width: 120 }}
          onChange={(value) => handleProjectChange(value, columnIndex)}
        >
          {projects.map((option) => (
            <Option key={option.project_name} value={option.project_name}>
              {option.project_name}
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
            onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'hours')}
            disabled={disabled}
          />
          <Input
            type="text"
            placeholder="Description"
            value={record.dailyEntries?.[projectName]?.description || ''}
            onChange={(e) => handleInputChange(e.target.value, record.date, projectName, 'description')}
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
        return selectedProjectColumns.reduce(
          (sum, projectName) => sum + (parseFloat(record.dailyEntries?.[projectName]?.hours) || 0),
          0
        );
      },
    },
  ];

  useEffect(() => {
    fetchProjects();
    checkExistingTimesheet();
    setDisabled(isTimesheetDisabled(viewMode, currentDate));
    setHideNext(isHideNext(currentDate, viewMode));
  }, [currentDate, viewMode, session?.user?.id]);

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: '12px' }}>
        <Col>
          <Button onClick={() => goToPrevious(currentDate, setCurrentDate, viewMode)}>Previous</Button>
          <Button onClick={() => goToNext(currentDate, setCurrentDate, viewMode)} disabled={hideNext}>
            Next
          </Button>
        </Col>
        <Col>
          <Select value={viewMode} onChange={handleViewModeChange}>
            <Option value="Weekly">Weekly</Option>
            <Option value="Monthly">Monthly</Option>
          </Select>
        </Col>
      </Row>
      <Table
        dataSource={generateRows(selectedProjectColumns[0])}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <Row justify="end" style={{ marginTop: '12px' }}>
        <Button type="primary" onClick={() => handleSubmit('Saved')} disabled={disabled}>
          Save
        </Button>
        <Button type="primary" style={{ marginLeft: '8px' }} onClick={() => handleSubmit('Submitted')} disabled={disabled}>
          Submit
        </Button>
      </Row>
    </div>
  );
};

export default Timesheet;
import React from 'react';
import { ViewMode, Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Card } from 'antd';

const GanttView = ({ tasks }) => {
    return (
        <Card>
            <Gantt
                tasks={tasks}
                viewMode={ViewMode.Month}
            />
        </Card>
    );
};

export default GanttView;

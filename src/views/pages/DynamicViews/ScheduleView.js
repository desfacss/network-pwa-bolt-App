// import React, { useState } from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// // import { Scheduler, SchedulerData, ViewType, DemoData } from 'react-big-scheduler';
// import { Scheduler, SchedulerData, ViewType, DemoData } from 'react-big-schedule'; // Or the correct imports from react-big-schedule
//   // Import the necessary components
// import 'react-big-schedule/dist/css/style.css';  // Import the CSS

// const ScheduleView = () => {
//   // Initialize the SchedulerData with a default view (Week View)
//   const [schedulerData, setSchedulerData] = useState(
//     new SchedulerData('2024-01-01', ViewType.Week, false, false, {
//       schedulerWidth: '80%',
//       schedulerMaxHeight: 500,
//     })
//   );

//   // Use DemoData for sample resources and events
//   schedulerData.setResources(DemoData.resources);
//   schedulerData.setEvents(DemoData.events);

//   // Event handler for clicking an event
//   const onEventClick = (eventId) => {
//     alert(`Event clicked: ${eventId}`);
//   };

//   // Event handler for moving an event
//   const onMoveEvent = (event, slotId, start, end) => {
//     alert(`Event moved to: ${slotId}, ${start}, ${end}`);
//   };

//   // Event handler for creating a new event
//   const onNewEvent = (slotId, start, end) => {
//     alert(`New event created: ${slotId}, ${start}, ${end}`);
//   };

//   // Handle changing the view by updating the schedulerData
//   const onViewChange = (viewType) => {
//     const newSchedulerData = new SchedulerData(
//       schedulerData.startDate,
//       viewType,
//       false,
//       false,
//       {
//         schedulerWidth: '80%',
//         schedulerMaxHeight: 500,
//       }
//     );

//     newSchedulerData.setResources(DemoData.resources);
//     newSchedulerData.setEvents(DemoData.events);

//     setSchedulerData(newSchedulerData);  // Update the schedulerData state
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div>
//         <h1>React Big Scheduler Demo</h1>

//         {/* Scheduler view type buttons */}
//         <div>
//           <button onClick={() => onViewChange(ViewType.Month)}>Month</button>
//           <button onClick={() => onViewChange(ViewType.Week)}>Week</button>
//           <button onClick={() => onViewChange(ViewType.Day)}>Day</button>
//         </div>

//         {/* Scheduler component */}
//         <Scheduler
//           schedulerData={schedulerData}
//           onEventClick={onEventClick}
//           onMoveEvent={onMoveEvent}
//           onNewEvent={onNewEvent}
//         />
//       </div>
//     </DndProvider>
//   );
// };

// export default ScheduleView;



import React, { useState } from 'react'; // Importing useState
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Scheduler, SchedulerData, ViewType, DemoData } from 'react-big-schedule';
import 'react-big-schedule/dist/css/style.css';

const ScheduleView = () => {
  // Initialize the SchedulerData with a default view (Week View)
  const [schedulerData, setSchedulerData] = useState(
    new SchedulerData('2024-01-01', ViewType.Week, false, false, {
      schedulerWidth: '80%',
      schedulerMaxHeight: 500,
    })
  );

  // Use DemoData for sample resources and events
  console.log("DD", DemoData)
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);

  // Event handler for clicking an event
  const onEventClick = (eventId) => {
    alert(`Event clicked: ${eventId}`);
  };

  // Event handler for moving an event
  const onMoveEvent = (event, slotId, start, end) => {
    alert(`Event moved to: ${slotId}, ${start}, ${end}`);
  };

  // Event handler for creating a new event
  const onNewEvent = (slotId, start, end) => {
    alert(`New event created: ${slotId}, ${start}, ${end}`);
  };

  // Handle changing the view by updating the schedulerData
  const onViewChange = (viewType) => {
    const newSchedulerData = new SchedulerData(
      schedulerData.startDate,
      viewType,
      false,
      false,
      {
        schedulerWidth: '80%',
        schedulerMaxHeight: 500,
      }
    );

    newSchedulerData.setResources(DemoData.resources);
    newSchedulerData.setEvents(DemoData.events);

    setSchedulerData(newSchedulerData);  // Make sure to update the schedulerData state
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>React Big Scheduler Demo</h1>

        {/* Scheduler view type buttons */}
        {/* <div>
          <button onClick={() => onViewChange(ViewType.Month)}>Month</button>
          <button onClick={() => onViewChange(ViewType.Week)}>Week</button>
          <button onClick={() => onViewChange(ViewType.Day)}>Day</button>
        </div> */}

        {/* Scheduler component */}
        <Scheduler
          schedulerData={schedulerData}
          onEventClick={onEventClick}
          onMoveEvent={onMoveEvent}
          onNewEvent={onNewEvent}
        />
      </div>
    </DndProvider>
  );
};

export default ScheduleView;

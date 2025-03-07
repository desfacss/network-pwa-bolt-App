// // views/landing/SurveyPage.js
// import React, { useEffect, useState } from "react";
// import { Button, Drawer, message } from "antd";
// import { supabase } from 'configs/SupabaseConfig';
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { APP_PREFIX_PATH } from "configs/AppConfig";
// import DynamicForm from "views/pages/DynamicForm";
// import Survey from "./Survey";

// const SurveyPage = () => {
//   // ... Your existing state, hooks, and functions ...

//   return (
//     <>
//       <Survey />
//       <h1>Business Insights Survey</h1>
//       {/* ... Your other content */}
//       <Button onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register for Networking</Button>
//       <div className="mt-4">
//         <Button type='primary' onClick={() => setVisible(true)}>
//           Anonymous Survey
//         </Button>
//       </div>
//       <Drawer
//         title="Business Survey"
//         placement="right"
//         width={520}
//         onClose={() => setVisible(false)}
//         visible={visible}
//       >
//         {schema && <DynamicForm schemas={schema} onFinish={onFinish} />}
//       </Drawer>
//     </>
//   );
// };

// export default SurveyPage;

import React from "react";
import { Button, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import DynamicForm from "views/pages/DynamicForm";
import Survey from "./Survey";
import { supabase } from "configs/SupabaseConfig";

const SurveyPage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(false);
  const [schema, setSchema] = React.useState(null);

  // If you removed useEffect but still need to fetch data:
  // Use an async function or useEffect if state needs updating based on side effects
  const fetchFormSchema = async () => {
    // Your fetch logic here
    const { data, error } = await supabase.from('forms').select('data_schema, ui_schema').eq('name', 'business_survey_form');
    if (error) {
      console.error('Error fetching schema:', error);
    } else if (data && data.length > 0) {
      setSchema({ data_schema: data[0].data_schema, ui_schema: data[0].ui_schema });
    }
  };

  // Call fetchFormSchema where appropriate, like in a button click or on component mount if using class component

  const onFinish = async (values) => {
    // Your onFinish logic here
  };

  return (
    <>
      <Survey />
      <h1>Business Insights Survey</h1>
      {/* ... */}
      <Button onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register for Networking</Button>
      <div className="mt-4">
        <Button type='primary' onClick={() => setVisible(true)}>Anonymous Survey</Button>
      </div>
      <Drawer
        title="Business Survey"
        placement="right"
        width={520}
        onClose={() => setVisible(false)}
        visible={visible}
      >
        {schema && <DynamicForm schemas={schema} onFinish={onFinish} />}
      </Drawer>
    </>
  );
};

export default SurveyPage;
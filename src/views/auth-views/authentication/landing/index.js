import React, { useEffect, useState } from "react";
import { Button, Card, Drawer, message } from "antd";
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import DynamicForm from "views/pages/DynamicForm";

const Survey = () => {
  const [visible, setVisible] = useState(false);
  const [schema, setSchema] = useState(null);
  const { session } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormSchema = async () => {
      // console.log("ud", session?.user?.organization?.id);
      // if (session?.user?.organization?.id) {
      const { data, error } = await supabase
        .from('forms')
        .select('data_schema, ui_schema')
        .eq('name', 'business_survey_form')
      // .eq('organization_id', session.user.organization.id);

      if (error) {
        console.error('Error fetching schema:', error);
      } else if (data && data.length > 0) {
        console.log("ui", data);
        setSchema({
          data_schema: data[0].data_schema,
          ui_schema: data[0].ui_schema
        });
      }
      // }
    };

    fetchFormSchema();
  }, [session]);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onFinish = async (values) => {
    const { error } = await supabase
      .from('ib_survey')
      .insert({
        details: values,
        // created_by: session?.user?.id
      });

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      message.success("Survey data submitted successfully")
      console.log('Survey data submitted successfully');
      onClose();  // Close the drawer after submission
    }
  };

  return (
    <>
      <h1>Business Insights Survey</h1>
      <p>
        The Nagarathar community has a robust history of entrepreneurial success in finance, trade, and various business ventures, characterized by sharp business acumen, philanthropy, and adaptability. To uphold this legacy and in the context of newer business models and emerging opportunities, it's crucial to understand the entrepreneurship and business landscape within our community, as well as the aspirations of our members.
      </p>
      <h3>Purpose of the Survey:</h3>
      <ul>
        <li><p><strong>Comprehensive Business Insight:</strong> Gather & publish a snapshot of entrepreneurship and business activity within the Nagarathar community today.</p></li>
        <li><p><strong>Identify Aspirations:</strong> Gauge the entrepreneurial aspirations and interests of the next generation across verticals.</p></li>
        <li><p><strong>Networking Opportunities:</strong> Help foster collaboration and growth through various networking opportunities.</p></li>
        <li><p><strong>Support Planning:</strong> Align activities of IBCN, KNBA, NCC, NBC, NBIG, NEU, and other orgs to better support our community.</p></li>
      </ul>
      <h3>Your Participation:</h3>
      <ul>
        <li><p><strong>Optional Information:</strong> Providing business names and all contact information is optional.</p></li>
        <li><p><strong>Confidentiality:</strong> All responses are confidential and used solely for statistical publication.</p></li>
        <li><p><strong>Business Directory / Networking:</strong> You can opt-in or opt-out to participate in networking opportunities.</p></li>
      </ul>
      <Button onClick={() => navigate(`${APP_PREFIX_PATH}/register`)}>Register for Networking</Button>
      <div className="mt-4">
        <Button type='primary' onClick={showDrawer}>
          Annonymous Survey
        </Button>
      </div>
      <Drawer
        title="Business Survey"
        placement="right"
        width={520}
        onClose={onClose}
        visible={visible}
      >
        {schema && <DynamicForm schemas={schema} onFinish={onFinish} />}
      </Drawer>
    </>
  );
};

export default Survey;
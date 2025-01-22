import React from "react";
import { Typography, Alert } from "antd";

const { Text } = Typography;

const DefaultDashboard = () => {
    return (
        <div style={{ padding: "20px" }}>
            <Alert
                message="Notice"
                description={
                    <Text>
                        Based on the agreement, your modules will be enabled. If not, connect with{" "}
                        <a href="mailto:info@claritiz.com">info@claritiz.com</a>.
                    </Text>
                }
                type="info"
                showIcon
            />
        </div>
    );
};

export default DefaultDashboard;

/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, Switch, notification, Space } from "antd";
import { supabase } from "configs/SupabaseConfig";

const SummaryEmailToggle = ({
  size = "default", // Ant Design Switch size: 'small' or 'default'
  label = "Summary Emails", // Label text
  style = {}, // Custom styles for the Card container
  labelStyle = {}, // Custom styles for the label
  switchStyle = {}, // Custom styles for the Switch
  cardTitle = "Summary Email Notifications", // Customizable card title
  cardDescription = "Enable summary emails to receive periodic updates and summaries via email.", // Customizable card description
}) => {
  const { session } = useSelector((state) => state.auth);
  const [isSummaryEmailEnabled, setIsSummaryEmailEnabled] = useState(false);

  // Check existing summary_email setting on mount
  useEffect(() => {
    const checkSummaryEmail = async () => {
      if (!session?.user?.id) {
        console.error("[SummaryEmailToggle] No user session found");
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("subscriptions")
          .eq("auth_id", session.user.id)
          .single();

        if (error) {
          console.error("[SummaryEmailToggle] Error fetching subscriptions:", error);
          return;
        }

        const summaryEmailEnabled = userData?.subscriptions?.summary_email || false;
        setIsSummaryEmailEnabled(summaryEmailEnabled);
        console.log("[SummaryEmailToggle] Summary email setting:", summaryEmailEnabled);
      } catch (error) {
        console.error("[SummaryEmailToggle] Error checking summary email:", error);
      }
    };

    checkSummaryEmail();
  }, [session]);

  // Toggle summary email setting
  const toggleSummaryEmail = async () => {
    if (!session?.user?.id) {
      console.error("[SummaryEmailToggle] No user session found");
      notification.error({
        message: "Authentication Required",
        description: "Please log in to manage summary email settings.",
      });
      return;
    }

    const newValue = !isSummaryEmailEnabled;

    try {
      // Fetch current subscriptions
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("subscriptions")
        .eq("auth_id", session.user.id)
        .single();

      if (fetchError) {
        console.error("[SummaryEmailToggle] Supabase fetch error:", fetchError);
        throw fetchError;
      }

      // Update only the summary_email field, preserving the rest of the subscriptions object
      const updatedSubscriptions = {
        ...userData.subscriptions,
        summary_email: newValue,
      };

      // Save updated subscriptions to Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscriptions: updatedSubscriptions,
        })
        .eq("auth_id", session.user.id);

      if (updateError) {
        console.error("[SummaryEmailToggle] Supabase update error:", updateError);
        throw updateError;
      }

      setIsSummaryEmailEnabled(newValue);
      notification.success({
        message: newValue ? "Summary Emails Enabled" : "Summary Emails Disabled",
        description: newValue
          ? "You will now receive summary emails."
          : "You will no longer receive summary emails.",
      });
    } catch (error) {
      console.error("[SummaryEmailToggle] Error toggling summary email:", error);
      notification.error({
        message: "Error",
        description: "Failed to update summary email settings. Please try again.",
      });
    }
  };

  return (
    <Card
      title={cardTitle}
      style={{
        maxWidth: "100%",
        margin: "24px 48px",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        ...style,
      }}
    >
      <p style={{ marginBottom: 16, color: "#595959" }}>{cardDescription}</p>
      <Space style={{ alignItems: "center" }}>
        <Switch
          checked={isSummaryEmailEnabled}
          onChange={toggleSummaryEmail}
          size={size}
          style={{
            ...switchStyle,
          }}
        />
        <span
          style={{
            color: isSummaryEmailEnabled ? "#1890ff" : "#999",
            ...labelStyle,
          }}
        >
          {label} {isSummaryEmailEnabled ? "Enabled" : "Disabled"}
        </span>
      </Space>
    </Card>
  );
};

export default SummaryEmailToggle;
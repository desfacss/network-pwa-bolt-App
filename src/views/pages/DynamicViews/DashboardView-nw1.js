import React, { useState } from 'react';
import { Row, Col, Card, Button, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';
// import { supabase } from './supabaseClient'; // Import your Supabase client
import { supabase } from "configs/SupabaseConfig";

const DashboardView = ({ data, viewConfig, orgId }) => {
  const [metrics, setMetrics] = useState(data.metrics || {});
  const widgets = viewConfig?.dashboardview?.widgets || [];
  const actions = viewConfig?.dashboardview?.actions || [];

  // Function to calculate derived field based on formulas
  const calculateDerivedField = (formula, item, groupData = null) => {
    try {
      const keys = Object.keys(item);
      const values = Object.values(item);
      if (groupData) {
        keys.push('groupData');
        values.push(groupData);
      }
      const func = new Function(...keys, `return ${formula}`);
      return func(...values);
    } catch (error) {
      console.error("Error calculating formula", formula, error);
      return 0;
    }
  };

  // Refresh metrics by calling Supabase RPC function
  const refreshMetrics = async () => {
    try {
      // Call the Supabase RPC function to refresh metrics
      const { data: freshMetrics, error } = await supabase.rpc('refresh_y_sales_metrics', {
        p_org_id: orgId // Pass the orgId to the RPC function
      });

      if (error) {
        console.error("Error refreshing metrics:", error);
        alert('Failed to refresh metrics');
      } else {
        setMetrics(freshMetrics); // Update the metrics state with the fresh data
        alert('Metrics refreshed successfully');
      }
    } catch (error) {
      console.error("Error calling RPC function:", error);
      alert('Error refreshing metrics');
    }
  };

  // Render the widget based on its type
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'kpi':
        const kpiValue = metrics[widget.data_field] || 0;
        return <Statistic title={widget.title} value={kpiValue.toFixed(2)} />;

      case 'pie_chart':
        const pieData = metrics[widget.data_field] || {};
        const pieSeries = Object.values(pieData);
        const pieLabels = Object.keys(pieData);
        return (
          <ReactApexChart
            type="pie"
            series={pieSeries}
            options={{
              labels: pieLabels,
              legend: { position: 'bottom' },
            }}
          />
        );

      case 'bar_chart':
        const barGroupedData = groupDataByField(metrics[widget.data_field] || [], widget.x_axis_field);
        const barCategories = Object.keys(barGroupedData);
        const barSeriesData = barCategories.map((category) => {
          const groupData = barGroupedData[category];
          if (widget.formula) {
            return groupData.reduce((sum, item) => sum + calculateDerivedField(widget.formula, item, groupData), 0) / groupData.length;
          }
          return groupData.reduce((sum, item) => sum + (item[widget.y_axis_field] || 0), 0) / groupData.length;
        });

        return (
          <ReactApexChart
            type="bar"
            series={[{ name: widget.y_axis_field, data: barSeriesData }]}
            options={{
              xaxis: { categories: barCategories },
              legend: { position: 'top' },
            }}
          />
        );

      case 'line_chart':
        const lineGroupedData = groupDataByField(metrics[widget.data_field] || [], widget.x_axis_field);
        const lineCategories = Object.keys(lineGroupedData);
        const lineSeriesData = lineCategories.map((category) => {
          const groupData = lineGroupedData[category];
          if (widget.formula) {
            return groupData.reduce((sum, item) => sum + calculateDerivedField(widget.formula, item, groupData), 0) / groupData.length;
          }
          return groupData.reduce((sum, item) => sum + (item[widget.y_axis_field] || 0), 0) / groupData.length;
        });

        return (
          <ReactApexChart
            type="line"
            series={[{ name: widget.y_axis_field, data: lineSeriesData }]}
            options={{
              xaxis: { categories: lineCategories },
              legend: { position: 'top' },
            }}
          />
        );

      case 'area_chart':
        const areaGroupedData = groupDataByField(metrics[widget.data_field] || [], widget.x_axis_field);
        const areaCategories = Object.keys(areaGroupedData);
        const areaSeriesData = areaCategories.map((category) => {
          const groupData = areaGroupedData[category];
          if (widget.formula) {
            return groupData.reduce((sum, item) => sum + calculateDerivedField(widget.formula, item, groupData), 0) / groupData.length;
          }
          return groupData.reduce((sum, item) => sum + (item[widget.y_axis_field] || 0), 0) / groupData.length;
        });

        return (
          <ReactApexChart
            type="area"
            series={[{ name: widget.y_axis_field, data: areaSeriesData }]}
            options={{
              xaxis: { categories: areaCategories },
              legend: { position: 'top' },
            }}
          />
        );

      case 'donut_chart':
        const donutData = metrics[widget.data_field] || {};
        const donutSeries = Object.values(donutData);
        const donutLabels = Object.keys(donutData);
        return (
          <ReactApexChart
            type="donut"
            series={donutSeries}
            options={{
              labels: donutLabels,
              legend: { position: 'bottom' },
            }}
          />
        );

      default:
        return <div>Unsupported widget type</div>;
    }
  };

  // Function to group data by a field (used for bar charts and others)
  const groupDataByField = (data, field) => {
    return data.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {widgets.map((widget) => (
          <Col key={widget.id} span={widget.size?.width || 8}>
            <Card title={widget.title} bordered>
              {renderWidget(widget)}
            </Card>
          </Col>
        ))}
      </Row>
      {actions.map((action) => (
        <Col key={action.id} span={24}>
          <Button onClick={refreshMetrics}>{action.title}</Button>
        </Col>
      ))}
    </div>
  );
};

export default DashboardView;

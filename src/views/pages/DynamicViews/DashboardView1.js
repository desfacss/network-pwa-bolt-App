import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import ReactApexChart from 'react-apexcharts';

const DashboardView = ({ data, viewConfig }) => {
    const widgets = viewConfig?.dashboardview?.widgets || [];

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

    const renderWidget = (widget) => {
        switch (widget.type) {
            case 'kpi':
                const kpiValue = data.reduce((sum, item) => {
                    if (widget.formula) {
                        return sum + calculateDerivedField(widget.formula, item);
                    }
                    return sum + (item[widget.data_field] || 0);
                }, 0);
                return <Statistic title={widget.title} value={kpiValue.toFixed(2)} />;

            case 'pie_chart':
                const pieData = data.reduce((acc, item) => {
                    const key = item[widget.data_field] || 'Unknown';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});

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
                const barGroupedData = groupDataByField(data, widget.x_axis_field);
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
                const lineGroupedData = groupDataByField(data, widget.x_axis_field);
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
                const areaGroupedData = groupDataByField(data, widget.x_axis_field);
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
                const donutData = data.reduce((acc, item) => {
                    const key = item[widget.data_field] || 'Unknown';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});

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

    return (
        <Row gutter={[16, 16]}>
            {widgets.map((widget) => (
                <Col key={widget.id} span={widget.size?.width || 8}>
                    <Card title={widget.title} bordered>
                        {renderWidget(widget)}
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default DashboardView;


// import React from 'react';
// import { Row, Col, Card, Statistic } from 'antd';
// import ReactApexChart from 'react-apexcharts';

// const DashboardView = ({ data, viewConfig }) => {
//     const widgets = viewConfig?.dashboardview?.widgets || [];

//     const calculateDerivedField = (formula, item) => {
//         try {
//             const keys = Object.keys(item);
//             const values = Object.values(item);
//             const func = new Function(...keys, `return ${formula}`);
//             return func(...values);
//         } catch (error) {
//             console.error("Error calculating formula", formula, error);
//             return 0;
//         }
//     };

//     const renderWidget = (widget) => {
//         switch (widget.type) {
//             case 'kpi':
//                 const kpiValue = data.reduce((sum, item) => {
//                     if (widget.formula) {
//                         return sum + calculateDerivedField(widget.formula, item);
//                     }
//                     return sum + (item[widget.data_field] || 0);
//                 }, 0);
//                 return <Statistic title={widget.title} value={kpiValue.toFixed(2)} />;

//             case 'pie_chart':
//                 const pieData = data.reduce((acc, item) => {
//                     const key = item[widget.data_field] || 'Unknown';
//                     acc[key] = (acc[key] || 0) + 1;
//                     return acc;
//                 }, {});

//                 const pieSeries = Object.values(pieData);
//                 const pieLabels = Object.keys(pieData);

//                 return (
//                     <ReactApexChart
//                         type="pie"
//                         series={pieSeries}
//                         options={{
//                             labels: pieLabels,
//                             legend: { position: 'bottom' },
//                         }}
//                     />
//                 );

//             case 'bar_chart':
//                 const barCategories = data.map((item) => item[widget.x_axis_field] || 'Unknown');
//                 const barSeriesData = data.map((item) => {
//                     if (widget.formula) {
//                         return calculateDerivedField(widget.formula, item);
//                     }
//                     return item[widget.y_axis_field] || 0;
//                 });

//                 return (
//                     <ReactApexChart
//                         type="bar"
//                         series={[{ name: widget.y_axis_field, data: barSeriesData }]}
//                         options={{
//                             xaxis: { categories: barCategories },
//                             legend: { position: 'top' },
//                         }}
//                     />
//                 );

//             case 'line_chart':
//                 const lineCategories = data.map((item) => item[widget.x_axis_field] || 'Unknown');
//                 const lineSeriesData = data.map((item) => {
//                     if (widget.formula) {
//                         return calculateDerivedField(widget.formula, item);
//                     }
//                     return item[widget.y_axis_field] || 0;
//                 });

//                 return (
//                     <ReactApexChart
//                         type="line"
//                         series={[{ name: widget.y_axis_field, data: lineSeriesData }]}
//                         options={{
//                             xaxis: { categories: lineCategories },
//                             legend: { position: 'top' },
//                         }}
//                     />
//                 );

//             case 'area_chart':
//                 const areaCategories = data.map((item) => item[widget.x_axis_field] || 'Unknown');
//                 const areaSeriesData = data.map((item) => {
//                     if (widget.formula) {
//                         return calculateDerivedField(widget.formula, item);
//                     }
//                     return item[widget.y_axis_field] || 0;
//                 });

//                 return (
//                     <ReactApexChart
//                         type="area"
//                         series={[{ name: widget.y_axis_field, data: areaSeriesData }]}
//                         options={{
//                             xaxis: { categories: areaCategories },
//                             legend: { position: 'top' },
//                         }}
//                     />
//                 );

//             case 'donut_chart':
//                 const donutData = data.reduce((acc, item) => {
//                     const key = item[widget.data_field] || 'Unknown';
//                     acc[key] = (acc[key] || 0) + 1;
//                     return acc;
//                 }, {});

//                 const donutSeries = Object.values(donutData);
//                 const donutLabels = Object.keys(donutData);

//                 return (
//                     <ReactApexChart
//                         type="donut"
//                         series={donutSeries}
//                         options={{
//                             labels: donutLabels,
//                             legend: { position: 'bottom' },
//                         }}
//                     />
//                 );

//             default:
//                 return <div>Unsupported widget type</div>;
//         }
//     };

//     return (
//         <Row gutter={[16, 16]}>
//             {widgets.map((widget) => (
//                 <Col key={widget.id} span={widget.size?.width || 8}>
//                     <Card title={widget.title} bordered>
//                         {renderWidget(widget)}
//                     </Card>
//                 </Col>
//             ))}
//         </Row>
//     );
// };

// export default DashboardView;










// JSON

// {
//     "widgets": [
//       {
//         "id": "kpi_total_salespeople",
//         "size": {
//           "width": 6,
//           "height": 200
//         },
//         "type": "kpi",
//         "title": "Total Onboarded Salespeople",
//         "data_field": "user"
//       },
//       {
//         "id": "pie_onboarding_progress",
//         "size": {
//           "width": 8,
//           "height": 300
//         },
//         "type": "pie_chart",
//         "title": "Onboarding Progress",
//         "data_field": "status"
//       },
//       {
//         "id": "pie_onboarding_priority",
//         "size": {
//           "width": 8,
//           "height": 300
//         },
//         "type": "pie_chart",
//         "title": "By Priority",
//         "data_field": "priority"
//       },
//       {
//         "id": "bar_lead_score_priority",
//         "size": {
//           "width": 12,
//           "height": 400
//         },
//         "type": "bar_chart",
//         "title": "Lead Score by Priority",
//         "x_axis_field": "priority",
//         "y_axis_field": "lead_score"
//       },
//       {
//         "id": "line_completion_time_trend",
//         "size": {
//           "width": 12,
//           "height": 400
//         },
//         "type": "line_chart",
//         "title": "Completion Time Trend",
//         "formula": "(new Date(item.completion_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60)",
//         "x_axis_field": "completion_date",
//         "y_axis_field": "completion_time"
//       },
//       {
//         "id": "area_lead_score_over_time",
//         "size": {
//           "width": 12,
//           "height": 400
//         },
//         "type": "area_chart",
//         "title": "Lead Score Over Time",
//         "x_axis_field": "created_at",
//         "y_axis_field": "lead_score"
//       },
//       {
//         "id": "donut_status_distribution",
//         "size": {
//           "width": 8,
//           "height": 300
//         },
//         "type": "donut_chart",
//         "title": "Status Distribution",
//         "data_field": "status"
//       },
//       {
//         "id": "bar_avg_lead_score",
//         "size": {
//           "width": 12,
//           "height": 400
//         },
//         "type": "bar_chart",
//         "title": "Average Lead Score by Priority",
//         "formula": "groupData.reduce((sum, item) => sum + item.lead_score, 0) / groupData.length",
//         "x_axis_field": "priority",
//         "y_axis_field": "lead_score"
//       },
//       {
//         "id": "line_avg_completion_time",
//         "size": {
//           "width": 12,
//           "height": 400
//         },
//         "type": "line_chart",
//         "title": "Average Completion Time by Date",
//         "formula": "groupData.reduce((sum, item) => sum + ((new Date(item.completion_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60)), 0) / groupData.length",
//         "x_axis_field": "completion_date",
//         "y_axis_field": "completion_time"
//       }
//     ]
//   }
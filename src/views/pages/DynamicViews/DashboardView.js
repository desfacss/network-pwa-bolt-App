import React from 'react';
import { Row, Col, Card, Statistic, Button } from 'antd';
import ReactApexChart from 'react-apexcharts';

const DashboardView = ({ data, metrics, viewConfig, onRefresh }) => {
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
        if (!data && !metrics) return <div>No data available. Please refresh.</div>;

        switch (widget.type) {
            case 'kpi':
                const kpiValue = metrics?.[widget.data_field] ?? 
                    data.reduce((sum, item) => {
                        if (widget.formula) {
                            return sum + calculateDerivedField(widget.formula, item);
                        }
                        return sum + (item[widget.data_field] || 0);
                    }, 0);
                return <Statistic title={widget.title} value={kpiValue.toFixed(2)} />;

            case 'pie_chart':
                const pieData = metrics?.[widget.data_field] ?? 
                    data.reduce((acc, item) => {
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
                const barGroupedData = metrics?.[widget.x_axis_field] ?? groupDataByField(data, widget.x_axis_field);
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
            case 'area_chart':
                const chartType = widget.type === 'line_chart' ? 'line' : 'area';
                const groupedData = metrics?.[widget.x_axis_field] ?? groupDataByField(data, widget.x_axis_field);
                const categories = Object.keys(groupedData);
                const seriesData = categories.map((category) => {
                    const groupData = groupedData[category];
                    if (widget.formula) {
                        return groupData.reduce((sum, item) => sum + calculateDerivedField(widget.formula, item, groupData), 0) / groupData.length;
                    }
                    return groupData.reduce((sum, item) => sum + (item[widget.y_axis_field] || 0), 0) / groupData.length;
                });

                return (
                    <ReactApexChart
                        type={chartType}
                        series={[{ name: widget.y_axis_field, data: seriesData }]}
                        options={{
                            xaxis: { categories },
                            legend: { position: 'top' },
                        }}
                    />
                );

            case 'donut_chart':
                const donutData = metrics?.[widget.data_field] ?? 
                    data.reduce((acc, item) => {
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
        <>
            <Button onClick={onRefresh} style={{ marginBottom: 16 }}>
                Refresh Data
            </Button>
            <Row gutter={[16, 16]}>
                {widgets.map((widget) => (
                    <Col key={widget.id} span={widget.size?.width || 8}>
                        <Card title={widget.title} bordered>
                            {renderWidget(widget)}
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default DashboardView;

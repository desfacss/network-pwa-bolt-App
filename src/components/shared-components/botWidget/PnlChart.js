import { apexLineChartDefaultOption, COLOR_2 } from 'constants/ChartConstant';
import React, { useEffect, useState } from 'react'
import ApexChart from "react-apexcharts";

const PnlChart = ({ file }) => {
    const [data, setData] = useState()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/data/${file}.csv`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.text();
                // Parse CSV data and transform it
                const transformedData = parseAndTransformCSV(data);
                setData(transformedData);
                // setChartData(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [file]);

    const parseAndTransformCSV = (csvString) => {
        // Parse CSV string into an array of objects
        const rows = csvString.split('\n');
        const headers = rows[0].split(',');
        const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index].trim();
                return obj;
            }, {});
        });

        // Extracting categories from the 'Date/Time' column
        const categories = data.map(item => item['Date/Time']);

        // Generating data for the "Session Duration" series from the 'Cum. Profit INR' column
        const cumPnl = data.map(item => parseFloat(item['Cum. Profit INR']));
        // const allPnl = data.map(item => parseFloat(item['Profit INR']));
        // setPnl(allPnl)
        // Generating data for the "Page Views" series from the 'Drawdown INR' column
        // const ddArray = data.map(item => parseFloat(item['Drawdown INR']));
        // const ddPtcArray = data.map(item => parseFloat(item['Drawdown %']));
        // setDdMax(Math.max(...ddArray, 0))
        // setDdPtcMax(Math.max(...ddPtcArray, 0))
        return {
            series: [
                // { name: "DD", data: ddArray },
                { name: "PnL", data: cumPnl },
            ],
            categories: categories
        };
    };

    const memberChartOption = {
        ...apexLineChartDefaultOption,
        ...{
            chart: {
                sparkline: {
                    enabled: true,
                }
            },
            colors: [COLOR_2],
        }
    }

    return (
        <>
            {data && <ApexChart
                options={memberChartOption}
                // {{ xaxis: { categories: data.categories } }}
                series={data.series}
            // height={145}
            // width={145}
            />}
        </>
    )
}

export default PnlChart
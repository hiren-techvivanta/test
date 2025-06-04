import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Charts = () => {
  // 7-day dummy data
  const last7Days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Static chart configurations
  const userChartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#f8f9fa",
      renderTo: "userChart",
    },
    title: {
      text: "User Activity",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
          ],
        },
      },
    },
    xAxis: {
      categories: last7Days,
    },
    yAxis: [
      {
        title: {
          text: "New Users",
        },
      },
      {
        title: {
          text: "Active Users",
        },
        opposite: true,
      },
    ],
    series: [
      {
        name: "New Users",
        type: "column",
        data: [45, 52, 38, 61, 49, 67, 58],
        color: "#007bff",
      },
      {
        name: "Active Users",
        type: "line",
        yAxis: 1,
        data: [320, 345, 298, 387, 356, 412, 398],
        color: "#28a745",
      },
    ],
  };

  const salesChartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#f8f9fa",
      renderTo: "salesChart",
    },
    title: {
      text: "Sales Comparison - Physical vs Virtual",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
          ],
        },
      },
    },
    xAxis: {
      categories: last7Days,
    },
    yAxis: {
      title: {
        text: "Sales ($)",
      },
    },
    series: [
      {
        name: "Physical Sales",
        data: [1200, 1450, 1100, 1650, 1350, 1800, 1550],
        color: "#17a2b8",
      },
      {
        name: "Virtual Sales",
        data: [2100, 2350, 1950, 2600, 2250, 2800, 2450],
        color: "#6610f2",
      },
    ],
  };

  const transferChartOptions = {
    chart: {
      type: "line",
      backgroundColor: "#f8f9fa",
      renderTo: "transferChart",
    },
    title: {
      text: "Mobile Recharge Transaction",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
          ],
        },
      },
    },
    xAxis: {
      categories: last7Days,
    },
    yAxis: {
      title: {
        text: "Amount ($)",
      },
    },
    series: [
      {
        name: "Mobile Recharge",
        data: [3400, 3800, 3200, 4100, 3900, 4300, 4000],
        color: "#fd7e14",
        marker: {
          symbol: "diamond",
        },
      },
    ],
  };

  const depositChartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#f8f9fa",
      renderTo: "depositChart",
    },
    title: {
      text: "Deposit vs Withdrawal Analysis",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
          ],
        },
      },
    },
    xAxis: {
      categories: last7Days,
    },
    plotOptions: {
      column: {
        grouping: true,
        shadow: false,
        borderWidth: 0,
      },
    },
    yAxis: {
      title: {
        text: "Amount ($)",
      },
    },
    series: [
      {
        name: "Total Deposits",
        type: "column",
        data: [8200, 7800, 9100, 8600, 9400, 10200, 9800],
        color: "#28a745",
      },
      {
        name: "Total Withdrawals",
        type: "column",
        data: [6100, 5800, 6700, 6300, 7100, 7800, 7400],
        color: "#dc3545",
      },
    ],
  };

  const utilityChartOptions = {
    chart: {
      type: "pie",
      backgroundColor: "#f8f9fa",
      renderTo: "utilityChart",
    },
    title: {
      text: "Utility Payments Breakdown",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
          ],
        },
      },
    },
    tooltip: {
      pointFormat:
        "{series.name}: <b>{point.percentage:.1f}%</b><br/>Value: <b>{point.y}</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "$",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.y}",
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Payments",
        colorByPoint: true,
        data: [
          {
            name: "Prepaid",
            y: 2500,
            sliced: true,
            selected: true,
          },
          {
            name: "Postpaid",
            y: 3200,
          },
          {
            name: "Fastag",
            y: 1800,
          },
          {
            name: "Gas Bill",
            y: 2100,
          },
          {
            name: "Flight Booking",
            y: 4500,
          },
          {
            name: "Train Booking",
            y: 1900,
          },
          {
            name: "Bus Booking",
            y: 1300,
          },
          {
            name: "Broadband",
            y: 1700,
          },
          {
            name: "Landline",
            y: 800,
          },
          {
            name: "Insurance",
            y: 3800,
          },
          {
            name: "Loan Installment",
            y: 5200,
          },
        ],
      },
    ],
  };

  return (
    <div className="container-fluid">
      <div className="row g-3">
        <div className="col-12">
          <h2 className="text-center mb-4">Dashboard Analytics</h2>
        </div>
      </div>

      {/* User Chart */}
      <div className="row mb-4 g-3">
        <div className="col-12">
          <HighchartsReact highcharts={Highcharts} options={userChartOptions} />
        </div>
        <div className="col-12">
          <HighchartsReact
            highcharts={Highcharts}
            options={salesChartOptions}
          />
        </div>
        <div className="col-12">
          <HighchartsReact
            highcharts={Highcharts}
            options={transferChartOptions}
          />
        </div>
        <div className="col-12">
          <HighchartsReact
            highcharts={Highcharts}
            options={depositChartOptions}
          />
        </div>
        <div className="col-12">
          <HighchartsReact
            highcharts={Highcharts}
            options={utilityChartOptions}
          />
        </div>
      </div>

      {/* Sales Charts Row */}
      {/* <div className="row mb-4">
        <div className="col-lg-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div id="salesChart" style={{ height: "350px" }}></div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div id="transferChart" style={{ height: "350px" }}></div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Deposit/Withdrawal and Utility Charts Row */}
      {/* <div className="row mb-4">
        <div className="col-lg-7 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div id="depositChart" style={{ height: "400px" }}></div>
            </div>
          </div>
        </div>
        <div className="col-lg-5 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div id="utilityChart" style={{ height: "400px" }}></div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Charts;

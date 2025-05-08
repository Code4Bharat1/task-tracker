'use client';

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ArrowUp } from "lucide-react";

// Demo data for different time periods
const demoDataMap = {
  'This Year': [
    { name: "Complete", value: 75, color: "#00FF00" },
    { name: "Incomplete", value: 25, color: "#FF0000" }
  ],
  'This Month': [
    { name: "Complete", value: 60, color: "#00FF00" },
    { name: "Incomplete", value: 40, color: "#FF0000" }
  ],
  'This Week': [
    { name: "Complete", value: 45, color: "#00FF00" },
    { name: "Incomplete", value: 55, color: "#FF0000" }
  ]
};

const TaskCompletedChart = ({ selected = 'This Year' }) => {
  const data = demoDataMap[selected] || demoDataMap['This Year'];
  const completeValue = data.find(d => d.name === 'Complete')?.value || 0;

  return (
<div
  className="w-auto h-[350px] rounded-[20px] bg-white p-5 shadow-[1px_4px_10px_lightgray] font-sans"
>

<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
<h2 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginTop: '0.5rem' }}>TASK COMPLETED</h2>
<div
  style={{
    display: "flex",
    alignItems: "center",
    color: "green",
    fontWeight: "bold",
  }}
>
        <div>
        <div className="flex row">
          <ArrowUp size={19} />
          &nbsp;{completeValue}% Increase
        </div>  
          
        <div style={{  fontSize: "14px" }} >
        <div className="pl-[1rem]">
        <div style={{ color: "green" }}>🟢 Complete</div>
        <div style={{ color: "red" }}>🔴 Incomplete</div>
        </div>
        </div>
      </div>
          
        </div>
      </div>

      <h1 style={{ margin: "8px 0", fontWeight: "800", paddingLeft: "1rem", fontSize: "22px" }}>{completeValue}%</h1>

      <div style={{ position: "relative", width: "300px", height: "200px", margin: "0 auto" }}>
        <PieChart width={300} height={200}>
          <Pie
      data={data}
      cx={150}
      cy={100}
      innerRadius={30}
      outerRadius={80}
      dataKey="value"
      startAngle={90}
      endAngle={-270}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>

  <div
    style={{
      position: "absolute",
      top: "52%",
      left: "53%",
      transform: "translate(-50%, -50%)",
      fontSize: "24px",
      fontWeight: "bold",
    }}
  >
    {completeValue}%
  </div>
</div>
</div>

  );
};

export default TaskCompletedChart;

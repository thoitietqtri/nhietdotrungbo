import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function StationChart({ rows }) {

  const data = rows.map((r) => ({
    time: r["Thời gian"],
    temp: r["Nhiệt độ"],
  }));

  return (
    <div style={{ width: "100%", height: 400 }}>

      <ResponsiveContainer>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temp"
            stroke="#ff0000"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}
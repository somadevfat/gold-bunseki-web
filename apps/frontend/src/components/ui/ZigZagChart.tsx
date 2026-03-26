"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ZigZagPoint {
  Timestamp: string;
  Price: number;
  Type: "High" | "Low";
}

interface ZigZagChartProps {
  points: ZigZagPoint[];
}

export default function ZigZagChart({ points }: ZigZagChartProps) {
  const labels = points.map((p) => {
    const d = new Date(p.Timestamp);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  });

  const dataValues = points.map((p) => p.Price);
  
  // Notionのデータベースタグのような落ち着いた緑と赤
  const pointColors = points.map((p) => (p.Type === "High" ? "#15803d" : "#b91c1c"));

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "XAU/USD",
        data: dataValues,
        borderColor: "#6366f1", // indigo-500
        backgroundColor: "rgba(99, 102, 241, 0.05)",
        borderWidth: 1.5,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#0a0f18",
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0, 
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500, 
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a", // slate-900
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 10,
        borderColor: "#1e293b", // slate-800
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex;
            const pt = points[index];
            return `$${ctx.raw} (${pt.Type})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false }, 
        ticks: { color: "#475569", font: { size: 10 } },
      },
      y: {
        grid: { color: "#1e293b" },
        ticks: { color: "#475569", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[350px]">
      <Line data={data} options={options} />
    </div>
  );
}

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeSeriesScale,
} from "chart.js";
import * as AdapterMoment from "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeSeriesScale,
  AdapterMoment
);

export const options = {
  responsive: true,
  scales: {
    x: {
      type: "linear",
    },
    y: {
      type: "timeseries",
      displayFormats: {
        quarter: "MMM YYYY",
      },
    },
  },
};

export function Plot({ points }) {
  const data = useMemo(
    () => ({
      datasets: [
        {
          fill: true,
          data: points,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    }),
    [points]
  );
  return <Line options={options} data={data} />;
}

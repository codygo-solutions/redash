import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  ChartData,
  ChartArea,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Chart } from "react-chartjs-2";
import Colors from '../../ColorPalette'

import { ExternalTooltipHandler } from "./ExternalTooltipHandler";
import getChartData from './getChartData';
import { formatNumber } from '@/services/formatNumber';

const colorsArray = Object.values(Colors)

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, BarController);
export type HorizontalBarChartVariant = "redGradient" | "purpleGradient";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createGradient(ctx: any, area: ChartArea, variant?: HorizontalBarChartVariant, hovered = false) {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);

  if (!hovered) {
    if (variant === "purpleGradient") {
      gradient.addColorStop(0, "#F2E1FB");
      gradient.addColorStop(0.2, "#DFB5F5");
      gradient.addColorStop(0.4, "#CD88EF");
      gradient.addColorStop(0.6, "#C06AEB");
      gradient.addColorStop(0.8, "#8D37B8");
      gradient.addColorStop(1, "#7B1FA2");
    } else {
      gradient.addColorStop(0, "#FBD9E4");
      gradient.addColorStop(0.2, "#F7B3CA");
      gradient.addColorStop(0.4, "#F48CAF");
      gradient.addColorStop(0.6, "#EC407A");
      gradient.addColorStop(0.8, "#BD3362");
      gradient.addColorStop(1, "#97294E");
    }
  } else {
    if (variant === "purpleGradient") {
      gradient.addColorStop(0, "#C0B2C7");
      gradient.addColorStop(1, "#2E0C3D");
    } else {
      gradient.addColorStop(0, "#C7ACB5");
      gradient.addColorStop(1, "#4A1426");
    }
  }

  return gradient;
}

export default function Renderer ({ data, options }: any) {
  const preppedData = getChartData(data.rows, options)
  return (
    <SafeHorizontalBarChart data={preppedData} variant={options.colorScheme} direction={options.type} />
  );
}

function SafeHorizontalBarChart({ data, variant = "redGradient", direction }: { data: ReturnType<typeof getChartData>, direction: string, variant: HorizontalBarChartVariant }) {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    datasets: [],
  });
  const [activeElement, setActiveElement] = useState<number | null>(null);
  const [chartMouseOver, setChartMouseOver] = useState(false);
  const isVertical = direction === "vertical"

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    setChartData({
      datasets: data
        .map((col) => ({
          type: 'bar',
          label: col.name,
          data: col.data as any,
          barThickness: 48,
          backgroundColor: (args: any) => direction === "horizontal" ? createGradient(chart.ctx, chart.chartArea, variant) : colorsArray[args.dataIndex % colorsArray.length],
          hoverBorderColor: () => {
            // @ts-ignore
            return createGradient(chart.ctx, chart.chartArea, variant, true);
          },
          hoverBorderWidth: 2,
          tooltipColor: () => {
            if (variant === "redGradient") {
              return "#97294E";
            }
            if (variant === "purpleGradient") {
              return "#7B1FA2";
            }
            return "#000000";
          }
        })),
    });
    chart.update();
  }, [data, activeElement, chartMouseOver]);

  return (
    <Chart
      type="bar"
      ref={chartRef}
      style={{ maxWidth: "100%", minHeight: "330px" }}
      width={"100%"}
      height={"100%"}
      onMouseEnter={() => setChartMouseOver(true)}
      onMouseLeave={() => {
        setChartMouseOver(false);
        setActiveElement(-1);
      }}
      // plugins={[ChartDataLabels]}
      options={{
        indexAxis: isVertical ? "x" : "y",
        parsing: {
          xAxisKey: isVertical ? "x" : "y",
          yAxisKey: isVertical ? "y" : "x",
        },
        maintainAspectRatio: false,
        responsive: true,
        layout: {
          padding: {
            left: 24,
            right: 24,
          },
        },
        elements: {
          bar: {
            borderWidth: 0,
            borderRadius: 8,
          },
        },
        scales: {
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12 }, color: "#474E6A",
              ...(isVertical ? {
                callback: (value) => formatNumber(value as any)
              } : {}),
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12 }, color: "#A6B5D3",
              ...(!isVertical ? {
                callback: (value) => formatNumber(value as any)
              } : {}),
            },
          },
        },

        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            position: "nearest",
            external: ExternalTooltipHandler,
          },
          // datalabels: {
          //   anchor: 'end',
          //   align: 'left',
          //   color: function (context) {
          //     // if (context.dataIndex <= 4) {
          //     //   return 'rgba(106, 114, 144, 1)';
          //     // }
          //     return 'rgba(251, 253, 255, 1)';
          //   },
          //   display: function (context) {
          //     if (chartMouseOver && context.dataIndex === activeElement) {
          //       return true;
          //     }
          //     return false; // display labels with an odd index
          //   },
          // },
        },
        onHover: (_, elements) => (elements.length ? setActiveElement(elements[0].index) : setActiveElement(-1)),
      }}
      data={chartData}
    />
  );
}

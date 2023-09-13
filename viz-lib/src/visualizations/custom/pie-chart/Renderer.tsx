import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import useSize from "@react-hook/size";
import { interpolatePath } from "d3-interpolate-path";
import Colors from "@/visualizations/ColorPalette"

import { formatNumber } from "../shared/formatNumber";

import "./Renderer.less";

interface Datum {
  title: string;
  discountPercentage: number;
}

const CIRCLE_THICKNESS = 20;
const CIRCLE_EXPAND = 5;
const SEGMENTS_GROW = 0.13;
const CORNER_RADIUS = 40;

const MIN_CHART_RADIUS = 85;
const MAX_CHART_RADIUS = 125;
const CHART_PADDING = 28;

const BIG_SCREEN_BREAKPOINT = 300;

const MIN_ARC = 4.5;

const colors = Object.values(Colors);

export default function Renderer({ options, data }: any) {
  const slicedData = data.rows.slice(0, 4);

  return <SafePieChart data={slicedData} />;
}

function SafePieChart({ data }: { data: Datum[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);
  const isBigScreen = width >= BIG_SCREEN_BREAKPOINT;

  useEffect(() => {
    const svg = d3.select(ref.current);

    const maxRadiusX = width / 2 - CHART_PADDING;
    const maxRadiusY = height / 2 - CHART_PADDING;
    const chartRadius = Math.max(Math.min(maxRadiusX, maxRadiusY, MAX_CHART_RADIUS), MIN_CHART_RADIUS);

    const chartLeftPadding = isBigScreen ? width / 2 : chartRadius + CHART_PADDING / 2;

    const g = svg.append("g").attr("transform", `translate(${chartLeftPadding},${height / 2})`);

    const colorDomain = data.map(({ title }) => title);
    const colorScale = d3.scaleOrdinal(colors).domain(colorDomain);

    const pie = d3
      .pie<Datum>()
      .value(function(d) {
        return d.discountPercentage;
      })
      .sort(null);

    createPieChart(data, g, pie, colorScale, chartRadius);
    createPieChartTooltip(g);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [width, height]);

  return (
    <div className="pie-chart-container">
      <div style={{ flexGrow: "1" }} ref={containerRef}>
        <svg ref={ref} width="100%" height="100%"></svg>
      </div>
      <div className="legend-container">
        {data.map((d, i) => (
          <div className="legend-item" key={i}>
            <div style={{ backgroundColor: colors[i], height: "12px", width: "12px", borderRadius: "9999px" }} />

            <div className="legend-title">{d.title}</div>

            <div className="legend-value">{getPercent(data, d.discountPercentage)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPercent(data: Datum[], y: number) {
  const sum = data.reduce<number>((s, d) => s + d.discountPercentage, 0);
  const percent = (y / sum) * 100;

  if (percent < 1) {
    return parseFloat(percent.toFixed(1));
  }
  return Math.round(percent);
}

function createPieChart(
  data: Datum[],
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  pie: d3.Pie<unknown, Datum>,
  colorScale: d3.ScaleOrdinal<string, string, never>,
  chartRadius: number
) {
  const path = d3
    .arc<d3.PieArcDatum<Datum>>()
    .outerRadius(chartRadius)
    .innerRadius(chartRadius - CIRCLE_THICKNESS)
    .startAngle(function(d) {
      return d.startAngle - SEGMENTS_GROW;
    })
    .cornerRadius(CORNER_RADIUS);

  const pathHover = d3
    .arc<d3.PieArcDatum<Datum>>()
    .innerRadius(chartRadius + CIRCLE_EXPAND)
    .outerRadius(chartRadius - CIRCLE_THICKNESS - CIRCLE_EXPAND)
    .startAngle(function(d) {
      return d.startAngle - SEGMENTS_GROW;
    })
    .cornerRadius(CORNER_RADIUS);

  const pieData = createPieData(data);

  const arc = g
    .selectAll(".arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arc
    .append("path")
    .attr("d", path)
    .attr("stroke-width", "4px")
    .attr("stroke", "white")
    .attr("fill", function(d) {
      return colorScale(d.data.title);
    })
    .on("mouseover", function(_, d) {
      d3.select(this)
        .transition()
        .duration(300)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .attrTween("d", (d: d3.PieArcDatum<Datum>) => {
          const previous = d3.select(this).attr("d");
          const current = pathHover(d);

          return current ? interpolatePath(previous, current) : null;
        });

      const x = d.data.title;
      const dataItem = data.find(d => d.title === x);

      if (dataItem) {
        d3.select("#pie-value")
          .text(formatNumber(dataItem.discountPercentage))
          .transition()
          .duration(300)
          .style("opacity", 1);
        d3.select("#pie-title")
          .text(d.data.title)
          .transition()
          .duration(300)
          .style("opacity", 1);
      }
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(300)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .attrTween("d", (d: d3.PieArcDatum<Datum>) => {
          const previous = d3.select(this).attr("d");
          const current = path(d);

          return current ? interpolatePath(previous, current) : null;
        });
      d3.select("#pie-value")
        .transition()
        .duration(300)
        .style("opacity", 0);
      d3.select("#pie-title")
        .transition()
        .duration(300)
        .style("opacity", 0);
    });

  g.select(".arc:first-child").raise();
}

function createPieChartTooltip(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
  g.append("text")
    .attr("id", "pie-value")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("letter-spacing", "-2px")
    .style("opacity", 0)
    .style("font-family", "Inter")
    .style("font-weight", 500)
    .style("fill", "#6A7290")
    .style("font-size", "48px");

  g.append("text")
    .attr("id", "pie-title")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(0, 40)`)
    .style("opacity", 0)
    .style("font-family", "Inter")
    .style("fill", "#353B4F")
    .style("font-size", "14px");
}

function createPieData(data: Datum[]) {
  // enlarge small elements to a threshold, calculate pie chart arc lengths (in percent)
  const itemsBelowThreshold = data.filter(d => {
    const y = d.discountPercentage;
    const curPercent = getPercent(data, y);

    return curPercent <= MIN_ARC;
  });
  const itemsAboveThreshold = data.filter(d => {
    const y = d.discountPercentage;
    const curPercent = getPercent(data, y);

    return curPercent > MIN_ARC;
  });

  const aboveThresholdFraction = 100 - itemsBelowThreshold.length * MIN_ARC;
  const aboveThresholdSum = itemsAboveThreshold.reduce((s, d) => s + d.discountPercentage, 0);

  const pieData = data
    .filter(d => d.discountPercentage > 0)
    .map(d => {
      const y = d.discountPercentage;

      const curPercent = getPercent(data, y);

      const newPercent =
        curPercent <= MIN_ARC ? MIN_ARC : (d.discountPercentage / aboveThresholdSum) * aboveThresholdFraction;

      return {
        title: d.title,
        discountPercentage: newPercent,
      };
    });

  return pieData;
}

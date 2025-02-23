// @ts-nocheck
import React, { useEffect, useRef, useState, MouseEvent } from "react"
import * as d3 from "d3";
import * as d3Array from "d3-array";
import useSize from "@react-hook/size";
import Select from "react-select";
import Colors from "@/visualizations/ColorPalette"
import { formatNumber } from '@/services/formatNumber';

import getData from "./getData";

import "./Renderer.less";

import Cross from "./Cross";

interface Datum {
  x: string;
  y: number;
}

type TooltipData = {
  date: string;
  values: {
    contract: string;
    y: number;
    color: string;
  }[];
};

const colors = Object.values(Colors);

const PRIMARY_LINE_WIDTH = 8;
const DEFAULT_LINE_WIDTH = 4;

const CHART_LEFT_MARGIN = 48;
const CHART_BOTTOM_MARGIN = 24;

const AXIS_X_BOTTOM_MARGIN = 48;
const AXIS_Y_LEFT_MARGIN = 24;

const PRIMARY_CONTRACT_PIN_SIZE = 36;
const DEFAULT_CONTRACT_PIN_SIZE = 20;

export default function Renderer(input: any) {
  const data = getData(input.data.rows, input.options);

  const columns = Object.keys(data);

  return <SeriesLineChart data={data} columns={columns} type={input.options.type} />;
}

function SeriesLineChart({ data, columns, type }: { data: Record<string, Datum[]>, columns: string[], type: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(containerRef);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "n/a",
    values: [{ contract: "n/a", y: "0", color: "#FF0000" }],
  });

  const options = columns.map((column) => ({
    value: column,
    label: column,
  }));

  const [selectedOptions, setSelectedOptions] = useState(options);

  const handleSelectChange = (selectedOptions: any) => {
    setSelectedOptions(selectedOptions);
  };

  useEffect(() => {
    const svg = d3.select(ref.current);
    const g = svg.append("g").attr("transform", `translate(0,${CHART_BOTTOM_MARGIN})`);
    const selectedColumns = selectedOptions.map(i => i.value);
    const sampleData = selectedColumns.map((c) => data[c]?.data).filter(Boolean).flat();
    const { xScale, yScale } = createScales(width, height, sampleData);

    createSeriesLineChartAxis(g, xScale, yScale, height);
    const chartArea = createSeriesLineChart(type, g, xScale, yScale, width, data, selectedColumns);
    createSeriesLineChartGradients(g, width, height);
    createSeriesLineChartCursor(
      type,
      tooltipRef,
      setTooltipData,
      chartArea,
      xScale,
      yScale,
      height,
      sampleData,
      data,
      columns
    );

    return () => {
      svg.selectAll("*").remove();
    };
  }, [width, height, selectedOptions]);

  const handleRemoveValue = (e: MouseEvent<HTMLButtonElement>) => {
    const { name: buttonName } = e.currentTarget;
    const removedValue = selectedOptions.find(val => val.label === buttonName);

    if (!removedValue) return;
    handleSelectChange(selectedOptions.filter(val => val.label !== buttonName));
  };

  return (
    <div className="line-chart-container">
      {
        type === "multiple" && (
          <div className="chart-controls">
            <div className="chart-title">Your audience</div>

            <div className="chart-typography" style={{ marginLeft: "12px" }}>
              Compare with:
            </div>

            <Select
              isMulti
              placeholder="Insert contract name"
              options={options}
              value={selectedOptions}
              defaultValue={selectedOptions[0]}
              className="basic-multi-select"
              controlShouldRenderValue={false}
              onChange={handleSelectChange}
            />

            {/* <ContractsSelect
              mustTypeFirst
              onChange={handleSelectChange}
              value={selected}
              loadOptions={contractLoadOptions}
              className={`contracts-multi-line-chart ${loading || error ? "pointer-events-none" : ""}`}
              placeholder="Insert contract name"
              customizedOptions={ContractsAutocomplete}
              optionStyles={{ backgroundColor: "white !important" }}
            /> */}

            <div className="bullets-container">
              {selectedOptions.map(
                (val, i) => (
                  <div className="bullet-item" key={i} style={{ backgroundColor: `${colors[i]}20`, color: colors[i] }}>
                    {val.label}
                     <button name={val.label} className="bullet-button" onClick={handleRemoveValue}>
                      <Cross fill={colors[i]} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )
      }
      <div className="chart-wrapper">
        <div className="tooltip-container" ref={tooltipRef}>
          <div className="chart-typography">{tooltipData.date}</div>
          {tooltipData.values.map((item, i) => (
            <div key={i} className="tooltip-item-wrapper">
              <div
                className="tooltip-item"
                style={{ backgroundColor: item.color }}
              />
              <div className="chart-tooltip-value">{item.y}</div>
            </div>
          ))}
        </div>
        <div ref={containerRef} style={{ height: "100%" }}>
          <svg ref={ref} width="100%" height="100%"></svg>
        </div>
      </div>
    </div>
  );
}

function createScales (width: number, height: number, fullData: Datum[]) {
  const xExtent = d3.extent(fullData, d => d.x);
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'time' does not exist on type 'typeof im... Remove this comment to see the full error message
  const xScale = d3.time.scale()
    .domain(xExtent)
    .range([0, width - AXIS_Y_LEFT_MARGIN]);

  const yExtent = d3.extent(fullData, d => Number(d.y));
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'scale' does not exist on type 'typeof im... Remove this comment to see the full error message
  const yScale = d3.scale
    .linear()
    .domain([0, yExtent[1]])
    .range([height - AXIS_X_BOTTOM_MARGIN, 0])
    .nice();

  return { xScale, yScale };
}

function createLineGradient(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  color: string,
  id: string,
  width: number
) {
  g.append("linearGradient")
    .attr("id", id)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width)
    .attr("y2", 0)
    .selectAll("stop")
    .data([
      { offset: "0%", color: `${color}08` },
      { offset: "10%", color: `${color}80` },
      { offset: "50%", color: color },
      { offset: "90%", color: `${color}80` },
      { offset: "100%", color: `${color}08` },
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });

  return id;
}

function createSeriesLineChartGradients(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number
) {
  g.append("linearGradient")
    .attr("id", "pin-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", height - AXIS_X_BOTTOM_MARGIN)
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#AA00FF" },
      { offset: "50%", color: "#B045E680" },
      { offset: "100%", color: "#C87DEE00" },
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });
}

function createSeriesLineChart (
  type: string,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number, never>,
  yScale: d3.ScaleLinear<number, number, never>,
  width: number,
  data: any,
  selectedColumns: string[]
) {
  const chartArea = g.append("g");
  const createChartLine = d3.svg.line()
    .interpolate("basis")
    .x(function(d) {
      return xScale(d.x);
    })
    .y(function(d) {
      return yScale(d.y);
    });

  selectedColumns.forEach((columnName, i) => {
    const gradientId = createLineGradient(g, colors[i], `line-${i}`, width);
    chartArea
      .append("path")
      .attr("stroke", `url(#${gradientId})`)
      .style("stroke-width", type === "single" ? PRIMARY_LINE_WIDTH : DEFAULT_LINE_WIDTH)
      .style("fill", "none")
      // @ts-ignore
      .attr("d", createChartLine(data[columnName]?.data ?? []));
  });

  return chartArea;
}

function createSeriesLineChartAxis(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number, never>,
  yScale: d3.ScaleLinear<number, number, never>,
  height: number
) {
  const xAxis = d3
    .svg.axis()
    .orient("bottom")
    .scale(xScale)
    .tickFormat(d3.time.format("%m.%d"))
    //.ticks(d3.timeDay, 1)
    .tickSize(0);
  const yAxis = d3
    .svg.axis()
    .scale(yScale)
    .orient("left")
    .tickFormat(x => formatNumber(x as number))
    .tickSize(0);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${CHART_LEFT_MARGIN},${height - AXIS_X_BOTTOM_MARGIN})`)
    .call(xAxis)
    .call(g => g.select(".domain").remove());
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${AXIS_Y_LEFT_MARGIN},0)`)
    .call(yAxis)
    .call(g => g.select(".domain").remove());

  g.selectAll(".tick text").attr("class", "text-xs text-gray-300 font-light font-[Inter]");
}

function createSeriesLineChartCursor(
  type: string,
  tooltipRef: React.RefObject<HTMLDivElement>,
  setTooltipData: React.Dispatch<React.SetStateAction<TooltipData>>,
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number, never>,
  yScale: d3.ScaleLinear<number, number, never>,
  height: number,
  fullData: Datum[],
  data: any,
  columns: string[]
) {
  const chartWidth = chartArea.node()?.getBBox().width;
  const chartHeight = chartArea.node()?.getBBox().height;

  if (!chartWidth || !chartHeight) {
    return;
  }

  const xAxisLine = chartArea
    .append("g")
    .append("rect")
    .attr("stroke", "url(#pin-gradient)")
    .attr("stroke-width", "1px")
    .attr("fill", "none")
    .style("opacity", 0)
    .attr("width", "1px")
    .attr("height", height);

  const xAccessor = (d: Datum) => d?.x;

  const tooltipCircles = columns.map(function(key) {
    return chartArea
      .append("image")
      .attr("xlink:href", "/static/images/chart-pin.svg")
      .attr("width", type === "single" ? PRIMARY_CONTRACT_PIN_SIZE : DEFAULT_CONTRACT_PIN_SIZE)
      .attr("height", type === "single" ? PRIMARY_CONTRACT_PIN_SIZE : DEFAULT_CONTRACT_PIN_SIZE)
      .attr(
        "transform",
        type === "single"
          ? `translate(-${PRIMARY_CONTRACT_PIN_SIZE / 2}, -${(PRIMARY_CONTRACT_PIN_SIZE - PRIMARY_LINE_WIDTH) / 2})`
          : `translate(-${DEFAULT_CONTRACT_PIN_SIZE / 2}, -${(DEFAULT_CONTRACT_PIN_SIZE - DEFAULT_LINE_WIDTH) / 2})`
      )
      .style("opacity", 0);
  });

  const tooltip = d3.select(tooltipRef.current).style("opacity", "0");

  chartArea
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "transparent")
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  function onMouseMove(this: SVGRectElement | null, event: MouseEvent) {
    const mousePosition = d3.mouse(this);
    const hoveredDate = xScale.invert(mousePosition[0]);
    const getDistanceFromHoveredDate = (d: Datum) => Math.abs(xAccessor(d).valueOf() - hoveredDate.valueOf());

    const closestIndex = d3Array.leastIndex(
      fullData,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );

    if (!closestIndex) return;

    const closestDataPoint = fullData[closestIndex];
    const closestXValue = xAccessor(closestDataPoint);

    xAxisLine.attr("x", xScale(closestXValue));

    columns.forEach(function(column, i) {
      tooltipCircles[i]
        .attr("x", xScale(closestXValue))
        .attr("y", yScale(data[column]?.data[closestIndex]?.y))
        .style("opacity", 1);
    });

    const tooltipX = xScale(closestXValue) - parseInt(tooltip.style("width"), 10) / 2;
    const tooltipValues = columns.map((column, i) => ({
      contract: column,
      y: formatNumber(data[column].data[closestIndex].y),
      color: colors[i],
    }));

    setTooltipData({
      date: d3.time.format("%B %d, %Y")(new Date(closestXValue)),
      values: tooltipValues,
    });
    tooltip.style("transform", `translate(${tooltipX}px, 0px)`).style("opacity", "1");
    xAxisLine.style("opacity", 1);
  }

  function onMouseLeave() {
    xAxisLine.style("opacity", 0);
    tooltip.style("opacity", 0);
    tooltipCircles.forEach(d => d.style("opacity", 0));
  }
}

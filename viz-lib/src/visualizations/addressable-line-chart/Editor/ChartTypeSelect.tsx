// @ts-nocheck

import { map } from "lodash";
import React from "react";
import { Select } from "@/components/visualizations/editor";

const allChartTypes = [
  { type: "single", name: "Single", icon: "line-chart" },
  { type: "multiple", name: "Multiple", icon: "line-chart" },
];

export default function ChartTypeSelect(props) {
  const chartTypes = allChartTypes

  return (
    <Select {...props}>
      {map(chartTypes, ({ type, name, icon }) => (
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message
        <Select.Option key={type} value={type} data-test={`LineChart.ChartType.${type}`}>
          <i className={`fa fa-${icon}`} style={{ marginRight: 5 }} />
          {name}
          {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message */}
        </Select.Option>
      ))}
    </Select>
  );
}

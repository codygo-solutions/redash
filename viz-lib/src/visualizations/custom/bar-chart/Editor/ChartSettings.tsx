import { isArray, map, mapValues, includes, some, each, difference, toNumber } from "lodash";
import React, { useMemo } from "react";
import { Section, Select } from "@/components/visualizations/editor";
import { UpdateOptionsStrategy } from "@/components/visualizations/editor/createTabbedEditor";
import { EditorPropTypes } from "@/visualizations/prop-types";

import ColumnMappingSelect from "./ColumnMappingSelect";
import ChartTypeSelect from './ChartTypeSelect';

const colorSchemes = {
  purpleGradient: "Purple Gradient",
  redGradient: "Red Gradient",
};

function getMappedColumns(options: any, availableColumns: any) {
  const mappedColumns = {};
  const availableTypes = ["x", "y"];
  each(availableTypes, type => {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    mappedColumns[type] = ColumnMappingSelect.MappingTypes[type].multiple ? [] : null;
  });

  availableColumns = map(availableColumns, c => c.name);
  const usedColumns: any = [];

  each(options.columnMapping, (type, column) => {
    if (includes(availableColumns, column) && includes(availableTypes, type)) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      const { multiple } = ColumnMappingSelect.MappingTypes[type];
      if (multiple) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        mappedColumns[type].push(column);
      } else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        mappedColumns[type] = column;
      }
      usedColumns.push(column);
    }
  });

  return {
    mappedColumns,
    unusedColumns: difference(availableColumns, usedColumns),
  };
}

function mappedColumnsToColumnMappings(mappedColumns: any) {
  const result = {};
  each(mappedColumns, (value, type) => {
    if (isArray(value)) {
      each(value, v => {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result[v] = type;
      });
    } else {
      if (value) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result[value] = type;
      }
    }
  });
  return result;
}

export default function ChartSettings({ data, options, onOptionsChange }: any) {
  const { mappedColumns, unusedColumns } = useMemo(() => getMappedColumns(options, data.columns), [
    options,
    data.columns,
  ]);

  function handleTypeChange(type: any) {
    onOptionsChange({
      type,
      swappedAxes: false,
      seriesOptions: mapValues(options.seriesOptions, series => ({
        ...series,
        type,
      })),
    });
  }

  function handleColumnMappingChange(column: any, type: any) {
    const columnMapping = mappedColumnsToColumnMappings({
      ...mappedColumns,
      [type]: column,
    });
    onOptionsChange({ columnMapping }, UpdateOptionsStrategy.shallowMerge);
  }

  return (
    <React.Fragment>
      {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
      <Section>
        <ChartTypeSelect
          label="Chart Type"
          data-test="BarChart.type"
          defaultValue={options.type}
          onChange={handleTypeChange}
        />
      </Section>
      {options.type === "horizontal" && (
        /* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */
        <Section>
          <Select
            label="Color Scheme"
            data-test="BarChart.ColorScheme"
            defaultValue={options.colorScheme}
            onChange={(colorScheme: any) => onOptionsChange({ colorScheme })}>
            {map(colorSchemes, (name, value) => (
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message
              <Select.Option key={value} data-test={`BarChart.ColorScheme.${value}`}>
                {name}
                {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message */}
              </Select.Option>
            ))}
          </Select>
          </Section>
      )}
      {map(mappedColumns, (value, type) => (
        <ColumnMappingSelect
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
          key={type}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
          type={type}
          value={value}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown[]' is not assignable to type 'never'... Remove this comment to see the full error message
          availableColumns={unusedColumns}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '(column: any, type: any) => void' is not ass... Remove this comment to see the full error message
          onChange={handleColumnMappingChange}
        />
      ))}
    </React.Fragment>
  );
}

ChartSettings.propTypes = EditorPropTypes;

// @ts-nocheck

import { isString, map, uniq, flatten, filter, sortBy } from "lodash";
import React from "react";
import { Section, Select } from "@/components/visualizations/editor";

const MappingTypes = {
  x: { label: "X Column" },
  y: { label: "Y Column", multiple: true },
  series: { label: "Group by" },
  thumbnail: { label: "Thumbnail Link" },
};

type OwnProps = {
  options: any;
  value?: string | string[];
  availableColumns?: string[];
  type?: any; // TODO: PropTypes.oneOf(keys(MappingTypes))
  onChange?: (...args: any[]) => any;
};

type Props = OwnProps & typeof ColumnMappingSelect.defaultProps;

export default function ColumnMappingSelect({ options: vizOptions, value, availableColumns, type, onChange }: Props) {
  const options = sortBy(filter(uniq(flatten([availableColumns, value])), v => isString(v) && v !== ""));

  // this swaps the ui, as the data will be swapped on render
  const { label } = MappingTypes[type];
  const multiple = vizOptions.type === "multiple" ? MappingTypes[type].multiple : false;

  return (
    // @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
    <Section>
      <Select
        label={label}
        data-test={`LineChart.ColumnMapping.${type}`}
        mode={multiple ? "multiple" : "default"}
        allowClear
        showSearch
        placeholder={multiple ? "Choose columns..." : "Choose column..."}
        value={value || undefined}
        // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
        onChange={(column: any) => onChange(column || null, type)}>
        {map(options, c => (
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message
          <Select.Option key={c} value={c} data-test={`LineChart.ColumnMapping.${type}.${c}`}>
            {c}
            {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'Option' does not exist on type '({ class... Remove this comment to see the full error message */}
          </Select.Option>
        ))}
      </Select>
    </Section>
  );
}

ColumnMappingSelect.defaultProps = {
  value: null,
  availableColumns: [],
  type: null,
  onChange: () => { },
  options: {}
};

ColumnMappingSelect.MappingTypes = MappingTypes;

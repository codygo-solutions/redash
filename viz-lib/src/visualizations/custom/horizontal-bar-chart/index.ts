import { merge } from "lodash";

import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
  column: "",
  frequenciesColumn: "",
  wordLengthLimit: { min: null, max: null },
  wordCountLimit: { min: null, max: null },

  sortX: true,
  legend: { enabled: true, placement: "auto", traceorder: "normal" },
  xAxis: { type: "-", labels: { enabled: true } },
  yAxis: [{ type: "linear" }, { type: "linear", opposite: true }],
  alignYAxesAtZero: false,
  error_y: { type: "data", visible: true },
  series: { stacking: null, error_y: { type: "data", visible: true } },
  seriesOptions: {},
  valuesOptions: {},
  columnMapping: {},
  direction: { type: "counterclockwise" },
  sizemode: "diameter",
  coefficient: 1,

  // showDataLabels: false, // depends on chart type
  numberFormat: "0,0[.]00000",
  percentFormat: "0[.]00%",
  // dateTimeFormat: 'DD/MM/YYYY HH:mm', // will be set from visualizationsSettings
  textFormat: "", // default: combination of {{ @@yPercent }} ({{ @@y }} ± {{ @@yError }})

  missingValuesAsZero: true,
};

export default {
  type: "HORIZONTAL_BAR_CHART",
  name: "Horizontal Bar Chart",
  getOptions: (options: any) => merge({}, DEFAULT_OPTIONS, options),
  Renderer,
  Editor,

  defaultRows: 8,
};

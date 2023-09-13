import { merge } from "lodash";

import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
  type: "vertical",

  seriesOptions: {},
  columnMapping: {},
};

export default {
  type: "BAR_CHART",
  name: "Bar Chart",
  getOptions: (options: any) => merge({}, DEFAULT_OPTIONS, options),
  Renderer,
  Editor,

  defaultRows: 8,
};

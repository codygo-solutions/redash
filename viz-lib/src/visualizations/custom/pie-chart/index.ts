import { merge } from "lodash";

import Renderer from "./Renderer";
import Editor from "./Editor/";

const DEFAULT_OPTIONS = {
  seriesOptions: {},
  columnMapping: {},
};

export default {
  type: "PIE_CHART",
  name: "Pie Chart",
  getOptions: (options: any) => merge({}, DEFAULT_OPTIONS, options),
  Renderer,
  Editor,

  defaultRows: 8,
};

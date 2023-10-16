import { merge } from "lodash";

import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
  seriesOptions: {},
  columnMapping: {},
};

export default {
  type: "ADDRESSABLE PIE",
  name: "Pie (Addressable)",
  getOptions: (options: any) => merge({}, DEFAULT_OPTIONS, options),
  Renderer,
  Editor,

  defaultRows: 8,
};

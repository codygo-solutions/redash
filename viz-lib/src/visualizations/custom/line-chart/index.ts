import { merge } from "lodash";

import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
  type: "single",
  columnMapping: {},
};

export default {
  type: "ADDRESSABLE LINE",
  name: "Line (Addressable)",
  getOptions: (options: any) => merge({}, DEFAULT_OPTIONS, options),
  Renderer,
  Editor,

  defaultRows: 8,
};

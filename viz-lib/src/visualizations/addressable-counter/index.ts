import Renderer from "./Renderer";
import Editor from "./Editor";

const DEFAULT_OPTIONS = {
  counterLabel: "",
  counterColName: "counter",
  rowNumber: 1,
  targetRowNumber: 1,
  stringDecimal: 0,
  stringDecChar: ".",
  stringThouSep: ",",
  tooltipFormat: "0,0.000", // TODO: Show in editor
};

export default {
  type: "ADDRESSABLE COUNTER",
  name: "Counter (Addressable)",
  getOptions: (options: any) => ({
    ...DEFAULT_OPTIONS,
    ...options,
  }),
  Renderer,
  Editor,

  defaultColumns: 2,
  defaultRows: 5,
};

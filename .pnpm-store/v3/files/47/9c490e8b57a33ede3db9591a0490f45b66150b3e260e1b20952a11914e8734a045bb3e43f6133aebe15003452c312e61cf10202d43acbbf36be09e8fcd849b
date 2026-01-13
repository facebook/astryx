import { styleSheet } from "./StyleXSheet.mjs";
export default function inject(ltrRule, priority) {
  let rtlRule = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  styleSheet.insert(ltrRule, priority, rtlRule);
}
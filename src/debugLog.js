import { debuglog } from "util";

export default function debugLog(...args) {
  const log = debuglog("nightly-node");
  log(...args);

  // To debug on windows
  // console.log(...args);
}

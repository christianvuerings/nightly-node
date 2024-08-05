import { extname } from "node:path";
import { promisify } from "node:util";
import { exec as execCallback } from "node:child_process";
import path from "node:path";
import debugLog from "./debugLog.js";
const exec = promisify(execCallback);

export default async function decompressFile(filePath, outputDir) {
  const fileExt = extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, fileExt);

  debugLog(`Decompressing ${filePath} to ${outputDir}`);

  if (filePath.endsWith(".tar.gz")) {
    const { stdout, stderr } = await exec(
      `tar -xzf "${filePath}" -C "${outputDir}"`
    );
    if (stderr) throw new Error(stderr);
    debugLog(stdout);
    return `Decompression of ${filePath} complete`;
  } else if (filePath.endsWith(".gz")) {
    const { stdout, stderr } = await exec(
      `gunzip -c "${filePath}" > "${path.join(outputDir, fileName)}"`
    );
    if (stderr) throw new Error(stderr);
    debugLog(stdout);
  } else if (filePath.endsWith(".zip")) {
    const { stdout, stderr } = await exec(
      `bsdtar -xf "${filePath}" -C "${outputDir}"`
    );
    if (stderr) throw new Error(stderr);
    debugLog(stdout);
  } else {
    throw new Error("Unsupported file format");
  }
}

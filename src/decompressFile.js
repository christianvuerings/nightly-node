import { createReadStream } from "node:fs";
import { extname, join, dirname } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { exec as execCallback } from "node:child_process";
import path from "node:path";
import debugLog from "./debugLog.js";
const exec = promisify(execCallback);

export default async function decompressFile(filePath, outputDir) {
  const fileExt = extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, fileExt);

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
  } else if (fileExt === ".zip") {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(filePath);
      let buffer = Buffer.alloc(0);

      readStream.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
      });

      readStream.on("end", async () => {
        let offset = 0;
        const processedFiles = [];

        while (offset < buffer.length) {
          const signature = buffer.readUInt32LE(offset);
          if (signature !== 0x04034b50) break; // Local file header signature

          const nameLength = buffer.readUInt16LE(offset + 26);
          const extraLength = buffer.readUInt16LE(offset + 28);
          const compressedSize = buffer.readUInt32LE(offset + 18);
          const fileName = buffer.toString(
            "utf8",
            offset + 30,
            offset + 30 + nameLength
          );
          const fileData = buffer.slice(
            offset + 30 + nameLength + extraLength,
            offset + 30 + nameLength + extraLength + compressedSize
          );

          const outputPath = join(outputDir, fileName);
          processedFiles.push(
            mkdir(dirname(outputPath), { recursive: true }).then(() =>
              writeFile(outputPath, fileData)
            )
          );

          offset += 30 + nameLength + extraLength + compressedSize;
        }

        try {
          await Promise.all(processedFiles);
          resolve("Decompression complete");
        } catch (err) {
          reject(err);
        }
      });

      readStream.on("error", (err) => reject(err));
    });
  } else {
    throw new Error("Unsupported file format");
  }
}

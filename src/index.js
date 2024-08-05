"use strict";

import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import decompressFile from "./decompressFile.js";
import fs from "node:fs/promises";
import debugLog from "./debugLog.js";

const dirname = import.meta.dirname;
const rootDir = path.join(dirname, "..");

export async function versions() {
  const response = await fetch(
    "https://nodejs.org/download/nightly/index.json"
  );
  const data = await response.json();
  return data;
}

/**
 * Not every nightly build is available for every platform.
 * This function will return the latest version that is available for the current platform.
 */
export async function latestVersion({
  os = process.platform === "win32" ? "win" : process.platform,
  arch = process.arch === "ia32" ? "x86" : process.arch,
} = {}) {
  const extensionToMatch = `${
    os === "win" ? "zip" : os === "darwin" ? "tar" : ""
  }`;

  const stringToMatch = `${os === "darwin" ? "osx" : os}-${arch}${
    extensionToMatch ? `-${extensionToMatch}` : ""
  }`;

  const data = await versions();
  const { version } = data.find(({ files }) =>
    files.some((file) => file === stringToMatch)
  );

  const extension = os === "win" ? "zip" : "tar.gz";
  const id = `${version}-${os}-${arch}`;

  return {
    id,
    extension,
    url: `https://nodejs.org/download/nightly/${version}/node-${id}.${extension}`,
    version,
  };
}

async function createDirectory(directory) {
  try {
    await mkdir(directory);
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function exists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function install() {
  const downloadsDirectory = path.join(rootDir, "downloads");
  const versionsDirectory = path.join(rootDir, "versions");

  const [{ id, version, extension, url }] = await Promise.all([
    latestVersion(),
    createDirectory(downloadsDirectory),
    createDirectory(versionsDirectory),
  ]);

  const downloadPath = path.join(downloadsDirectory, `node-${id}.${extension}`);

  // If file already exists, skip download
  if (await exists(downloadPath)) {
    debugLog(`File already exists: ${downloadPath}`);
  } else {
    debugLog(`Downloading from ${url}`);
    const response = await fetch(url);
    const body = Readable.fromWeb(response.body);
    await writeFile(downloadPath, body);
    debugLog(`Downloaded to ${downloadPath}`);
  }

  // If directory already exists, skip decompression
  const nodeDirectory = path.join(versionsDirectory, `node-${id}`);
  if (await exists(nodeDirectory)) {
    debugLog(`Version ${version} already installed`);
  } else {
    await decompressFile(downloadPath, path.join(versionsDirectory));
  }

  debugLog(`Installed version ${version}`);

  return nodeDirectory;
}

export function nodePath(nodeDirectory) {
  return path.join(
    nodeDirectory,
    process.platform === "win32" ? "node" : "bin/node"
  );
}

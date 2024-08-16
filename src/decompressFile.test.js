import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { promises as fs } from "node:fs";
import decompressFile from "./decompressFile.js";

const { dirname } = import.meta;
const rootDir = join(dirname, "..");
const outputDir = join(rootDir, "test_output");
const testDir = join(rootDir, "test_files");

async function cleanup() {
  await fs.rm(outputDir, { recursive: true, force: true });
}

test.beforeEach(async () => {
  await cleanup();
  await fs.mkdir(outputDir, { recursive: true });
});

test.afterEach(async () => {
  await cleanup();
});

test("decompressFile - .gz file", {
  skip: process.platform === "win32",
}, async (t) => {
  await decompressFile(join(testDir, "test.txt.gz"), outputDir);
  const content = await fs.readFile(join(outputDir, "test.txt"), "utf8");
  assert.equal(content, "Plain text");
});

test("decompressFile - .tar.gz file", {
  skip: process.platform === "win32",
}, async (t) => {
  await decompressFile(join(testDir, "test.tar.gz"), outputDir);
  const content = await fs.readFile(join(outputDir, "test.txt"), "utf8");
  assert.equal(content, "Plain text");
});

test("decompressFile - .zip file", async (t) => {
  await decompressFile(join(testDir, "test.zip"), outputDir);
  const content = await fs.readFile(join(outputDir, "test.txt"), "utf8");
  assert.equal(content, "Plain text");
});

test("decompressFile - unsupported file format", async (t) => {
  await assert.rejects(decompressFile(join(testDir, "test.txt"), outputDir), {
    message: "Unsupported file format",
  });
});

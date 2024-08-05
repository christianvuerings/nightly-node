import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { install, latestVersion, nodePath, versions } from "./index.js";
import { spawnSync } from "node:child_process";

describe("versions", () => {
  test("Returns a list of Node.js versions", async (t) => {
    const data = await versions();

    assert(
      data.length >= 570,
      "Expected number of versions to be equal or greater than 570"
    );
  });

  test("Returns a Node.js versions in the correct format", async (t) => {
    (await versions()).forEach(({ version, date, files }) => {
      assert.match(
        version,
        /^v\d+\.\d+\.\d+-nightly\d+[a-f0-9]+$/,
        `${version} - Expected version to be in the correct format`
      );

      assert.match(
        date,
        /^\d{4}-\d{2}-\d{2}$/,
        `${version} - Expected date to be in the correct format (yyyy-mm-dd)`
      );

      assert(
        files.length > 0,
        // v5.7.2-nightly2016030801c331ea37 only contains `linux-armv7l`
        `${version} - Expected 'files' to be present and contain at least one file`
      );
    });
  });
});

describe("latestVersion", async () => {
  test("Returns the latest Node.js version", async (t) => {
    const version = await latestVersion();
    assert(version, "Expected version to be present");
  });

  await Promise.all(
    [
      {
        os: "win",
        arch: "x86",
      },
      {
        os: "darwin",
        arch: "x64",
      },
      {
        os: "linux",
        arch: "arm64",
      },
      {
        os: "linux",
        arch: "armv7l",
      },
      {
        os: "linux",
        arch: "x64",
      },
      {
        os: "linux",
        arch: "x86",
      },
    ].map(async ({ os, arch }) => {
      test(`Returns a valid URL for the latest Node.js version - ${os}-${arch}`, async (t) => {
        const { url } = await latestVersion(os, arch);
        const response = await fetch(url, { method: "HEAD" });
        assert(
          response.ok,
          `${os}-${arch} - Expected ${url} to be a valid URL`
        );
      });
    })
  );
});

describe("install", () => {
  test("Downloads and installs the latest Node.js version & runs node", async (t) => {
    const nodeDirectory = await install();
    const nodeExec = nodePath(nodeDirectory);
    const { stdout } = spawnSync(nodeExec, ["-v"], {
      stdio: "pipe",
      encoding: "utf-8",
    });
    assert.ok(stdout.startsWith("v"), "Expected 'node -v' to return a version");
  });
});

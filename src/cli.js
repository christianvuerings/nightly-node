#!/usr/bin/env node
"use strict";
import { argv } from "node:process";
import { install } from "./index.js";
import { spawn } from "node:child_process";
import { nodePath } from "./index.js";

const nodeDirectory = await install();
const nodeExec = nodePath(nodeDirectory);
spawn(nodeExec, argv.slice(2), { stdio: "inherit", env: process.env });

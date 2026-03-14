#!/usr/bin/env node
import { Command } from "commander";
import { scanCommand } from "./commands/scan.js";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
	.name("aeorank")
	.description("AEO (AI Engine Optimization) scanner and scorer")
	.version("0.0.1");

program.addCommand(scanCommand);
program.addCommand(initCommand);

program.parse(process.argv);

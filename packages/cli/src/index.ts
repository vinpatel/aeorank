import { Command } from "commander";
import { compareCommand } from "./commands/compare.js";
import { initCommand } from "./commands/init.js";
import { scanCommand } from "./commands/scan.js";
import { getCliVersion } from "./version.js";

const program = new Command();

program
	.name("aeorank")
	.description("AEO (AI Engine Optimization) scanner and scorer")
	.version(getCliVersion());

program.addCommand(scanCommand);
program.addCommand(initCommand);
program.addCommand(compareCommand);

program.parse(process.argv);

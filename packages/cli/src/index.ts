import { Command } from "commander";
import { compareCommand } from "./commands/compare.js";
import { doctorCommand } from "./commands/doctor.js";
import { initCommand } from "./commands/init.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
	.name("aeorank")
	.description("AEO (AI Engine Optimization) scanner and scorer")
	.version("0.0.1");

program.addCommand(scanCommand);
program.addCommand(initCommand);
program.addCommand(compareCommand);
program.addCommand(doctorCommand);

program.parse(process.argv);

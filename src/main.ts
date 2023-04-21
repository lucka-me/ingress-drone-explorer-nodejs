#!/usr/bin/env node

import { exit } from "process";
import { command } from "./command";

try {
    command.execute();
} catch(error) {
    process.stderr.write(`${ error }`);
    exit(1);
}

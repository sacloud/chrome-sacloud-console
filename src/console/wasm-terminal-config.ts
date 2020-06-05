// The configuration options passed when creating the Wasm terminal

import { WasmFs } from "@wasmer/wasmfs";
import CommandOptions from "./command/command-options";

// A Custom command is a function that takes in a stdin string, and an array of argument strings,
// And returns an stdout string, or undefined.
export type CallbackCommand = (
  args: string[],
  stdin: string
) => Promise<string>;

type FetchCommandFunction = (options: {
  args: Array<string>,
  env?: {[key: string]: string}
}) => Promise<Uint8Array | CallbackCommand | CommandOptions>;

export default class WasmTerminalConfig {
  fetchCommand: FetchCommandFunction;
  processWorkerUrl?: string;

  wasmFs: WasmFs;

  constructor(config: any) {
    if (!config) {
      throw new Error("You must provide a config for the Wasm terminal.");
    }

    if (!config.fetchCommand) {
      throw new Error(
        "You must provide a fetchCommand for the Wasm terminal config, to handle fetching commands to be run"
      );
    }

    if (!config.processWorkerUrl) {
      console.warn(
        "Note: It is HIGHLY reccomended you pass in the processWorkerUrl in the terminal config to create process workers. Without this, some wasi programs will not work."
      );
    }

    // Assign our values
    this.fetchCommand = config.fetchCommand;
    this.processWorkerUrl = config.processWorkerUrl;

    if (config.wasmFs) {
      this.wasmFs = config.wasmFs;
    } else {
      this.wasmFs = new WasmFs();
    }
  }
}

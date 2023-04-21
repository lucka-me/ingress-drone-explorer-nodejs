import { parseArgs, ParseArgsConfig } from "node:util";
import { Coordinate } from "../definitions/Coordinate";
import { Explorer } from "../explorer";

export namespace command {
    export function execute() {
        const config: ParseArgsConfig = {
            options: {
                'portal-list-files': {
                    type: 'string',
                    multiple: true,
                    short: 'p'
                },
                'start': {
                    type: 'string',
                    short: 's'
                },
                'key-list': {
                    type: 'string',
                    short: 'k'
                },
                'output-drawn-items': {
                    type: 'string'
                },
                'help': {
                    type: 'boolean',
                    short: 'h'
                }
            },
            allowPositionals: true
        };
        const args = parseArgs(config);
        if (args.values['help']) {
            displayHelpMessage();
            return;
        }

        if (args.values['portal-list-files'] === undefined && args.positionals.length === 0) {
            throw Error("The option '--portal-list-files' is required but missing.");
        }
        const portalListFilenames = args.values['portal-list-files'] as string[] || args.positionals;

        if (args.values['start'] === undefined) {
            throw Error("The option '--start' is required but missing.");
        }
        const start = Coordinate.parse(args.values['start'].toString().split(','));
        if (start === undefined) {
            throw Error("The value of option '--start' is invalid, it should be <longitude>,<latitude>.");
        }

        const keyListFilename = args.values['key-list'] as string | undefined;
        const drawnItemsFilename = args.values['output-drawn-items'] as string | undefined;

        const explorer = new Explorer();

        explorer.loadPortalsFrom(portalListFilenames)
        if (keyListFilename !== undefined) {
            explorer.loadKeysFrom(keyListFilename);
        }
        explorer.exploreFrom(start);
        explorer.report();
        if (drawnItemsFilename !== undefined) {
            explorer.saveDrawnItemsTo(drawnItemsFilename);
        }
    }

    function displayHelpMessage() {
        
    }
}
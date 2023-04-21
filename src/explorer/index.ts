import { Coordinate } from "../definitions/Coordinate";
import { ExplorerData } from "./ExplorerData";

import { explore } from "./explore";
import { loadKeys, loadPortals } from "./load";
import { report, saveDrawnItems } from "./report";

export class Explorer {
    loadPortalsFrom(filenames: string[]) {
        loadPortals(filenames, this._data);
    }

    loadKeysFrom(filename: string) {
        loadKeys(filename, this._data);
    }

    exploreFrom(start: Coordinate) {
        this._data._start = start;
        explore(this._data);
    }

    report() {
        report(this._data);
    }

    saveDrawnItemsTo(filename: string) {
        saveDrawnItems(filename, this._data);
    }

    private _data = new ExplorerData();
}
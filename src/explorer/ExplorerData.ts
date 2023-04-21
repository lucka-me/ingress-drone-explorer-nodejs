import { Coordinate } from "../definitions/Coordinate";
import { Portal } from "../definitions/Portal";
import { s2 } from "../s2/Cell";

export class ExplorerData {
    _start = new Coordinate(0, 0);
    _cells = new Map<s2.CellId, Map<string, Portal>>();
    _reachableCells = new Set<s2.CellId>;
    _cellsContainingKeys = new Map<s2.CellId, Portal[]>();
}
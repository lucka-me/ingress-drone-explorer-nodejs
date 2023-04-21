import { start } from "repl";
import { s2 } from "../s2/Cell";
import { ExplorerData } from "./ExplorerData";

export function explore(data: ExplorerData) {
    const startTime = Date.now();
    const startCell = s2.Cell.fromCoordinate(data._start);
    process.stdout.write(`⏳ Explore from ${data._start.toString()} in cell #${startCell.id()}\n`);

    const queue = new Map<s2.CellId, s2.Cell>();

    const visibleRadius = 500;
    const reachableRadiusWithKey = 1250;
    const safeRoundsForVisibleRadius = Math.ceil(visibleRadius / 80);

    if (data._cells.has(startCell.id())) {
        queue.set(startCell.id(), startCell);
    } else {
        const cells = startCell.neighbouredCellsCoveringCapOf(data._start, visibleRadius);
        for (const cell of cells) {
            if (data._cells.has(cell[0])) {
                queue.set(cell[0], cell[1]);
            }
        }
    }

    let previousTime = startTime;
    const digits = data._cells.size.toString().length;

    while (queue.size > 0) {
        const cell = queue.values().next().value as s2.Cell;
        const id = cell.id();
        queue.delete(id);

        const portals = data._cells.get(id);
        if (portals === undefined)
        {
            continue;
        }
        data._reachableCells.add(id);
        data._cellsContainingKeys.delete(id);

        // Get all neighbors in the visible range (also the possible ones), filter the empty/pending/reached ones and
        // search for reachable ones
        const neighbors = cell.neighbouredCellsIn(safeRoundsForVisibleRadius);
        for (const neighbor of neighbors) {
            if (queue.has(neighbor[0]) || data._reachableCells.has(neighbor[0]) || !data._cells.has(neighbor[0])) {
                continue;
            }
            for (const portal of portals) {
                if (neighbor[1].intersectsWithCapOf(portal[1]._coordinate, visibleRadius)) {
                    queue.set(neighbor[0], neighbor[1]);
                    break;
                }
            }
        }

        // Find keys
        /// TODO: Consider to use cell.neighbored_cells_in instead?
        if (data._cellsContainingKeys.size > 0) {
            for (const portal of portals) {
                const cellsToRemove = new Set<s2.CellId>();
                for (const targetCell of data._cellsContainingKeys) {
                    if (queue.has(targetCell[0])) {
                        cellsToRemove.add(targetCell[0]);
                        continue;
                    }
                    for (const target of targetCell[1]) {
                        if (portal[1]._coordinate.distanceTo(target._coordinate) < reachableRadiusWithKey) {
                            cellsToRemove.add(targetCell[0]);
                            queue.set(targetCell[0], s2.Cell.fromCoordinate(target._coordinate));
                            break;
                        }
                    }
                }
                for (const item of cellsToRemove) {
                    data._cellsContainingKeys.delete(item);
                }
                if (data._cellsContainingKeys.size === 0) {
                    break;
                }
            }
        }

        const now = Date.now();
        if (now - previousTime > 1000) {
            process.stdout.write(
                `  ⏳ Reached ${data._reachableCells.size.toString().padStart(digits)} / ${data._cells.size} cell(s)\n`
            );
            previousTime = now;
        }
    }

    const endTime = Date.now();
    process.stdout.write(`🔍 Exploration finished after ${((endTime - startTime) * 1E-3).toPrecision(4)} seconds\n`);
}
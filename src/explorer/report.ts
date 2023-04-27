import { writeFileSync } from "fs";

import { ExplorerData } from "./ExplorerData";
import { Portal } from "../definitions/Portal";
import { s2 } from "../s2/Cell";

export function report(data: ExplorerData) {
    let portalsCount = 0;
    let reachablePortalsCount = 0;
    let furthestPortal = new Portal("", "", data._start);
    for (const entry of data._cells) {
        portalsCount += entry[1].size;
        if (!data._reachableCells.has(entry[0])) {
            continue;
        }
        reachablePortalsCount += entry[1].size;
        for (const portal of entry[1]) {
            if (data._start.closer(furthestPortal._coordinate, portal[1]._coordinate)) {
                furthestPortal = portal[1];
            }
        }
    }
    if (reachablePortalsCount == 0) {
        process.stdout.write(
            `⛔️ There is no reachable portal in  ${portalsCount} portal(s) from ${data._start.toString()}\n`
        );
        return;
    }

    const totalNumberDigits = portalsCount.toString().length;
    const reachableNumberDigits = reachablePortalsCount.toString().length;
    const unreachableNumberDigits = (portalsCount - reachablePortalsCount).toString().length;

    process.stdout.write(
        `⬜️ In ${data._cells.size.toString().padStart(totalNumberDigits)}   cell(s), ` +
        `${data._reachableCells.size.toString().padStart(reachableNumberDigits)} are ✅ reachable, ` +
        `${(data._cells.size - data._reachableCells.size).toString().padStart(unreachableNumberDigits)} are ⛔️ not.\n`
    );
    process.stdout.write(
        `📍 In ${portalsCount.toString().padStart(totalNumberDigits)} Portal(s), ` +
        `${reachablePortalsCount.toString().padStart(reachableNumberDigits)} are ✅ reachable, ` +
        `${(portalsCount - reachablePortalsCount).toString().padStart(unreachableNumberDigits)} are ⛔️ not.\n`
    );
    process.stdout.write(
        `🛬 The furthest Portal is ${furthestPortal._title.length > 0 ? furthestPortal._title : 'Untitled'}.\n` +
        `  📍 It's located at ${furthestPortal._coordinate.toString()}\n` +
        `  📏 Where is ${data._start.distanceTo(furthestPortal._coordinate) * 1E-3} km away\n` +
        `  🔗 Check it out: ` +
        `https://intel.ingress.com/?pll=${furthestPortal._coordinate._lat},${furthestPortal._coordinate._lng}\n`
    );
}

export function saveDrawnItems(filename: string, data: ExplorerData) {
    const items: DrawnItems[] = [ ];
    for (const cell of data._cells) {
        const shape = s2.Cell.fromId(cell[0]).shape()
        items.push({
            type: 'polygon',
            color: data._reachableCells.has(cell[0]) ? '#783cbd' : '#404040',
            latLngs: shape.map(point => { return { lng: point._lng, lat: point._lat } })
        })
    }
    writeFileSync(filename, JSON.stringify(items))
    process.stdout.write(`💾 Saved drawn items to ${filename}.`)
}

interface LngLat {
    lng: number
    lat: number
}

interface DrawnItems {
    type: 'polygon'
    color: string
    latLngs: LngLat[]
}
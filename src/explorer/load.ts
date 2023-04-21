import { readFileSync } from "fs";
import { globSync } from "glob";

import { ExplorerData } from "./ExplorerData";
import { s2 } from "../s2/Cell";
import { Coordinate } from "../definitions/Coordinate";
import { Portal } from "../definitions/Portal";

export function loadPortals(filenames: string[], data: ExplorerData) {
    const startTime = Date.now();
    process.stdout.write('⏳ Loading Portals...\n');

    const files = globSync(filenames);

    let portalCount = 0;

    for (const filename of files) {
        const raw = readFileSync(filename, 'utf-8');
        const contents = JSON.parse(raw);
        if (!Array.isArray(contents)) {
            continue;
        }
        let fileAddPortalCount = 0;
        let fileAddCellCount = 0;
        for (const raw of contents as RawPortal[]) {
            const coordinate = new Coordinate(raw.lngLat.lng, raw.lngLat.lat);
            const cell = s2.Cell.fromCoordinate(coordinate);
            const portals = data._cells.get(cell.id());
            if (portals === undefined) {
                const portals = new Map<string, Portal>();
                portals.set(
                    raw.guid, new Portal(raw.guid, raw.title ?? "", new Coordinate(raw.lngLat.lng, raw.lngLat.lat))
                );
                data._cells.set(cell.id(), portals);
                fileAddCellCount++;
                fileAddPortalCount++;
                continue;
            }

            const portal = portals.get(raw.guid);
            if (portal === undefined) {
                portals.set(
                    raw.guid, new Portal(raw.guid, raw.title ?? "", new Coordinate(raw.lngLat.lng, raw.lngLat.lat))
                );
                fileAddPortalCount++;
            } else if (portal._title.length === 0) {
                portals.set(
                    raw.guid, new Portal(raw.guid, raw.title ?? "", new Coordinate(raw.lngLat.lng, raw.lngLat.lat))
                );
            }
        }
        portalCount += fileAddPortalCount;
        process.stdout.write(
            `  📃 Added ${fileAddPortalCount.toString().padStart(5, ' ')} portal(s) ` +
            `and ${fileAddCellCount.toString().padStart(4, ' ')} cell(s) from ${filename}\n`
        );
    }

    const endTime = Date.now();
    process.stdout.write(
        `📍 Loaded ${portalCount} Portal(s) in ${data._cells.size} cell(s) from ${files.length} file(s), ` +
        `which took ${((endTime - startTime) * 1E-3).toPrecision(4)} seconds\n`
    );
}

export function loadKeys(filename: string, data: ExplorerData) {
    const raw = readFileSync(filename, 'utf-8');
    const contents = JSON.parse(raw);
    if (!Array.isArray(contents)) {
        throw new Error(`The content of key file ${filename} is invalid.`);
    }
    const ids = new Set<string>;
    for (const id of contents as string[]) {
        ids.add(id);
    }
    const loadCount = ids.size;
    for (const cell of data._cells) {
        const keys: Portal[] = [];
        for (const portal of cell[1]) {
            if (ids.has(portal[0])) {
                keys.push(portal[1]);
                ids.delete(portal[0]);
            }
        }
        if (keys.length > 0) {
            data._cellsContainingKeys.set(cell[0], keys);
        }
    }
    process.stdout.write(
        `🔑 Loaded ${loadCount} Key(s) and ` +
        `matched ${loadCount - ids.size} in ${data._cellsContainingKeys.size} cell(s)\n`
    );
}

interface RawLngLat {
    lng: number;
    lat: number;
}

interface RawPortal {
    guid: string;
    title: string | undefined;
    lngLat: RawLngLat;
}
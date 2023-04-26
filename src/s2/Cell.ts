import { Coordinate } from "../definitions/Coordinate";
import { ECEFCoordinate } from "./ECEFCoordinate";
import { Face } from "./Face";

export namespace s2 {
    export type CellId = string;

    export class Cell {
        _face: Face;
        _level: number;
        _i: number;
        _j: number;

        constructor(face: Face, i: number, j: number, level: number = 16) {
            this._level = level;
            const max = 1 << level;
            if (i >= 0 && j >= 0 && i < max && j < max) {
                this._face = face;
                this._i = i;
                this._j = j;
                return;
            }
            let faceST = ECEFCoordinate.fromFaceST(face, (0.5 + i) / max, (0.5 + j) / max).toFaceST();
            this._face = faceST.face;
            this._i = clamp(Math.floor(faceST.s * max), 0, max - 1);
            this._j = clamp(Math.floor(faceST.t * max), 0, max - 1);
        }

        static fromCoordinate(coordinate: Coordinate, level: number = 16): Cell {
            let { face, s, t } = ECEFCoordinate.fromCoordinate(coordinate).toFaceST();
            const max = 1 << level;
            return new Cell(
                face, clamp(Math.floor(s * max), 0, max - 1), clamp(Math.floor(t * max), 0, max - 1), level
            );
        }

        static fromId(id: CellId): Cell {
            let attrs = id.split(',');
            return new Cell(parseInt(attrs[0]), parseInt(attrs[2]), parseInt(attrs[3]), parseInt(attrs[1]))
        }

        coordinate(dI: number, dJ: number): Coordinate {
            const max = 1 << this._level;
            return ECEFCoordinate.fromFaceST(this._face, (dI + this._i) / max, (dJ + this._j) / max).coordinate();
        }

        id(): CellId {
            return `${this._face},${this._level},${this._i},${this._j}`;
        }

        intersectsWithCapOf(center: Coordinate, radius: number): boolean {
            const corners = this.shape();
            corners.sort((a, b) => center.closer(a, b) ? -1 : 1);
            return center.distanceTo(corners[0]) < radius || center.distanceToLine(corners[0], corners[1]) < radius;
        }

        neighboredCellsCoveringCapOf(center: Coordinate, radius: number): Map<CellId, Cell> {
            const result = new Map<CellId, Cell>();
            const outside = new Set<string>;
            const queue = new Map<CellId, Cell>();
            queue.set(this.id(), this);
            while (queue.size > 0) {
                const cell = queue.values().next().value as Cell;
                const id = cell.id();
                queue.delete(id);
                if (result.has(id) || outside.has(id)) {
                    continue;
                }
                if (cell.intersectsWithCapOf(center, radius)) {
                    const neighbors = this.neighbors();
                    for (const item of neighbors) {
                        queue.set(item.id(), item);
                    }
                    result.set(id, cell);
                } else {
                    outside.add(id);
                }
            }
            return result;
        }

        neighboredCellsIn(rounds: number): Map<CellId, Cell> {
            const result = new Map<CellId, Cell>();
            /// TODO: Check if correct near the edge of face?
            /// Maybe we need the algorithm of neighboredCellsCoveringCapOf to "search" instead of generate?
            for (let round = 0; round < rounds; ++round) {
                const steps = (round + 1) * 2;
                for (let step = 0; step < steps; ++step) {
                    // Left, upward
                    let cell = new Cell(this._face, this._i - round - 1   , this._j - round + step, this._level);
                    if (!result.has(cell.id())) {
                        result.set(cell.id(), cell);
                    }
                    // Top, rightward
                    cell = new Cell(this._face, this._i - round + step, this._j + round + 1   , this._level);
                    if (!result.has(cell.id())) {
                        result.set(cell.id(), cell);
                    }
                    // Right, downward
                    cell = new Cell(this._face, this._i + round + 1   , this._j + round - step, this._level);
                    if (!result.has(cell.id())) {
                        result.set(cell.id(), cell);
                    }
                    // Bottom, leftward
                    cell = new Cell(this._face, this._i + round - step, this._j - round - 1   , this._level);
                    if (!result.has(cell.id())) {
                        result.set(cell.id(), cell);
                    }
                }
            }
            return result;
        }

        neighbors(): [ Cell, Cell, Cell, Cell ] {
            return [
                new Cell(this._face, this._i - 1, this._j       , this._level),
                new Cell(this._face, this._i    , this._j - 1   , this._level),
                new Cell(this._face, this._i + 1, this._j + 1   , this._level),
                new Cell(this._face, this._i    , this._j       , this._level),
            ];
        }

        shape(): [ Coordinate, Coordinate, Coordinate, Coordinate] {
            return [
                this.coordinate(0, 0),
                this.coordinate(0, 1),
                this.coordinate(1, 1),
                this.coordinate(1, 0),
            ];
        }
    }

    function clamp(x: number, low: number, high: number): number {
        return (x < low) ? low : ((x > high) ? high : x);
    }
}
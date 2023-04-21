import { Coordinate } from "./Coordinate"

export class Portal {
    _guid: string;
    _title: string;
    _coordinate: Coordinate;

    constructor(guid: string, title: string, coordinate: Coordinate) {
        this._guid = guid;
        this._title = title;
        this._coordinate = coordinate;
    }
}
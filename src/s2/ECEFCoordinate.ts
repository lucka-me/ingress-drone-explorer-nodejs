import { Coordinate } from "../definitions/Coordinate";
import { Face } from "./Face";

export class ECEFCoordinate {
    _x: number;
    _y: number;
    _z: number;

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    static fromCoordinate(coordinate: Coordinate): ECEFCoordinate {
        const theta = coordinate.theta();
        const phi = coordinate.phi();
        const cosPhi = Math.cos(phi);
        return new ECEFCoordinate(Math.cos(theta) * cosPhi, Math.sin(theta) * cosPhi, Math.sin(phi));
    }

    static fromFaceST(face: Face, s: number, t: number): ECEFCoordinate {
        const u = (1.0 / 3.0) * (s >= 0.5 ? (4.0 * s * s - 1) : (1.0 - (4.0 * (1.0 - s) * (1.0 - s))));
        const v = (1.0 / 3.0) * (t >= 0.5 ? (4.0 * t * t - 1) : (1.0 - (4.0 * (1.0 - t) * (1.0 - t))));
        let x = 0;
        let y = 0;
        let z = 0;
        switch (face) {
        case Face.Face0: x =  1; y =  u; z =  v; break;
        case Face.Face1: x = -u; y =  1; z =  v; break;
        case Face.Face2: x = -u; y = -v; z =  1; break;
        case Face.Face3: x = -1; y = -v; z = -u; break;
        case Face.Face4: x =  v; y = -1; z = -u; break;
        case Face.Face5: x =  v; y =  u; z = -1; break;
        }
        return new ECEFCoordinate(x, y, z);
    }

    coordinate(): Coordinate {
        return new Coordinate(
            Math.atan2(this._y, this._x) / Math.PI * 180.0,
            Math.atan2(this._z, Math.sqrt(this._x * this._x + this._y * this._y)) / Math.PI * 180.0
        );
    }

    toFaceST(): { face: Face, s: number, t: number } {
        const absX = Math.abs(this._x);
        const absY = Math.abs(this._y);
        let face = absX > absY
            ? (absX > Math.abs(this._z) ? Face.Face0 : Face.Face2)
            : (absY > Math.abs(this._z) ? Face.Face1 : Face.Face2);
        if ((face == 0 && this._x < 0) || (face == 1 && this._y < 0) || (face == 2 && this._z < 0)) {
            face += 3;
        }

        let s = 0;
        let t = 0;

        switch (face) {
        case 0: s =  this._y / this._x; t =  this._z / this._x; break;
        case 1: s = -this._x / this._y; t =  this._z / this._y; break;
        case 2: s = -this._x / this._z; t = -this._y / this._z; break;
        case 3: s =  this._z / this._x; t =  this._y / this._x; break;
        case 4: s =  this._z / this._y; t = -this._x / this._y; break;
        case 5: s = -this._y / this._z; t = -this._x / this._z; break;
        }

        s = s >= 0 ? (0.5 * Math.sqrt(1 + 3 * s)) : (1.0 - 0.5 * Math.sqrt(1 - 3 * s));
        t = t >= 0 ? (0.5 * Math.sqrt(1 + 3 * t)) : (1.0 - 0.5 * Math.sqrt(1 - 3 * t));

        return { face, s, t };
    }
}
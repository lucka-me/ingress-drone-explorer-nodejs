export class Coordinate {

    static earthRadius = 6371008.8;

    _lng: number
    _lat: number

    constructor(lng: number, lat: number) {
        this._lng = lng
        this._lat = lat
    }

    static parse(from: string[]): Coordinate | undefined {
        if (from.length !== 2) return undefined;
        const lng = parseFloat(from[0]);
        const lat = parseFloat(from[1]);
        if (isNaN(lng) || isNaN(lat)) return undefined;
        return new Coordinate(lng, lat);
    }

    closer(a: Coordinate, b: Coordinate): boolean {
        const dA = (this._lng - a._lng) * (this._lng - a._lng) + (this._lat - a._lat) * (this._lat - a._lat);
        const dB = (this._lng - b._lng) * (this._lng - b._lng) + (this._lat - b._lat) * (this._lat - b._lat);
        return dA < dB;
    }

    distanceTo(other: Coordinate): number {
        const sinTheta = Math.sin((other.theta() - this.theta()) / 2);
        const sinPhi = Math.sin((other.phi() - this.phi()) / 2);
        const a = sinPhi * sinPhi + sinTheta * sinTheta * Math.cos(this.phi()) * Math.cos(other.phi());
        return Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a)) * 2 * Coordinate.earthRadius;
    }
    
    distanceToLine(a: Coordinate, b: Coordinate): number {
        const c_1 = (b._lat - a._lat) * (this._lat - a._lat)
            + (b._lng - a._lng) * (this._lng - a._lng);
        if (c_1 <= 0) {
            return this.distanceTo(a);
        }
        const c_2 = (b._lat - a._lat) * (b._lat - a._lat)
            + (b._lng - a._lng) * (b._lng - a._lng);
        if (c_2 <= c_1) {
            return this.distanceTo(b);
        }
        const ratio = c_1 / c_2;
        return this.distanceTo(new Coordinate(a._lng + ratio * (b._lng - a._lng), a._lat + ratio * (b._lat - a._lat)));
    }

    phi(): number {
        return this._lat * Math.PI / 180.0;
    }

    theta(): number {
        return this._lng * Math.PI / 180.0;
    }

    toString(): string {
        return `${this._lng},${this._lat}`;
    }
}
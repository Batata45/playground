// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

// Definition of a random parking lot that will be loaded as mocked data.
const PARKING_LOT = {
    id: 42,
    position: new Vector(300, 360, 400),
    rotation: 270
};

// Mocked database class that implements the same API as the regular HouseDatabase class, but will
// return faked data for the purposes of testing rather than consult the database.
class MockHouseDatabase {
    constructor() {
        this.mockLocationId_ = 1000;
        this.mockParkingLotId_ = 2000;
        this.mockHouseId_ = 3000;
    }

    async loadLocations() {
        return [
            [ 1, { facingAngle: 0, interiorId: 0, position: new Vector(100, 150, 200), parkingLots: [] } ],
            [ 2, { facingAngle: 0, interiorId: 0, position: new Vector(200, 250, 300), parkingLots: [] } ],
            [ 3, { facingAngle: 0, interiorId: 0, position: new Vector(300, 350, 400), parkingLots: [ PARKING_LOT ] } ],
            [ 4, { facingAngle: 0, interiorId: 0, position: new Vector(500, 500, 500), parkingLots: [] } ]
        ];
    }

    async loadHouses() {
        const houses = new Map();
        houses.set(4 /* locationId */, {
            id: 1024,
            name: 'Guntherplaza',

            ownerId: 42 /* user_id */,
            ownerName: 'Gunther',

            interiorId: 0
        });

        return houses;
    }

    async createLocation(player, locationInfo) {
        return this.mockLocationId_++;
    }

    async createLocationParkingLot(player, location, parkingLot) {
        return this.mockParkingLotId_++;
    }

    async createHouse(player, location, interiorId) {
        return {
            id: this.mockHouseId_++,
            name: player.name + '\'s house',

            ownerId: player.userId,
            ownerName: player.name,

            interiorId: interiorId
        };
    }

    async removeLocation(location) {}

    async removeLocationParkingLot(parkingLot) {}

    async removeHouse(location) {}
}

exports = MockHouseDatabase;

// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

import AbuseConstants from 'features/abuse/abuse_constants.js';

describe('Abuse', (it, beforeEach) => {
    let abuse = null;

    beforeEach(() => abuse = server.featureManager.loadFeature('abuse'));

    it('should allow or deny teleportation based on fighting activities', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        const russell = server.playerManager.getById(1 /* Russell */);

        // Both issuing and taking damage temporarily blocks teleportation in Las Venturas.
        {
            gunther.position = new Vector(2000, 2000, 0);
            assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            gunther.shoot();
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            russell.shoot({ target: gunther });
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            gunther.shoot({ target: russell });
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
        }

        await server.clock.advance(60000);  // arbitrary amount

        // Only issuing damage temporarily blocks teleportation outside of Las Venturas.
        {
            gunther.position = new Vector(0, 0, 0);
            assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            gunther.shoot();
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            russell.shoot({ target: gunther });
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

            gunther.shoot({ target: russell });
            assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
        }
    });

    it('should be able to enforce a time limit on teleportations', async(assert) => {
        const gunther = server.playerManager.getById(0 /* Gunther */);

        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: true }).allowed);

        abuse.reportTimeThrottledTeleport(gunther, { timeLimited: true });

        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
        assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: true }).allowed);

        await server.clock.advance(3 * 60 * 1000);  // 60 seconds, the time limit

        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: true }).allowed);
    });

    it('should override teleportation limits for administrators', assert => {
        const gunther = server.playerManager.getById(0 /* Gunther */);
        const russell = server.playerManager.getById(1 /* Russell */);

        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

        gunther.shoot({ target: russell });

        assert.isFalse(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);

        gunther.level = Player.LEVEL_ADMINISTRATOR;

        assert.isTrue(abuse.canTeleport(gunther, { enforceTimeLimit: false }).allowed);
    });

    it('should be able to format time limits', assert => {
        const mappings = {
            1: 'second',
            2: '2 seconds',
            60: 'minute',
            61: '1:01 minutes',
            120: '2 minutes',
            121: '2:01 minutes',
            3600: 'hour',
            7500: '2 hours'
        };

        for (const [seconds, description] of Object.entries(mappings)) {
            assert.equal(AbuseConstants.REASON_TIME_LIMIT(seconds * 1000),
                         'can only do so once per ' + description);
        }
    });
});

// Copyright 2016 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

// Implements the commands available as part of the persistent gang feature. The primary ones are
// /gang and /gangs, each of which has a number of sub-options available to them.
class GangCommands {
    constructor(manager) {
        this.manager_ = manager;

        server.commandManager.buildCommand('pgangs')
            .restrict(Player.LEVEL_ADMINISTRATOR)
            .sub('top')
                .build(GangCommands.prototype.onGangsTopCommand.bind(this))

            .build(GangCommands.prototype.onGangsCommand.bind(this));
    }

    // Called when the player uses the `/gangs` command. It will, by default, list the gangs that
    // are currently represented on Las Venturas Playground, but the "top" sub-command is available
    // to list the top 5 all-round gangs on the server.
    onGangsCommand(player) {
        let gangs = this.manager_.gangs;

        // Sort the |gangs| by number of in-game players in descending order, then by the name of
        // the gang, which is the order they will be presented in.
        gangs.sort((lhs, rhs) => {
            if (lhs.memberCount > rhs.memberCount)
                return 1;

            return lhs.name.localeCompare(rhs.name);
        });

        // Display a line for each of the entries in |gangs|, that has now been sorted.
        gangs.forEach(gang => {
            const color = gang.color ? gang.color.toHexRGB() : 'FFFFFF';
            const tag = gang.tag;
            const name = gang.name;
            const memberCount = gang.memberCount;
            const memberSuffix = gang.memberCount == 1 ? '' : 's';

            player.sendMessage(Message.GANGS_ONLINE, color, tag, name, memberCount, memberSuffix);
        });

        if (!gangs.length)
            player.sendMessage(Message.GANGS_NONE_ONLINE);

        player.sendMessage(Message.GANGS_BEST_ADV);
    }

    // Called when a player uses the `/gangs top` command. Displays the top 5 gangs on the server
    // regardless of whether they currently have players in-game.
    onGangsTopCommand(player) {
        // TODO(Russell): List the top 5 gangs from the database once we figure out rankings.
    }

    // Cleans up the state created by this class, i.e. unregisters the commands.
    dispose() {
        server.commandManager.removeCommand('pgangs');
    }
}

exports = GangCommands;

const basic = require("./basic")
const collision = require("./collision")

exports.game = (game) => {
    /*
    ---PLAYER MOVEMENT---
    */
    if (game.gameFinished) game = undefined
    if (game.player1.left && game.player1.xpos >= 0) {
        if (game.player1.shift && game.player1.ctrl || !game.player1.shift && !game.player1.ctrl) game.player1.xpos -= 6
        if (game.player1.shift && !game.player1.ctrl) game.player1.xpos -= 12
        if (!game.player1.shift && game.player1.ctrl) game.player1.xpos -= 3
    }
    if (game.player1.right && game.player1.xpos <= 700) {
        if (game.player1.shift && game.player1.ctrl || !game.player1.shift && !game.player1.ctrl) game.player1.xpos += 6
        if (game.player1.shift && !game.player1.ctrl) game.player1.xpos += 12
        if (!game.player1.shift && game.player1.ctrl) game.player1.xpos += 3
    }

    if (game.player2.left && game.player2.xpos >= 0) {
        if (game.player2.shift && game.player2.ctrl || !game.player2.shift && !game.player2.ctrl) game.player2.xpos -= 6
        if (game.player2.shift && !game.player2.ctrl) game.player2.xpos -= 12
        if (!game.player2.shift && game.player2.ctrl) game.player2.xpos -= 3
    }
    if (game.player2.right && game.player2.xpos <= 700) {
        if (game.player2.shift && game.player2.ctrl || !game.player2.shift && !game.player2.ctrl) game.player2.xpos += 6
        if (game.player2.shift && !game.player2.ctrl) game.player2.xpos += 12
        if (!game.player2.shift && game.player2.ctrl) game.player2.xpos += 3
    }
    /*
    ---SHOOTING---
    */
    if (game.player1.space && game.player1.shootCd == 0) {
        game.player1.shots.push({
            xpos: game.player1.xpos,
            ypos: 650,
            width: game.player1.bulletWidth,
            height: 20,
            alive: true
        })
        game.player1.shootCd = game.player1.shootRechargeTime * 60
    }
    if (game.player2.space && game.player2.shootCd == 0) {
        game.player2.shots.push({
            xpos: game.player2.xpos,
            ypos: 650,
            width: game.player2.bulletWidth,
            height: 20,
            alive: true
        })
        game.player2.shootCd = game.player2.shootRechargeTime * 60
    }
    /*
    ---SHOT MOVEMENT---
    */
    for (x of game.player1.shots) {
        x.ypos -= 10
    }
    for (x of game.player2.shots) {
        x.ypos -= 10
    }
    /*
    ---COOLDOWN RECOVERY---
    */
    if (game.player1.shootCd > 0) game.player1.shootCd--
    if (game.player2.shootCd > 0) game.player2.shootCd--
    if (game.player1.soldierSpawnCooldown > 0) game.player1.soldierSpawnCooldown--
    if (game.player2.soldierSpawnCooldown > 0) game.player2.soldierSpawnCooldown--
    /*
    ---SHOTS CLEANUP---
    */
    for (x of game.player1.shots) {
        if (x.ypos < 0) x.alive = false //IF A SHOT EXITS THE MAP
    }
    for (x of game.player2.shots) {
        if (x.ypos < 0) x.alive = false
    }

    game.player1.shots = basic.filterAlive(game.player1.shots)
    game.player2.shots = basic.filterAlive(game.player2.shots)
    /*
    ---PASSIVE MONEY GAIN---
    */
    game.player1.money += 1 / 30
    game.player2.money += 1 / 30
    /*
    ---SOLDIER MOVEMENT---
    */
    for (x of game.player1.soldiers) {
        switch (x.type) {
            case "yellow":
                x.ypos -= 3
                break
            case "blue":
                x.ypos -= 2
        }
    }
    for (x of game.player2.soldiers) {
        switch (x.type) {
            case "yellow":
                x.ypos -= 3
                break
            case "blue":
                x.ypos -= 2
        }
    }
    /*
    ---SOLDIER CLEANUP---
    */
    for (x of game.player1.soldiers) {
        if (x.ypos < 0) {
            x.alive = false
            game.player2.health -= x.health
        }
    }
    for (x of game.player2.soldiers) {
        if (x.ypos < 0) {
            x.alive = false
            game.player1.health -= x.health
        }
    }
    game.player1.soldiers = basic.filterAlive(game.player1.soldiers)
    game.player2.soldiers = basic.filterAlive(game.player2.soldiers)
    /*
    ---COLLISIONS---
    */
    for (i of game.player1.soldiers) {
        for (ii of game.player2.shots) {
            if (collision.collidesWith(i, ii)) {
                if (i.health <= game.player2.weaponDamage) {
                    i.alive = false
                    ii.alive = false
                    game.player2.money += 10
                } else {
                    i.health -= game.player2.weaponDamage
                    ii.alive = false
                }
            }
        }
    }
    for (i of game.player2.soldiers) {
        for (ii of game.player1.shots) {
            if (collision.collidesWith(i, ii)) {
                if (i.health <= game.player1.weaponDamage) {
                    i.alive = false
                    ii.alive = false
                    game.player1.money += 10
                } else {
                    i.health -= game.player1.weaponDamage
                    ii.alive = false
                }
            }
        }
    }
}
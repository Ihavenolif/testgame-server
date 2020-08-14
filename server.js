/*
---VARIABLES---
*/
express = require("express")
cors = require("cors")
bodyParser = require("body-parser")
app = express()
expressWs = require("express-ws")(app)

PORT = process.env.PORT || 7000;

connectedPlayers = []
gamesList = {}
runningGamesList = {}

/*
---BASIC FUNCTIONS---
*/

function copyObj(object) {
    result = {}
    for (const x in object) {
        result[x] = object[x]
    }
    return result
}

function sendableGamesList() {
    result = {}
    for (const index in gamesList) {
        if (gamesList[index] != undefined) {
            result[index] = {}
            result[index].player1 = gamesList[index].player1
            result[index].player2 = gamesList[index].player2
            result[index].password = gamesList[index].password == "" ? "no" : "yes"
            result[index].name = gamesList[index].name
        }
    }
    return result
}

function removeTimers(object) {
    result = {}
    for (const x in object) {
        if (object[x]._idlePrev == undefined) {
            result[x] = object[x]
        }
    }
    return result
}

function filterAlive(array) {
    result = []
    for (x = 0; x < array.length; x++) {
        if (array[x].alive) {
            result.push(array[x])
        }
    }
    return result;
}

/*
---COLLISION FUNCTIONS---
*/
function collidesWithX(obj1, obj2) {
    if (Math.abs(obj1.xpos - obj2.xpos) < Math.abs(obj1.width - obj2.width)) {
        return true;
    } else return false
}

function collidesWithY(obj1, obj2) {
    if (Math.abs(obj1.ypos - (700 - obj2.ypos)) < (Math.abs(obj1.height - obj2.height) + Math.min(obj1.height, obj2.height))) {
        return true;
    } else return false
}

function collidesWith(obj1, obj2) {
    return collidesWithX(obj1, obj2) && collidesWithY(obj1, obj2);
}

/*
---SERVER SETUP---
*/

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.ws("/", function (ws, req) {
    ws.on("message", function (msg) {
        input = JSON.parse(msg)
        //console.log(input)
        switch (input.request) {
            case "login":
                connectedPlayers.push(input.playerName)
                ws.send(JSON.stringify({
                    request: "loginSuccessful",
                    message: "Welcome, " + input.playerName
                }))
                break
            case "getGamesList":
                temp = sendableGamesList()
                temp.request = "gamesList"
                ws.send(JSON.stringify(temp))
                break
            case "createGame":
                if (gamesList[input["gameName"]] == undefined && runningGamesList[input.gameName] == undefined) {
                    gamesList[input["gameName"]] = {
                        name: input["gameName"],
                        password: input["password"],
                        player1: input["playerName"],
                        player2: null
                    }
                    ws.send(JSON.stringify(input))
                } else {
                    ws.send(JSON.stringify({
                        request: "gameAlreadyExists"
                    }))
                }
                break
            case "joinGame":
                if (input.password == gamesList[input.name].password) {
                    runningGamesList[input.name] = copyObj(gamesList[input.name])
                    gamesList[input.name] = undefined
                    runningGamesList[input.name].player2 = input.playerName
                    runningGamesList[input.name].player1ready = false
                    runningGamesList[input.name].player2ready = false
                    runningGamesList[input.name].gameStarted = false
                    runningGamesList[input.name].gameFinished = false
                    if (runningGamesList[input.name]) {
                        runningGamesList[input.name].lobbyTimer = setInterval((name) => {
                            if (runningGamesList[name].player1ready && runningGamesList[name].player2ready) {
                                clearInterval(runningGamesList[name].lobbyTimer)
                                runningGamesList[name].gameStarted = true
                                runningGamesList[name].gameTimer = setInterval(game, 1000 / 60, runningGamesList[name]);
                                runningGamesList[name].player1 = {
                                    scope: true,
                                    weaponDamage: 10,
                                    soldierSpawnCooldown: 0,
                                    health: 100,
                                    soldiers: [],
                                    money: 0,
                                    shootRechargeTime: 1,
                                    bulletWidth: 4,
                                    shootCd: 0,
                                    shots: [],
                                    left: false,
                                    up: false,
                                    right: false,
                                    down: false,
                                    ctrl: false,
                                    shift: false,
                                    space: false,
                                    xpos: 350
                                }
                                runningGamesList[name].player2 = {
                                    scope: true,
                                    weaponDamage: 10,
                                    soldierSpawnCooldown: 0,
                                    health: 100,
                                    soldiers: [],
                                    money: 0,
                                    shootRechargeTime: 1,
                                    bulletWidth: 4,
                                    shootCd: 0,
                                    shots: [],
                                    left: false,
                                    up: false,
                                    right: false,
                                    down: false,
                                    ctrl: false,
                                    shift: false,
                                    space: false,
                                    xpos: 350
                                }
                            }
                        }, 1000, input.name);
                    }
                    temp = removeTimers(runningGamesList[input.name])
                    temp.request = "joinGame"
                    ws.send(JSON.stringify(temp))
                }
                break
            case "checkGameStatus":
                if (gamesList[input.gameName] == undefined) {
                    temp = removeTimers(runningGamesList[input.gameName])
                    temp.request = "checkGameStatus"
                    ws.send(JSON.stringify(temp))
                } else {
                    temp = gamesList[input.gameName]
                    temp.request = "checkGameStatus"
                    ws.send(JSON.stringify(temp))
                }
                break
            case "readyCheck":
                if(runningGamesList[input.name] !== undefined){
                    if (input.player == 1) {
                        if (runningGamesList[input.name].player1ready) {
                            runningGamesList[input.name].player1ready = false
                        } else {
                            runningGamesList[input.name].player1ready = true
                        }
                    } else {
                        if (runningGamesList[input.name].player2ready) {
                            runningGamesList[input.name].player2ready = false
                        } else {
                            runningGamesList[input.name].player2ready = true
                        }
                    }
                }
                temp = removeTimers(runningGamesList[input.name])
                temp.request = "readyCheck"
                ws.send(JSON.stringify(temp))
                break
            case "game":
                if (input.player == 1) {
                    runningGamesList[input.name].player1.left = input.left
                    runningGamesList[input.name].player1.up = input.up
                    runningGamesList[input.name].player1.right = input.right
                    runningGamesList[input.name].player1.down = input.down
                    runningGamesList[input.name].player1.space = input.space
                    runningGamesList[input.name].player1.shift = input.shift
                    runningGamesList[input.name].player1.ctrl = input.ctrl
                } else {
                    runningGamesList[input.name].player2.left = input.left
                    runningGamesList[input.name].player2.up = input.up
                    runningGamesList[input.name].player2.right = input.right
                    runningGamesList[input.name].player2.down = input.down
                    runningGamesList[input.name].player2.space = input.space
                    runningGamesList[input.name].player2.shift = input.shift
                    runningGamesList[input.name].player2.ctrl = input.ctrl
                }
                temp = removeTimers(runningGamesList[input.name])
                temp.request = "game"
                ws.send(JSON.stringify(temp))
                break
            case "yellowSoldierSpawn":
                if (input.player == 1) {
                    if (runningGamesList[input.name].player1.money >= 10 && runningGamesList[input.name].player1.soldierSpawnCooldown == 0) {
                        runningGamesList[input.name].player1.soldiers.push({
                            type: "yellow",
                            health: 10,
                            xpos: runningGamesList[input.name].player1.xpos,
                            ypos: 650,
                            alive: true,
                            width: 20,
                            height: 20
                        })
                        runningGamesList[input.name].player1.money -= 10
                        runningGamesList[input.name].player1.soldierSpawnCooldown = 60
                    }
                } else {
                    if (runningGamesList[input.name].player2.money >= 10 && runningGamesList[input.name].player2.soldierSpawnCooldown == 0) {
                        runningGamesList[input.name].player2.soldiers.push({
                            type: "yellow",
                            health: 10,
                            xpos: runningGamesList[input.name].player2.xpos,
                            ypos: 650,
                            alive: true,
                            width: 20,
                            height: 20
                        })
                        runningGamesList[input.name].player2.money -= 10
                        runningGamesList[input.name].player2.soldierSpawnCooldown = 60
                    }
                }
                break
            case "blueSoldierSpawn":
                if (input.player == 1) {
                    if (runningGamesList[input.name].player1.money >= 20 && runningGamesList[input.name].player1.soldierSpawnCooldown == 0) {
                        runningGamesList[input.name].player1.soldiers.push({
                            type: "blue",
                            health: 15,
                            xpos: runningGamesList[input.name].player1.xpos,
                            ypos: 650,
                            alive: true,
                            width: 30,
                            height: 30
                        })
                        runningGamesList[input.name].player1.money -= 20
                        runningGamesList[input.name].player1.soldierSpawnCooldown = 90
                    }
                } else {
                    if (runningGamesList[input.name].player2.money >= 20 && runningGamesList[input.name].player2.soldierSpawnCooldown == 0) {
                        runningGamesList[input.name].player2.soldiers.push({
                            type: "blue",
                            health: 15,
                            xpos: runningGamesList[input.name].player2.xpos,
                            ypos: 650,
                            alive: true,
                            width: 30,
                            height: 30
                        })
                        runningGamesList[input.name].player2.money -= 10
                        runningGamesList[input.name].player2.soldierSpawnCooldown = 60
                    }
                }

        }
    })
    ws.on("close", () => {
        console.log("Connection closed")
    })
})

app.get("/", function (req, res) {
    res.send("Hello World")
})

server = app.listen(PORT, function () {
    console.log("Server is running on port " + PORT + ". Hit CTRL+C to stop.");
})

/*
---GAME CODE---
*/

function game(game) {
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

    game.player1.shots = filterAlive(game.player1.shots)
    game.player2.shots = filterAlive(game.player2.shots)
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
    game.player1.soldiers = filterAlive(game.player1.soldiers)
    game.player2.soldiers = filterAlive(game.player2.soldiers)
    /*
    ---COLLISIONS---
    */
    for (i of game.player1.soldiers) {
        for (ii of game.player2.shots) {
            if (collidesWith(i, ii)) {
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
            if (collidesWith(i, ii)) {
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
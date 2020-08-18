const express = require("express")
const app = express()
const expressWs = require("express-ws")(app)
const basic = require("./basic")
const game = require("./game")
const aWss = expressWs.getWss("/")
const connectedPlayers = {}

app.get("/", function (req, res) {
    res.send("Hello World")
})

app.ws("/", function (ws, req) {
    ws.on("message", function (msg) {
        input = JSON.parse(msg)
        //console.log(input)
        switch (input.request) {
            case "login":
                if(connectedPlayers[input.playerName] == undefined){
                    ws.send(JSON.stringify({
                        request: "loginSuccessful",
                        message: "Welcome, " + input.playerName
                    }))
                    connectedPlayers[input.playerName] = ws
                    ws.playerName = input.playerName
                }else{
                    ws.send(JSON.stringify({
                        request: "nameAlreadyExists"
                    }))
                }
                break
            case "getGamesList":
                temp = basic.sendableGamesList(gamesList)
                temp.request = "gamesList"
                ws.send(JSON.stringify(temp))
                break
            case "createGame":
                if (gamesList[input["gameName"]] == undefined && runningGamesList[input.gameName] == undefined) {
                    gamesList[input["gameName"]] = {
                        name: input["gameName"],
                        password: input["password"],
                        player1: input["playerName"],
                        player1ws: ws,
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
                    runningGamesList[input.name] = basic.copyObj(gamesList[input.name])
                    gamesList[input.name] = undefined
                    runningGamesList[input.name].player2 = input.playerName
                    runningGamesList[input.name].player2ws = ws
                    runningGamesList[input.name].player1ready = false
                    runningGamesList[input.name].player2ready = false
                    runningGamesList[input.name].gameStarted = false
                    runningGamesList[input.name].gameFinished = false
                    runningGamesList[input.name].lobbyTimer = setInterval((name) => {
                        if (runningGamesList[name].player1ready && runningGamesList[name].player2ready) {
                            clearInterval(runningGamesList[name].lobbyTimer)
                            runningGamesList[name].gameStarted = true
                            runningGamesList[name].gameTimer = setInterval(game.game, 1000 / 60, runningGamesList[name])
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
                    }, 1000, input.name)
                    temp = basic.removeTimers(runningGamesList[input.name])
                    temp.request = "joinGame"
                    ws.send(JSON.stringify(temp))
                }
                break
            case "buttonPress":
                console.log(input)
                if(input.player == 1){
                    runningGamesList[input.gameName].player1[input.button] = input.pressed
                }else{
                    runningGamesList[input.gameName].player2[input.button] = input.pressed
                }
                break
            case "checkGameStatus":
                if (gamesList[input.gameName] == undefined) {
                    temp = basic.removeTimers(runningGamesList[input.gameName])
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
                temp = basic.removeTimers(runningGamesList[input.name])
                temp.request = "readyCheck"
                ws.send(JSON.stringify(temp))
                break
            case "game":
                /*if (input.player == 1) {
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
                temp = basic.removeTimers(runningGamesList[input.name])
                temp.request = "game"
                ws.send(JSON.stringify(temp))
                break*/
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
        ws = undefined
    })
})

const PORT = process.env.PORT || 7000

exports.gamesList = {}
gamesList = exports.gamesList
exports.runningGamesList = {}
runningGamesList = exports.runningGamesList

exports.start = () => {
    return app.listen(PORT, function () {
        console.log("Server is running on port " + PORT + ". Hit CTRL+C to stop.");
    })
}

exports.gameSend = (obj, ws1, ws2) => {
    try{
        ws1.send(JSON.stringify(obj))
    }catch(error){
        console.log(error)
    }
    try{
        ws2.send(JSON.stringify(obj))
    }catch(error){
        console.log(error)
    }
    
}
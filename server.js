express = require("express")
cors = require("cors")
bodyParser = require("body-parser")
app = express()

PORT = process.env.PORT || 3000;

gamesList = {}
runningGamesList = {}

function copyObj(object) {
    result = {}
    for (const x in object) {
        result[x] = object[x]
    }
    return result
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
    res.send("Hello World")
})

app.post("/", function (req, res) {
    input = req.body
    console.log(req.ip)
    if (input["getGamesList"] != undefined) {
        console.log("getGamesList request received")
        res.send(JSON.stringify(gamesList))
    } else if (input["createGame"] != undefined) {
        console.log("createGame request received")
        if (gamesList[input["gameName"]] == undefined && runningGamesList[input.gameName] == undefined) {
            gamesList[input["gameName"]] = {
                name: input["gameName"],
                password: input["password"],
                player1: input["playerName"],
                player2: null
            }
            res.send(JSON.stringify(input))
        } else {
            res.send(JSON.stringify({
                gameAlreadyExists: true
            }))
        }
    } else if (input.joinGame != undefined) {
        console.log("joinGame request received")
        runningGamesList[input.name] = copyObj(gamesList[input.name])
        gamesList[input.name] = undefined
        runningGamesList[input.name].player2 = input.player2
        runningGamesList[input.name].player1ready = false
        runningGamesList[input.name].player2ready = false
        runningGamesList[input.name].gameStarted = false
        console.log(runningGamesList[input.name])
        res.send(JSON.stringify(runningGamesList[input.name]))
    }
})

server = app.listen(PORT, function () {
    console.log("Server is running on port ${ PORT }. Hit CTRL+C to stop.");
})


express = require("express")
cors = require("cors")
bodyParser = require("body-parser")
app = express()

PORT = process.env.PORT || 7000;

gamesList = {}
runningGamesList = {}

function copyObj(object) {
    result = {}
    for (const x in object) {
        result[x] = object[x]
    }
    return result
}

function sendableGamesList(){
    result = {}
    for(const index in gamesList){
        result[index] = {}
        result[index].player1 = gamesList[index].player1
        result[index].player2 = gamesList[index].player2
        result[index].password = gamesList[index].password == "" ? "no" : "yes"
        result[index].name = gamesList[index].name
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
    console.log(input)
    if (input["getGamesList"] != undefined) {
        console.log("getGamesList request received")
        res.send(JSON.stringify(sendableGamesList()))
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
        /*

        accepts this object {
            name: string
            password: string
            playerName: string
        }

        */
        console.log("joinGame request received")
        runningGamesList[input.name] = copyObj(gamesList[input.name])
        gamesList[input.name] = undefined
        runningGamesList[input.name].player2 = input.playerName
        runningGamesList[input.name].player1ready = false
        runningGamesList[input.name].player2ready = false
        runningGamesList[input.name].gameStarted = false
        console.log(runningGamesList[input.name])
        res.send(JSON.stringify(runningGamesList[input.name]))
    } else if(input.checkConnection != undefined){
        res.send("Connection Successful!")
    } else if(input.checkGameStatus != undefined){
        if(gamesList[input.gameName] == undefined){
            res.send(JSON.stringify(runningGamesList[input.gameName]))
        } else{
            res.send(JSON.stringify(gamesList[input.gameName]))
        }
        
    }
})

server = app.listen(PORT, function () {
    console.log("Server is running. Hit CTRL+C to stop.");
    console.log(PORT)
})


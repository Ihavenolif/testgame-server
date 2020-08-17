const express = require("express")
const app = express()
const expressWs = require("express-ws")(app)

app.get("/", function (req, res) {
    res.send("Hello World")
})

const PORT = process.env.PORT || 7000

exports.gamesList = {};
exports.runningGamesList = {};

exports.start = () => {
    return app.listen(PORT, function () {
        console.log("Server is running on port " + PORT + ". Hit CTRL+C to stop.");
    })
}
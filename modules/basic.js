exports.copyObj = (object) => {
    result = {}
    for (const x in object) {
        result[x] = object[x]
    }
    return result
}

exports.sendableGamesList = (gamesList) => {
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

exports.removeTimers = (object) => {
    result = {}
    for (const x in object) {
        if (object[x]._idlePrev == undefined) {
            result[x] = object[x]
        }
    }
    return result
}

exports.filterAlive = (array) => {
    result = []
    for (x = 0; x < array.length; x++) {
        if (array[x].alive) {
            result.push(array[x])
        }
    }
    return result;
}
exports.collidesWithX = (obj1, obj2) => {
    if (Math.abs(obj1.xpos - obj2.xpos) < Math.abs(obj1.width - obj2.width)) {
        return true
    } else return false
}

exports.collidesWithY = (obj1, obj2) => {
    if (Math.abs(obj1.ypos - (700 - obj2.ypos)) < (Math.abs(obj1.height - obj2.height) + Math.min(obj1.height, obj2.height))) {
        return true
    } else return false
}

exports.collidesWith = (obj1, obj2) => {
    return exports.collidesWithX(obj1, obj2) && exports.collidesWithY(obj1, obj2)
}
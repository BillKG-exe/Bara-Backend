


exports.listToString = list => {
    var stringifiedList = ''

    for(const i in list) {
        stringifiedList += (list[i] + "/")
    }

    return stringifiedList
}

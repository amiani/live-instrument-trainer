const fs = require("fs")
const max = require("max-api")

const log = require("./log").log(max.post)

const readJSON = (path, cb) => {
  fs.readFile(require.resolve(path), (err, data) => {
    if (err)
      cb(err)
    else
      cb(null, JSON.parse(data))
  })
}

function loadGroup() {
  readJSON("./groups.json", async (err, data) => {
    if (err) {
      log(err)
      return
    }
    //log('sending dict', data)
    try {
      await max.setDict('groups', data)
      await max.outlet("setGroup")
    } catch (err) {
      log(err)
    }
  })
}

const handlers = {
  loadGroup, 
  params: async dictName => {
    try {
      const params = await max.getDict(dictName)
      log('exporting params')
      fs.writeFile('paramsRaw.json', JSON.stringify(params), err => {
        if (err) throw err
      })
    } catch (err) {
      log("Error: couldn't get dict", err)
    }
  }
}

max.addHandlers(handlers)
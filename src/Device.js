const joinPaths = require('joinPaths').joinPaths
const DeviceParameter = require('DeviceParameter').DeviceParameter

exports.Device = function(live, devicePath, remotes) {
  this.live = live
  this.remotes = remotes
  this.hidden = false
  this.devicePath = devicePath
  this.paramsPath = joinPaths(devicePath, 'parameters')
  this.params = {}

  this.getParams = function() {
    this.live.goto(this.devicePath)
    var dict = new Dict('params')
    var numParams = this.live.getcount("parameters")
    for (var i = 0; i != numParams; i++) {
      var param = new DeviceParameter(this.live, joinPaths(this.paramsPath, i), this.remotes[i])
      this.params[param.name] = param
      dict.setparse(param.name, JSON.stringify(param))
      var parsed = dict.get(param.name)
      parsed.remove('remote')
      dict.replace(param.name, parsed)
    }
  }
  this.getParams()

  this.resetAll = function() {
    Object.keys(this.params).forEach(function(name) {
      var p = this.params[name]
      this.live.goto(p.path)
      this.live.set("value", p.reset_value)
    }.bind(this))
  }

  this.setParams = function(group) {
    this.unlockAll()
    this.resetAll()

    for (var i  = 0; i != group.length; i++) {
      var name = group[i].get('name')
      var param = this.params[name]
      this.live.goto(param.path)
      switch (group[i].get('action')) {
        case 'reset':
          this.live.set("value", param.reset_value)
          break
        case 'set':
          this.live.set("value", group[i].get('value'))
          break
        case 'set_random':
          var min = group[i].get('min')
          var max = group[i].get('max')
          var v = Math.random() * (max - min) + min
          this.live.set("value", v)
          break
        default:
          log('unknown action: ' + params.action)
      }
    }
    this.lockAll()
  }
  
  this.lock = function(paramNames) {
    for (var i = 0; i != paramNames.length; i++) {
      this.params[paramNames[i]].lock()
    }
  }

  this.lockAll = function() {
    Object.keys(this.params).forEach(function(name) {
      this.params[name].lock()
    }.bind(this))
  }

  this.lockAllExcept = function(paramNames) {
    this.lockAll()
    this.unlock(paramNames)
  }
  
  this.unlock = function(paramNames) {
    for (var i = 0; i != paramNames.length; i++) {
      this.params[paramNames[i]].unlock()
    }
  }

  this.unlockAll = function() {
    Object.keys(this.params).forEach(function(name) {
      this.params[name].unlock()
    }.bind(this))
  }
}

const joinPaths = require('joinPaths').joinPaths
const DeviceParameter = require('DeviceParameter').DeviceParameter

exports.Device = function(live, devicePath) {
  this.live = live
  this.devicePath = devicePath
  this.paramsPath = joinPaths(devicePath, 'parameters')
  this.params = {}

  this.getParams = function() {
    this.live.goto(this.devicePath)
    //var params = new Dict("params")
    var numParams = live.getcount("parameters")
    for (var i = 0; i != numParams; i++) {
      var param = new DeviceParameter(this.live, joinPaths(this.paramsPath, i))
      this.params[param.name] = param
      //params.setparse(param.name, JSON.stringify(param))
    }
  }
  this.getParams()

  this.resetParams = function() {
    Object.keys(this.params).forEach(function(name) {
      var p = this.params[name]
      this.live.goto(p.path)
      this.live.set("value", p.reset_value)
    }.bind(this))
  }

  this.setParams = function(group) {
    this.resetParams()

    for (var i  = 0; i != group.length; i++) {
      var param = this.params[group[i].get('name')]
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
  }
}

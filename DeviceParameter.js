exports.DeviceParameter = function(live, path, remote) {
  this.live = live
  this.live.goto(path)
  this.id = this.live.id
  this.path = path
  this.name = live.get("name")[0]
  this.remote = remote
  this.is_quantized = parseInt(live.get("is_quantized"), 10)
  if (this.is_quantized == 1) {
    //this.value_items = live.get("value_items")
  } else {
    this.default_value = live.get("default_value")
  }
  this.reset_value = live.get("value")
  this.min = live.get("min")
  this.max = live.get("max")

  this.getValue = function() {
    this.live.goto(this.path)
    return this.live.get("value")
  }

  this.lock = function() {
    this.remote['id'](this.id)
    //this.remote['float'](this.reset_value)
  }

  this.unlock = function() {
    this.remote['id'](0)
  }
}
exports.DeviceParameter = function(path) {
  this.path = path
  live.goto(path)
  this.name = live.get("name")
  this.is_quantized = parseInt(live.get("is_quantized"), 10)
  if (this.is_quantized == 1) {
    //this.value_items = live.get("value_items")
  } else {
    this.default_value = live.get("default_value")
  }
  this.reset_value = live.get("value")
  this.min = live.get("min")
  this.max = live.get("max")

  this.set = function(v) {
    live.goto(this.path)
    live.set("value", v)
  }
}
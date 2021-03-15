var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var Device = require("Device").Device
var service = this.patcher.getnamed("service")

var traineePath = 'this_device canonical_parent devices 1 chains 0 devices 0'
var targetPath = 'this_device canonical_parent devices 1 chains 1 devices 0'
//var operatorPath = 'this_device canonical_parent devices 1'
var live = new LiveAPI()
var trainee = new Device(live, traineePath)
var target = new Device(live, targetPath)


//service.message("params", "params")
function bang() {
	log("bang received")
	outlet(0, "script start")
}

var group = new Dict("group")
function setGroup() {
	target.setParams(group.get('group1'))
}
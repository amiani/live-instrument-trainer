var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var Device = require("Device").Device
var service = this.patcher.getnamed("service")

var operatorPath = 'this_device canonical_parent devices 1'
var live = new LiveAPI(operatorPath)
var operator = new Device(live, operatorPath)

//service.message("params", "params")
function bang() {
	log("bang received")
	outlet(0, "script start")
}

var group = new Dict("group")
log('made dict')
function setGroup() {
	operator.setParams(group.get('group1'))
}
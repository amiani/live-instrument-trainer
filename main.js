var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var service = this.patcher.getnamed("service")

var operatorPath = 'this_device canonical_parent devices 1'
var live = new LiveAPI(operatorPath)
var self = this.box

//log(param.get("is_enabled"))

//service.message("params", "params")
function bang() {
	log("bang received")
	outlet(0, "script start")
}

function loadGroups() {
	var groups = new Dict("groups")
	groups.import_json("groups.json")
	log(groups.get("group1")[0])
}
loadGroups()
var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var Device = require("Device").Device
var evaluate = require("evaluate").evaluate

function init() {
	log('initializing')
	var service = this.patcher.getnamed("service")
	var defer = this.patcher.getnamed('deferrer')
	var percComment = this.patcher.getnamed('percComment')

	var patchRemotes = []
	var targetRemotes = []
	for (var i = 0; i != 195; i++) {
		patchRemotes.push(this.patcher.getnamed('patchRemote'+i))
		targetRemotes.push(this.patcher.getnamed('targetRemote'+i))
	}

	var live = new LiveAPI()
	var patchPath = 'this_device canonical_parent devices 1 chains 0 devices 0'
	var targetPath = 'this_device canonical_parent devices 1 chains 1 devices 0'
	var patch = new Device(live, patchPath, patchRemotes)
	var target = new Device(live, targetPath, targetRemotes)


	this.checkPatch = function() {
		var perc = evaluate(patch, target, groups.get("group1"))
		percComment.set(perc)
	}

	this.anything = function() {
		targetCollapsed.set('is_collapsed', 1)
	}

	var groups = new Dict("groups")
	this.setGroup = function() {
		var group = groups.get('group1')
		var names = group.map(function(g) { return g.get('name') })
		target.setParams(group)
		patch.lockAllExcept(names)
	}

	this.lockTarget = function() {
		target.lockAll()
	}

	this.unlockAll = function() {
		patch.unlockAll()
		target.unlockAll()
	}

	this.writeParams = function() {
		service.message('params', 'params')
	}

	this.resetOscB = function() {
		this.setGroup()
	}

	this.handleTargetCollapsed = function(args) {
		if (args[0] === 'is_collapsed' && args[1] === 0) {
			defer['anything']('collapseTarget')
		}
	}

	var targetCollapsed = new LiveAPI(this.handleTargetCollapsed, joinPaths(targetPath, 'view'))
	targetCollapsed.property = 'is_collapsed'

	service.message('loadGroup')
}


this.createRemotes = function() {
	for (var i = 0; i != 195; i++) {
		var patchRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		var targetRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		patchRemote.varname = 'patchRemote' + i
		targetRemote.varname = 'targetRemote' + i
	}
}
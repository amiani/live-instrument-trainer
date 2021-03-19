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


	var activeGroup
	this.checkPatch = function() {
		var perc = evaluate(patch, target, activeGroup)
		percComment.set(perc)
		target.hidden = false
		targetCollapsed.set('is_collapsed', 0)
	}

	this.anything = function() {
		targetCollapsed.set('is_collapsed', 1)
	}

	var groups = new Dict("groups")
	var groupName = 'groupB'
	this.setGroup = function() {
		//var group = groups.get(groupName)
		activeGroup = groups.get(groupName)
		var names = activeGroup
			.filter(function(g) { return !g.get("isLocked") })
			.map(function(g) { return g.get("name") })
		target.hidden = true
		defer['anything']()
		target.setParams(activeGroup)
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

	this.newPuzzle = function() {
		this.setGroup()
	}

	var groupIndex = ['groupB', 'groupAB']
	this.selectGroup = function() {
		groupName = groupIndex[arguments[0]]
		activeGroup = groups.get(groupName)
		log(groupName)
	}

	this.handleTargetCollapsed = function(args) {
		if (target.hidden === true && args[0] === 'is_collapsed' && args[1] === 0) {
			defer['anything']('collapseTarget')
		}
	}

	var targetCollapsed = new LiveAPI(this.handleTargetCollapsed, joinPaths(targetPath, 'view'))
	targetCollapsed.property = 'is_collapsed'

	service.message('loadGroup')
}
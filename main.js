var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var Device = require("Device").Device
var service = this.patcher.getnamed("service")
var self = this.box
var defer = this.patcher.getnamed('deferrer')
var evaluate = require("evaluate").evaluate

inlets = 2
outlets = 2

var checkButton = this.patcher.getnamed('checkButton')
var percComment = this.patcher.getnamed('percComment')

function loadbang() {
	//log('loadbang')
	//run()
}

function run() {
	//
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

	var targetCollapsed = new LiveAPI(handleTargetCollapsed, joinPaths(targetPath, 'view'))
	targetCollapsed.property = 'is_collapsed'

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
}

function handleTargetCollapsed(args) {
	if (args[0] === 'is_collapsed' && args[1] === 0) {
		//defer['anything']('collapseTarget', 'hi', 'hello')
	}
}

this.createRemotes = function() {
	for (var i = 0; i != 195; i++) {
		var patchRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		var targetRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		patchRemote.varname = 'patchRemote' + i
		targetRemote.varname = 'targetRemote' + i
	}
}
var log = require("log").log(post)
var joinPaths = require("joinPaths").joinPaths
var Device = require("Device").Device
var service = this.patcher.getnamed("service")
var self = this.box
var defer = this.patcher.getnamed('deferrer')
var evaluate = require("evaluate").evaluate

inlets = 2

var checkButton = this.patcher.getnamed('checkButton')
var percComment = this.patcher.getnamed('percComment')

function loadbang() {
	log('loadbang')
	run()
}

function run() {
	//
	var live = new LiveAPI()
	var patchPath = 'this_device canonical_parent devices 1 chains 0 devices 0'
	var targetPath = 'this_device canonical_parent devices 1 chains 1 devices 0'
	var patch = new Device(live, patchPath)
	var target = new Device(live, targetPath)

	var targetCollapsed = new LiveAPI(handleTargetCollapsed, joinPaths(targetPath, 'view'))
	targetCollapsed.property = 'is_collapsed'

	this.checkPatch = function() {
		var perc = evaluate(patch, target, group.get("group1"))
		percComment.set(perc)
	}

	this.anything = function() {
		targetCollapsed.set('is_collapsed', 1)
	}

	var group = new Dict("group")
	this.setGroup = function() {
		target.setParams(group.get('group1'))
	}
}


function handleTargetCollapsed(args) {
	if (args[0] === 'is_collapsed' && args[1] === 0) {
		//defer['anything']('collapseTarget', 'hi', 'hello')
	}
}

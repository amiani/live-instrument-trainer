exports.createRemotes = function() {
	for (var i = 0; i != 195; i++) {
		var patchRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		var targetRemote = this.patcher.newdefault(100, 200, 'live.remote~')
		patchRemote.varname = 'patchRemote' + i
		targetRemote.varname = 'targetRemote' + i
	}
}
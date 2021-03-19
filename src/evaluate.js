//var log = require('log').log(post)

exports.evaluate = function(patch, target, group) {
  var totalError = 0
  for (var i = 0; i != group.length; i++) {
    var name = group[i].get('name')
    var targetParam = target.params[name]
    var targetState = targetParam.getState()
    if (targetState == 2) {
      targetParam.unlock()
    }
    if (targetParam.getState() == 0) {
      var targetValue = targetParam.getValue()
      var patchParam = patch.params[name]
      var patchValue = patchParam.getValue()

      var range = patchParam.max - patchParam.min
      var patchNorm = (patchValue - patchParam.min) / range
      var targetNorm = (targetValue - patchParam.min) / range
      var error = Math.abs(patchNorm - targetNorm)
      totalError += error
    }
    if (targetState == 2) {
      targetParam.lock()
    }
  }
  return Math.max(100 - 100*totalError, 0)
}
//var log = require('log').log(post)

exports.evaluate = function(patch, target, group) {
  var totalError = 0
  Object.keys(patch.params).forEach(function(name) {
    var g = undefined
    for (var i = 0; i != group.length; i++) {
      if (group[i].get('name') === name) {
        g = group[i]
        break
      }
    }
    var patchParam = patch.params[name]
    var patchValue = patchParam.getValue()
    var targetValue = target.params[name].getValue()
    if (g === undefined) {
      if (parseFloat(patchValue) !== parseFloat(targetValue)) {
        log(patchValue, targetValue)
        log('non-group param ' + name + ' set incorrectly')
      }
    } else {
      var range = patchParam.max - patchParam.min
      var patchNorm = (patchValue - patchParam.min) / range
      var targetNorm = (targetValue - patchParam.min) / range
      var error = Math.pow(patchNorm - targetNorm, 2)
      //log('error: ', error)
      totalError += error
    }
  })
  return totalError
}
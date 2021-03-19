'use strict';

function logger(post) {
  return function() {
    this.post = post;
    for(var i = 0, len = arguments.length; i < len; i++) {
      var message = arguments[i];
      if(message && message.toString) {
        var s = message.toString();
        if(s.indexOf("[object ") >= 0) {
          s = JSON.stringify(message);
        }
        this.post(s);
      }
      else if(message === null) {
        this.post("<null>");
      }
      else {
        this.post(message);
      }
    }
    this.post("\n");
  }
}

function joinPaths(path1, path2) {
  return path1 + ' ' + path2
}

function DeviceParameter(live, path, remote) {
  this.live = live;
  this.live.goto(path);
  this.id = this.live.id;
  this.path = path;
  this.name = live.get("name")[0];
  this.remote = remote;
  this.is_quantized = parseInt(live.get("is_quantized"), 10);
  if (this.is_quantized == 1) ; else {
    this.default_value = live.get("default_value");
  }
  this.reset_value = live.get("value");
  this.min = live.get("min");
  this.max = live.get("max");

  this.getValue = function() {
    this.live.goto(this.path);
    return this.live.get("value")
  };

  this.getState = function() {
    this.live.goto(this.path);
    return this.live.get('state')
  };

  this.locked = false;
  this.lock = function() {
    this.remote['id'](this.id);
    this.locked = true;
  };

  this.unlock = function() {
    this.remote['id'](0);
    this.locked = false;
  };
}

function Device(live, devicePath, remotes) {
  this.live = live;
  this.remotes = remotes;
  this.hidden = false;
  this.devicePath = devicePath;
  this.paramsPath = joinPaths(devicePath, 'parameters');
  this.params = {};

  this.getParams = function() {
    this.live.goto(this.devicePath);
    var dict = new Dict('params');
    var numParams = this.live.getcount("parameters");
    for (var i = 0; i != numParams; i++) {
      var param = new DeviceParameter(this.live, joinPaths(this.paramsPath, i), this.remotes[i]);
      this.params[param.name] = param;
      dict.setparse(param.name, JSON.stringify(param));
      var parsed = dict.get(param.name);
      parsed.remove('remote');
      dict.replace(param.name, parsed);
    }
  };
  this.getParams();

  this.resetAll = function() {
    Object.keys(this.params).forEach(function(name) {
      var p = this.params[name];
      this.live.goto(p.path);
      this.live.set("value", p.reset_value);
    }.bind(this));
  };

  this.setParams = function(group) {
    this.unlockAll();
    this.resetAll();

    for (var i  = 0; i != group.length; i++) {
      var name = group[i].get('name');
      var param = this.params[name];
      this.live.goto(param.path);
      switch (group[i].get('action')) {
        case 'reset':
          this.live.set("value", param.reset_value);
          break
        case 'set':
          this.live.set("value", group[i].get('value'));
          break
        case 'set_random':
          var min = group[i].get('min');
          var max = group[i].get('max');
          var v = Math.random() * (max - min) + min;
          this.live.set("value", v);
          break
        default:
          log('unknown action: ' + params.action);
      }
    }
    this.lockAll();
  };
  
  this.lock = function(paramNames) {
    for (var i = 0; i != paramNames.length; i++) {
      this.params[paramNames[i]].lock();
    }
  };

  this.lockAll = function() {
    Object.keys(this.params).forEach(function(name) {
      this.params[name].lock();
    }.bind(this));
  };

  this.lockAllExcept = function(paramNames) {
    this.lockAll();
    this.unlock(paramNames);
  };
  
  this.unlock = function(paramNames) {
    for (var i = 0; i != paramNames.length; i++) {
      this.params[paramNames[i]].unlock();
    }
  };

  this.unlockAll = function() {
    Object.keys(this.params).forEach(function(name) {
      this.params[name].unlock();
    }.bind(this));
  };
}

function evaluate(patch, target, group) {
  var totalError = 0;
  for (var i = 0; i != group.length; i++) {
    var name = group[i].get('name');
    var targetParam = target.params[name];
    var targetState = targetParam.getState();
    if (targetState == 2) {
      targetParam.unlock();
    }
    if (targetParam.getState() == 0) {
      var targetValue = targetParam.getValue();
      var patchParam = patch.params[name];
      var patchValue = patchParam.getValue();

      var range = patchParam.max - patchParam.min;
      var patchNorm = (patchValue - patchParam.min) / range;
      var targetNorm = (targetValue - patchParam.min) / range;
      var error = Math.abs(patchNorm - targetNorm);
      totalError += error;
    }
    if (targetState == 2) {
      targetParam.lock();
    }
  }
  return Math.max(100 - 100*totalError, 0)
}

var log$1 = logger(post);

this.init = function() {
	log$1('initializing');
	var service = this.patcher.getnamed("service");
	var defer = this.patcher.getnamed('deferrer');
	var percComment = this.patcher.getnamed('percComment');

	var patchRemotes = [];
	var targetRemotes = [];
	for (var i = 0; i != 195; i++) {
		patchRemotes.push(this.patcher.getnamed('patchRemote'+i));
		targetRemotes.push(this.patcher.getnamed('targetRemote'+i));
	}

	var live = new LiveAPI();
	var patchPath = 'this_device canonical_parent devices 1 chains 0 devices 0';
	var targetPath = 'this_device canonical_parent devices 1 chains 1 devices 0';
	var patch = new Device(live, patchPath, patchRemotes);
	var target = new Device(live, targetPath, targetRemotes);


	var activeGroup;
	this.checkPatch = function() {
		var perc = evaluate(patch, target, activeGroup);
		percComment.set(perc);
		target.hidden = false;
		targetCollapsed.set('is_collapsed', 0);
	};

	this.anything = function() {
		targetCollapsed.set('is_collapsed', 1);
	};

	var groups = new Dict("groups");
	var groupName = 'groupB';
	this.setGroup = function() {
		activeGroup = groups.get(groupName);
		var names = activeGroup
			.filter(function(g) { return !g.get("isLocked") })
			.map(function(g) { return g.get("name") });
		target.hidden = true;
		defer['anything']();
		target.setParams(activeGroup);
		patch.unlockAll();
		patch.resetAll();
		patch.lockAllExcept(names);
	};

	this.lockTarget = function() {
		target.lockAll();
	};

	this.unlockAll = function() {
		patch.unlockAll();
		target.unlockAll();
	};

	this.writeParams = function() {
		service.message('params', 'params');
	};

	this.newPuzzle = function() {
		this.setGroup();
	};

	var groupIndex = ['groupB', 'groupAB'];
	this.selectGroup = function() {
		groupName = groupIndex[arguments[0]];
		activeGroup = groups.get(groupName);
		log$1(groupName);
	};

	this.handleTargetCollapsed = function(args) {
		if (target.hidden === true && args[0] === 'is_collapsed' && args[1] === 0) {
			defer['anything']('collapseTarget');
		}
	};

	var targetCollapsed = new LiveAPI(this.handleTargetCollapsed, joinPaths(targetPath, 'view'));
	targetCollapsed.property = 'is_collapsed';

	service.message('loadGroup');
};

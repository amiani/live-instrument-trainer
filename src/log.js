exports.log = function(post) {
  return function() {
    this.post = post
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
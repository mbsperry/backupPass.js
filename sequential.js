/* Push tasks onto array
 * Call first task
 * Callback launches next task
 * When array is empty return
 */

function series_on_result(callbacks, last) {
  var results = [];
  function next(result) {
    var callback = callbacks.shift();
    if(callback) {
      if (result) {
        callback(arguments[0], function() {
          results.push(Array.prototype.slice.call(arguments));
          next(arguments[0]);
        });
      }
      else {
        callback(function() {
          results.push(Array.prototype.slice.call(arguments));
          next(arguments[0]);
        });
      }
    } else {
      last(result);
    }
  }
  next();
}

module.exports.series_on_result = series_on_result;

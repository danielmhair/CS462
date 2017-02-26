exports.getRandom = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.uniqueItems = function (duplicatesArr) {
  var arr = [];
  duplicatesArr.forEach(function(item) {
    if(!arr.contains(item)) {
      arr.push(item);
    }
  })
  return arr;
}

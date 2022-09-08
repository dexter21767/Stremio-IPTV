module.exports = function () {
    var cache = {};
    return {
        get: function (key) { return cache[key]; },
        set: function (key, val) { cache[key] = val; }
    }
}();

var clamp = require('clamp')

module.exports = function integration(opt) {
    return new Integration(opt)
}

function Integration(opt) {
    opt = opt||{}
    this.value = 0
    this.inertia = 0
    this.delta = 0
    this.min = 0
    this.max = 1000
    this.last = 0
    this.interacting = false
    this.size = 100
}

Integration.prototype.update = function(dt) {
    var padMin = this.min-this.size/4
    if (this.value < padMin) {
        this.intertia = 0
    }
    if (this.value < 0) {
        this.delta *= (padMin-this.value) / padMin
    }

    this.value += this.size/2
    var dip = this.interacting ? 0 : (this.value % this.size - this.size/2)
    this.value -= this.delta
    this.delta = 0
    this.value -= this.inertia
    this.inertia *= 0.9
    this.value -= dip * 0.1
    this.value -= this.size/2
    this.value = clamp(this.value, padMin, this.max)
}

Integration.prototype.start = function(value) {
    this.interacting = true
    this.inertia = 0
    this.delta = 0
    this.last = value
}

Integration.prototype.move = function(value) {
    if (this.interacting) 
        this.delta = value - this.last
    this.last = value
}

Integration.prototype.end = function(value) {
    if (this.interacting) {
        this.interacting = false
        this.inertia = this.delta
        this.delta = 0
    }
}
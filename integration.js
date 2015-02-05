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
}

Integration.prototype.update = function(dt) {
    if (this.value < this.min) {
        this.intertia = 0
    }
    if (this.value < 0) {
        this.delta *= (this.min-this.value) / this.min
    }

    this.value -= this.delta
    if (this.interacting)
        this.delta = 0
    this.value -= this.inertia
    this.inertia *= 0.9
    this.value = clamp(this.value, this.min, this.max)
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
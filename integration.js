var clamp = require('clamp')

module.exports = function integration(opt) {
    return new Integration(opt)
}

function Integration(opt) {
    opt = opt||{}
    this.value = 0
    this.inertia = 0
    this.delta = 0
    
    this.size = 0
    this.max = 1
    this.last = 0
    this.interacting = false

    this.deltas = [0, 0, 0]
}

Integration.prototype.update = function(dt) {
    var g = 300
    var minGutter = -g
    var maxGutter = this.max + g
    var inside = true

    if (this.value < 0 || this.value > this.max) {
        this.inertia = 0 
        inside = false
    }
    else {
        if (this.value < 0 && this.delta > 0) {
            this.delta *= (minGutter-this.value) / -g
        } 
        else if (this.value > this.max && this.delta < 0) {
            this.delta *= (maxGutter-this.value) / g
        }
    }

    var dipping = !this.interacting
    var page = this.value / this.size
    if (page > 0.5 && page < (this.max/this.size)-0.5)
        dipping = false

    var dip = 0
    if (dipping) {
        if (inside)
            dip = (((this.value % this.size) + this.size) % this.size) 
        else {
            if (this.value < 0)
                dip = this.value 
            else
                dip = (this.value-this.max) 
        }
        var maxDipSpeed = 1
        var dipStrength = 1-clamp(Math.abs(this.inertia) / maxDipSpeed, 0, 1)
        dip *= 0.1 * dipStrength
    }
    this.value += this.size/2
    this.value -= this.delta
    this.delta = 0
    this.value -= this.inertia
    this.inertia *= 0.9
    
    this.value -= dip
    this.value -= this.size/2
    this.value = clamp(this.value, minGutter, maxGutter)
}

Integration.prototype.start = function(value) {
    this.interacting = true
    this.inertia = 0
    this.delta = 0
    this.last = value
}

Integration.prototype.move = function(value) {
    if (this.interacting) {
        this.delta = value - this.last
        this.deltas.push(this.delta)
        if (this.deltas.length > 3) 
            this.deltas.shift()
    }
    this.last = value
}

Integration.prototype.end = function(value) {
    if (this.interacting) {
        this.interacting = false
        console.log(this.deltas)

        var idx = 0
        var last = 0
        this.deltas.forEach(function(a, i) {
            var abs = Math.abs(a)
            if (abs > last) {
                idx = i
                last = abs
            }
        })
        this.inertia = this.deltas[idx]
        console.log(this.inertia)
        this.delta = 0
    }
}
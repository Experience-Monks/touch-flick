var xtend = require('xtend')
var sub = require('vectors/sub')(2)
var add = require('vectors/add')(2)
var mul = require('vectors/mult')(2)
var limit = require('vectors/limit')(2)
var clamp = require('clamp')

var number = require('as-number')
var easeBack = require('eases/expo-out')
var ease = require('eases/quint-out')
var Ticker = require('tween-ticker')

module.exports = function(opt) {
    return new TouchFlick(opt)
}

function TouchFlick(opt) {
    opt = opt||{}
    this.initial = [0, 0]
    this.last = [0, 0]
    this.velocity = [0, 0]
    this.position = [0, 0]
    this.dragging = false
    this.limit = number(opt.limit, 25)
    this.speed = number(opt.speed, 1)
    this.friction = number(opt.friction, 0.8)
    this.direction = opt.direction || [1, 1]
    this.offset = [0, 0]
    this.min = opt.min || [-Number.MAX_VALUE, -Number.MAX_VALUE]
    this.max = opt.max || [Number.MAX_VALUE, Number.MAX_VALUE]

    this._ticker = Ticker()
    this.edgeDistance = number(opt.edgeDistance, 35)
    this.edge = [0, 0]
    this.amplitude = 0
    this.slide = {
        ease: ease,
        duration: 3.25
    }
    this.back = {
        duration: 0.5,
        ease: easeBack
    }
}

TouchFlick.prototype.update = function(dt) {
    dt = Math.min(dt, 30)/1000
    this._ticker.tick(dt)

    //if we are auto-scrolling
    if (!this.dragging && this.amplitude > 0) {
        this._integrate(this.speed * this.amplitude)
    } 
    //otherwise if the finger is down..
    else if (this.dragging) {
        mul(this.velocity, this.friction)
    }
    copy(this.offset, this.position)
}

TouchFlick.prototype._integrate = function(speed) {
    //cap velocity 
    limit(this.velocity, this.limit)
    //multiply by direction so it only scrolls horiz/vert/both
    mul(this.velocity, this.direction)
    //speed of auto-scroll
    mul(this.velocity, speed)
    //the velocity based on flick strength
    sub(this.position, this.velocity)
    //clamp the position so auto-scroll doesn't go too far
    this._clamp()
}

TouchFlick.prototype.start = function(position) {
    this.dragging = true
    this.initial[0] = position[0] - this.position[0]
    this.initial[1] = position[1] - this.position[1]
    copy(this.last, position)
    this._ticker.cancel()
}

TouchFlick.prototype.move = function(position) {
    if (!this.dragging) 
        return

    //determine new velocity for the flick
    this.velocity[0] = this.last[0] - position[0]
    this.velocity[1] = this.last[1] - position[1]
    copy(this.last, position)
    
    //determine new position so it moves precisely with
    //the finger while dragging
    var dx = (position[0] - this.initial[0]) * this.direction[0]
    var dy = (position[1] - this.initial[1]) * this.direction[1]

    //as the user is touching, move the element exactly
    this.position[0] = dx
    this.position[1] = dy
    this._clamp(true)
}

TouchFlick.prototype._clamp = function(fingerDown) {
    var x = this.position[0],
        y = this.position[1]
    this.position[0] = clamp(this.position[0], this.min[0], this.max[0])
    this.position[1] = clamp(this.position[1], this.min[1], this.max[1])

    if (this.edgeDistance === 0) { //avoid div by zero
        this.edge[0] = this.edge[1] = 0
    }
    else if (fingerDown) {
        var cx = x-this.position[0],
            cy = y-this.position[1],
            dx = cx / this.edgeDistance, //distance
            dy = cy / this.edgeDistance,
            mx = dx < 0 ? -1 : 1, //get sign
            my = dy < 0 ? -1 : 1

        //clamp and absolute for easing
        dx = clamp(Math.abs(dx), 0, 1)
        dy = clamp(Math.abs(dy), 0, 1)
        
        this.edge[0] = this.edgeDistance * dx * mx
        this.edge[1] = this.edgeDistance * dy * my
    }

    this.position[0] += this.edge[0] 
    this.position[1] += this.edge[1]
}


TouchFlick.prototype.end = function(position) {
    this.dragging = false

    //when the touch event stops, initiate a "flick"
    //based on velocity that dampens over time with
    //a specifc easing function
    this.amplitude = 1
    this._ticker.cancel()
    this._ticker.to(this, xtend({
        amplitude: 0,
    }, this.slide))
    this._ticker.to(this, xtend({
        edge: [0, 0],
    }, this.back))
}


function copy(a, other) {
    a[0] = other[0]
    a[1] = other[1]
    return a
}
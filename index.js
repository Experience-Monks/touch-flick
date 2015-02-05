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
    
    this.edgeDistance = number(opt.edgeDistance, 35)
}

TouchFlick.prototype.update = function(dt) {
    dt = Math.min(dt, 30)/1000
        
}

TouchFlick.prototype.start = function(position) {
    this.dragging = true
    
}

TouchFlick.prototype.move = function(position) {
    if (!this.dragging) 
        return

}

TouchFlick.prototype.end = function(position) {
    this.dragging = false
}

function copy(a, other) {
    a[0] = other[0]
    a[1] = other[1]
    return a
}
require('canvas-testbed')(render, start)
var evOffset = require('mouse-event-offset')
var tweenr = require('tweenr')

var bounds = {
    x: 50,
    y: 0,
    width: 250,
    height: 400
}

var dragger
var cellSize = 50
var totalCells = 30

var flick = require('../integration')({
    cellSize: cellSize,
    totalCells: totalCells,
    viewSize: bounds.height
})

// flick.direction = [0, 1]
// // flick.min[0] = -bounds.width*0.25
// flick.min[1] = -bounds.height*0.5
// // flick.max[0] = 900
// flick.max[1] = 0

function render(ctx, width, height, dt) {
    ctx.clearRect(0,0,width,height)
    ctx.save()

    ctx.save()
    flick.update(dt)


    ctx.translate(0, -flick.value)
    
    for (var i=0; i<totalCells; i++) {
        ctx.fillStyle = ['red','grey'][i%2]
        ctx.fillRect(bounds.x, bounds.y+i*cellSize, bounds.width, cellSize)
    }
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, flick.fullSize)
    ctx.restore()

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
    ctx.restore()
}

function start(context, width, height) {
    var canvas = context.canvas
    setupEvents(canvas)
}

function offset(ev, opt) {
    var pos = evOffset(ev, opt)
    return [pos.x, pos.y]
}

function setupEvents(canvas) {
    dragger = require('touches')(window, {
        target: canvas
    })
    ;['start', 'move', 'end'].forEach(function(name) {
        dragger.on(name, function(ev, pos) {
            //ignore start event if out of bounds
            if (name === 'start' && !inBounds(pos, bounds))
                return
            flick[name](pos[1])
        })
    })
}

function inBounds(pos, bounds) {
    if (!bounds)
        return true
    return pos[0] >= bounds.x
        && pos[1] >= bounds.y
        && pos[0] < (bounds.x+bounds.width)
        && pos[1] < (bounds.y+bounds.height)
}

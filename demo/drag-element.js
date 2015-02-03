var Emitter = require('events/')
var getOffset = require('mouse-event-offset')

var events = [
    'touchstart', 'touchmove', 'touchend',
    'mousedown', 'mousemove', 'mouseup'
]

module.exports = function handler(element, opt) {
    opt = opt||{}

    var parent = opt.parent || window
    var preventDefault = opt.preventDefault!==false

    var emitter = new Emitter()

    //add all events
    events.forEach(function(type) {
        var name = normalize(type)
        var e = name === 'end' ? parent : element

        e.addEventListener(type, function(ev) {
            if (name === 'start' && preventDefault)
                ev.preventDefault()

            //get 2D position
            var pos = offset(type, ev)

            //dispatch the normalized event to our emitter
            emitter.emit(name, pos)
        }, false)  
    })

    return emitter
}

//normalize touchstart/mousedown to "start" etc
function normalize(event) {
    return event.replace(/^(touch|mouse)/, '')
     .replace('up', 'end')
     .replace('down', 'start')
}

//get 2D client position of touch/mouse event
function offset(type, ev) {
    var opt
    if (type === 'touchstart' || type === 'touchmove')
        opt = ev.targetTouches[0]
    else if (type === 'touchend')
        opt = ev.changedTouches[0]

    //get client position {x, y}
    var pos = getOffset(ev, opt)
    return [pos.x, pos.y]
}

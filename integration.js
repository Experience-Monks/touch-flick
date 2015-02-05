var clamp = require('clamp')

module.exports = function integration(opt) {
	return new Integration(opt)
}

function Integration(opt) {
	opt = opt||{}

	this.value = 0
	this.momentum = 0
	
	this.totalCells = opt.totalCells || 12
	this.cellSize = opt.cellSize || 10
	this.cellSizeHalf = this.cellSize * .5
	this.fullSize = this.cellSize * this.totalCells
	this.viewSize = opt.viewSize || 600
	this.gutterSize = opt.gutterSize || this.viewSize * .25;
	this.max = this.fullSize - this.viewSize;
	this.maxGutter = this.max + this.gutterSize;
	this.dipToClosestCell = opt.dipToClosestCell === undefined ? true : opt.dipToClosestCell;
	this.lastInput = 0;
	this.interacting = false;

	this.dipMaxSpeed = 10;
	this.dipSnappiness = .1;

	this.inputDelta = 0;
	this.inputDeltaIndex = 0;
	this.inputDeltaHistoryMax = 3;
	this.inputDeltas = [];
	for (var i = 0; i < this.inputDeltaHistoryMax; i++) {
		this.inputDeltas.push(0);
	};
}

Integration.prototype.update = function(dt) {
	var isBefore = this.value < 0;
	var isAfter = this.value > this.max;
	var isInside = !isBefore && !isAfter;

	//ease input at edges
	if(isBefore) {
		this.momentum = 0;
		if (this.inputDelta > 0) {
			this.inputDelta *= 1-(this.value / -this.gutterSize);
		}
	} else if(isAfter) {
		this.momentum = 0;
		if (this.inputDelta < 0) {
			this.inputDelta *= (this.maxGutter - this.value) / this.gutterSize;
		}
	}

	var dipping = !this.interacting;

	this.value -= this.cellSizeHalf;
	var dip = 0
	if (dipping) {
	    if (isInside && this.dipToClosestCell) {
	        dip = (((this.value % this.cellSize) + this.cellSize) % this.cellSize) - this.cellSizeHalf 
	    } else if(isBefore) {
            dip = this.value + this.cellSizeHalf;
        } else if(isAfter) {
            dip = this.value - this.max + this.cellSizeHalf;
	    }
	    var dipStrength = (1-clamp(Math.abs(this.momentum) / this.dipMaxSpeed, 0, 1)) * this.dipSnappiness;
	    dip *= dipStrength
	}
	this.value -= this.inputDelta;
	this.inputDelta = 0;
	this.value -= this.momentum
	this.momentum *= 0.9;
	this.value -= dip;
	
	this.value += this.cellSizeHalf;
	this.value = clamp(this.value, -this.gutterSize, this.maxGutter);
}

Integration.prototype.start = function(value) {
	this.interacting = true
	this.momentum = 0
	this.inputDelta = 0
	this.lastInput = value
}

Integration.prototype.move = function(value) {
	if (this.interacting) {
		this.inputDelta = value - this.lastInput
		this.inputDeltas[this.inputDeltaIndex] = this.inputDelta;
		this.inputDeltaIndex = (this.inputDeltaIndex+1) % this.inputDeltaHistoryMax;
		this.lastInput = value
	}
}

Integration.prototype.end = function(value) {
	if (this.interacting) {
		this.interacting = false
		this.momentum = this.inputDeltas.reduce(function(a, b) {
			return Math.abs(a) > Math.abs(b) ? a : b
		}, 0)
		this.delta = 0
		for (var i = 0; i < this.inputDeltaHistoryMax; i++) {
			this.inputDeltas[i] = 0;
		};
	}
}
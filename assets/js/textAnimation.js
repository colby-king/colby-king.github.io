/**
Text rendering animation
By Colby King
*/


var animation = (function(config){
	_this = this;
	_this.config = config;
	_this.canvas = document.getElementById(config.canvas);
	_this.ctx = _this.canvas.getContext('2d');
	_this.width = _this.canvas.getBoundingClientRect().width;
	_this.height = _this.canvas.getBoundingClientRect().height;
	fixCanvasDPI(_this.width, _this.height);
	_this.animate = true;

	/* Text to display */
	_this.textToWrite = config.text;

	function getPixelRatio() {
	    var ctx = _this.ctx;
	        dpr = window.devicePixelRatio || 1,
	        bsr = ctx.webkitBackingStorePixelRatio ||
	              ctx.mozBackingStorePixelRatio ||
	              ctx.msBackingStorePixelRatio ||
	              ctx.oBackingStorePixelRatio ||
	              ctx.backingStorePixelRatio || 1;
	    return dpr / bsr;
	};

	function fixCanvasDPI(w, h, ratio) {
	    if (!ratio){ratio = getPixelRatio();}
	    _this.canvas.width = w * ratio;
	    _this.canvas.height = h * ratio;
	    _this.canvas.style.width = w + "px";
	    _this.canvas.style.height = h + "px";
	    _this.canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	_this.background = {
		color: _this.config.background,
		createGradient: function(){
			//_this.huh += 1;
			var grd = ctx.createRadialGradient(0, 50, 5, 90, 60, 100);
			grd.addColorStop(0, "black");
			grd.addColorStop(1, "black");
			return grd;
		},
		setBackground: function(){
			_this.ctx.fillStyle = this.color;
			_this.ctx.fillRect(0, 0, _this.width, _this.height);
		},
		render: function(){
			this.setBackground();
		}
	}

	_this.textElement = {
		textColor: _this.config.textColor,
		fontSize: _this.config.fontSize,
		font: 'Monaco',
		cursorHeight: 23,
		cursorWidth: 7,
		currentIndex: 1,
		speed: 5,
		posX: (_this.width / 2),
		posY: (_this.height / 2),
		frameStep: 0,
		blinkStep: 0,
		textLines: _this.textToWrite.split('\n'),

		resetText: function(text){
			this.currentIndex = 1;
			this.textLines = text.split('\n');
		},

		getWidthOfLongestLine: function(){
			var longestLine = this.textLines[0];
			for(let i = 1; i < this.textLines.length; i++){
				if(this.textLines[i].length > longestLine.length){
					longestLine = this.textLines[i]
				}
			}
			return this.getTextWidth(longestLine)
		},

		blink: function(offsetX, offsetY){
			var lastLine = this.getTextLineIndex(this.currentIndex, this.textLines.length-1);
			var lastIndex = this.textLines.length - 1;
			var width = this.getTextWidth(this.textLines[lastIndex]);
			this.blinkStep++;
			if(this.blinkStep < 20){
				this.renderCursor(lastIndex, width, offsetX, offsetY);
			} else if(this.blinkStep == 40){
				this.blinkStep = 0;
			}
		},

		getLengthUpToCurrentLine(curLine){
			var totalLengthToLine = 0;
			for(let i = 0; i <= line; i++) totalLengthToLine += this.textLines[i].length;
			return totalLengthToLine;

		},

		getCurrentLineRendering(){
			var runningLength = 0;
			for(let i = 0; i < this.textLines.length; i++){
				runningLength += this.textLines[i].length;
				if(this.currentIndex <= runningLength) return i;
			}
			return this.textLines.length - 1;

		},

		getTextLineIndex: function(curIndex, line){
			var totalLengthToLine = 0;
			for(let i = 0; i <= line; i++) totalLengthToLine += this.textLines[i].length;
			if(curIndex >= totalLengthToLine) return this.textLines[line].length;
			return this.textLines[line].length - (totalLengthToLine - curIndex);
		},

		getTextWidth(text){
			return _this.ctx.measureText(text).width;
		},

		renderCursor: function(line, textWidth, offsetX, offsetY){
			var curLine = this.getCurrentLineRendering();
			var yTopBuffer = this.fontSize * .2;
			// only draw cursor if line is rendering
			if(line == curLine){
				_this.ctx.fillRect(
  					this.posX + textWidth - offsetX, 
  					this.posY + (curLine * this.fontSize) - this.fontSize - offsetY+yTopBuffer, 
  					this.fontSize * .40, 
  					this.fontSize
  				);

			}
		},

		setStyles: function(){
			_this.ctx.font = (this.fontSize + 'px ' + this.font);
			_this.ctx.fillStyle = this.textColor
		},

		render: function(){
			this.setStyles();
			var stillTypingMessage = this.currentIndex < _this.textToWrite.length;
			var offsetX = this.getWidthOfLongestLine()/2;
			var offsetY = (this.textLines.length * this.fontSize)/2;
			// Draw each line of text
  			for(let i = 0; i < this.textLines.length; i++){
  				var calculatedIndex = this.getTextLineIndex(this.currentIndex, i);
  				var text = this.textLines[i].substring(0, calculatedIndex);
  				// Draw the text
  				_this.ctx.fillText(
  					text, 
  					this.posX - offsetX, // Center by subtracting offset
  					(this.posY + (i * this.fontSize) - offsetY)
  				);
  				// Draw cursor after text if still typing message
  				if(stillTypingMessage){
  					var width = this.getTextWidth(text);
  					this.renderCursor(i, width, offsetX, offsetY);
  				}
  			}

  			if(stillTypingMessage){
  				// Reset the counter
  				if(this.frameStep > this.speed){
	  				this.currentIndex++;	
	  				this.frameStep = 0;
	  			}
	  			this.frameStep++;
	  		} else {
	  			this.blink(offsetX, offsetY);
	  		}
		}
	}

	function draw(){
		if(_this.animate){
			_this.ctx.clearRect(0, 0, _this.config.width, _this.config.height);
			_this.background.render();
			_this.textElement.render();
			var id = window.requestAnimationFrame(draw);
		}
	}

	function stop(){
		_this.animate = false;
		_this.ctx.clearRect(0, 0, _this.config.width, _this.config.height);
		_this.ctx = null;
		return new Promise(function(resolve, reject){
			setTimeout(() => {
				resolve();
			}, 100);
		});
	}

	function reset(text){
		stop()
		.then(function(){
			_this.ctx = _this.canvas.getContext('2d');
			_this.textToWrite = text;
			_this.textElement.resetText(text);
			console.log(_this.textElement.textLines);
			run()
		});

	}

	function run(){
		_this.animate = true;
		draw();
	}

	return {
		run: run,
		stop: stop,
		reset: reset
	}

});


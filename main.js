var gameCanvas = document.getElementById('game');
var game2d = gameCanvas.getContext('2d');


var updateBox = function(){
	game2d.fillRect(x,y,width,height);
	}

var update = function(){
	
	}

var int=self.setInterval(function(){update()},1);
var gameCanvas = document.getElementById('game');
var game2d = gameCanvas.getContext('2d');

var keys = {
	left:false,
	right:false,
	up:false
}

var gravity = 2;

var player ={
	x:200,
	y:200,
	width:25,
	height:25,
	xForce:0,
	yForce:gravity,
	friction:.05,
	weight:.01,
}

var things = [
	{x:200,y:500,width:150,height:20,drawing:false}
	];
	
var newBox = function(x,y){
	this.x=x;
	this.y=y;
	this.width=0;
	this.height=0;
	this.dx=x;
	this.dy=y;
	this.drawing=true;
}

var addForce = function(object,nx,ny){
	with(object){
		xForce+=nx;
		yForce+=ny;
	}
}

var physicsMove = function(object){
		for(var i=0;i<things.length;i++){
			with(object){
				game2d.fillRect(x,y,width,height);
				y += yForce;
				x += xForce;
				(yForce<gravity) ? yForce+=weight : yForce = gravity;
				//check walls colission
				if(x<=0){x = 0;xForce=0;}
				else if(x+width >= gameCanvas.width){x=gameCanvas.width-width;xForce=0;}
				if(y<=0){y=0;yForce=gravity;}
				else if(y+height>=gameCanvas.height){y=gameCanvas.height-height;}
				xForce/=1+friction;
				//check boxes colission
				for(var i=0;i<things.length;i++){
					if(x+width >= things[i].x + things[i].width/10 && x <= things[i].x+things[i].width - things[i].width/10){
						if(y+height >= things[i].y && y <= things[i].y+things[i].height){
							if(y+height < things[i].y + height/2){y=things[i].y-height}
							else{y=things[i].y+things[i].height; yForce=gravity} //hits roof, falls
						}
					}
					if(y+height >= things[i].y +height/10 && y <= things[i].y+things[i].height -height/10){
						console.log(1);
						if(x+width >= things[i].x && x <= things[i].x+things[i].width){
							console.log(2);
							if(x+width < things[i].x + width/2){x=things[i].x-width}
							else{x=things[i].x+things[i].width}
					}
				}
			}
		}
	}
}

var update = function(){
	gameCanvas.width = gameCanvas.width;
	for(var i=0;i<things.length;i++){with(things[i]){
		game2d.fillStyle = "#555555";
		game2d.fillRect(x,y,width,height);

		//testing
		}} //draws boxes
	game2d.fillStyle ="#ffffff";
	physicsMove(player);
	if(keys.left){addForce(player,-.1,0)}
	else if(keys.right){addForce(player,.1,0)}
	}

var int=self.setInterval(function(){update()},1);
//click handling, creates new terrain
document.addEventListener('mousedown', function(e){
	things.push(new newBox(e.clientX, e.clientY));
},false);
document.addEventListener('mousemove', function(e){
	with(things[things.length-1]){
		if(drawing){
			width = Math.abs(e.clientX-dx);
			height = Math.abs(e.clientY-dy);
			if(e.clientX<dx){
				x=e.clientX;
			}
			if(e.clientY<dy){
				y=e.clientY;
			}
		}
	}
},false);
addEventListener('mouseup', function(e){
	things[things.length-1].drawing = false;
},false);

//movement controls
document.addEventListener('keydown', function(e){
	if(e.keyCode==65||e.keyCode==37){keys.left=true}
	if(e.keyCode==68||e.keyCode==39){keys.right=true}
	if(e.keyCode==87||e.keyCode==38){if(!keys.up){addForce(player,0,-4);keys.up=true}}
},false);
document.addEventListener('keyup', function(e){
	if(e.keyCode==65||e.keyCode==37){keys.left=false}
	if(e.keyCode==68||e.keyCode==39){keys.right=false}
	if(e.keyCode==87||e.keyCode==38){keys.up=false}
},false);
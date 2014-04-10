/*
BUGS:
very bad x-axis colission with tall, skinny boxes.
vary bad box-on-box colission
when scrolling, player moves slightly different speed than scroll
fake-motion-blur looks super fake when jumping (on a thin block)
keys overlap with browser commands (alt-d, ctrl-w)

FEATURES to add:
block physics - affected by weight and stuff
*/

var gameCanvas = document.getElementById('game');
var game2d = gameCanvas.getContext('2d');
var globalY = 0;
var debug = false;

var keys = {
	left:false,
	right:false,
	up:false,
	del:false, //ctrl, deletes boxes on click
	square:false, //shift, makes square boxes
	physics:false, //alt, sets boxes as physics on click
}

var gravity = 8;

var player ={
	x:200,
	y:200,
	width:25,
	height:25,
	xForce:0,
	yForce:gravity,
	friction:.1,
	weight:.1,
}

var things = [
	{x:200,y:500,width:150,height:20,drawing:false,yForce:0,xForce:0,weight:.1,friction:.02,fixed:true},
	];
	
var newBox = function(x,y){
	this.x=x;
	this.y=y;
	this.width=0;
	this.height=0;
	this.dx=x;
	this.dy=y;
	this.drawing=true;
	this.yForce=gravity;
	this.xForce=0;
	this.weight=.05;
	this.friction=.05;
	this.fixed=!keys.physics;
}

var addForce = function(obj,nx,ny){
	with(obj){
		xForce+=nx;
		if(yForce==0){yForce+=ny;}
	}
}

var physicsMove = function(obj){
	// obj.old[0] = obj;
	// var opacity = 1;
	// for(var i=0;i<50;i++){
		// obj.old[i+1] = obj.old[i];
		// game2d.fillStyle = "rgba(255,0,0,"+opacity+")";
		// with(obj.old[i]){game2d.fillRect(x,y,width,height)}
		// opacity-=.1;
	// }
	with(obj){
		if(xForce!=0 || yForce!=0){
			for(var i=0;i<10;i++){ //draws fake-motion-blur
				game2d.fillStyle = 'rgba(255,255,255,'+1/i+')';
				game2d.fillRect(x-xForce*i,y-yForce*i,width,height);
				}
		}
		game2d.fillStyle = "rgb(255,255,255)";
		game2d.fillRect(x,y,width,height);
		y += yForce;
		x += xForce;
		(yForce<gravity) ? yForce+=weight : yForce = gravity;
		//check walls colission (outdated, scrolls now)
		//if(x<=0){x = 0;xForce=0;}
		//else if(x+width >= gameCanvas.width){x=gameCanvas.width-width;xForce=0;}
		// if(y<=0){y=0;yForce=gravity/8;}
		if(globalY<=0 && y+height>=gameCanvas.height){y=gameCanvas.height-height;yForce=0;}
		(yForce==0) ? xForce/=1+friction : xForce/=1+friction/3;
		//check boxes colission
		var yPad = 50/Math.abs(xForce);
		var xPad = 50/Math.abs(yForce);
		for(var i=0;i<things.length;i++){if(obj!=things[i]){
			if(x+width >= things[i].x + things[i].width/yPad && x <= things[i].x+things[i].width - things[i].width/yPad){
				if(y+height >= things[i].y && y <= things[i].y+things[i].height){
					if(y+height < things[i].y + things[i].height/2){
						y=things[i].y-height;
						yForce=0;
						things[i].yForce += yForce;
					} //lands on object
					else{
						y=things[i].y+things[i].height;
						yForce=gravity/8;
						things[i].yForce += yForce;
					} //hits roof, falls
				}
			}
			if(y+height >= things[i].y +height/xPad && y <= things[i].y+things[i].height -height/xPad){
				if(x+width >= things[i].x && x <= things[i].x+things[i].width){
					if(x+width < things[i].x + things[i].width/2){
						x=things[i].x-width;
						things[i].xForce += xForce;
					}
					else{
						x=things[i].x+things[i].width;
						things[i].xForce += xForce;
					}
				}
			}
		}}
	}
}

var scrollGame = function(obj){// follows object, scrolls all other elements
	var gW = gameCanvas.width;
	var gH = gameCanvas.height;
	var scroll = function(axis, amount){
		for(var i=0;i<things.length;i++){
			things[i][axis] += amount;
		}
		player[axis] += amount;
	}
	with(obj){
		if(x+width>=gW-gW/10 && xForce>0){scroll('x',-xForce)}; //scroll right
		if(x<=gW/10 && xForce<0){scroll('x',-xForce)}; //scroll left
		if(y<=gH/10 && yForce<0){scroll('y',-yForce);globalY-=yForce} //scroll up
		if(y+height>=gH-gH/10 && yForce>0 && globalY>0){
			scroll('y',-yForce);
			globalY-=yForce;
		} //scroll down
	}
}

var update = function(){
	gameCanvas.width = gameCanvas.width;
	for(var i=0;i<things.length;i++){with(things[i]){
		if(!fixed){physicsMove(things[i])}
		else{
			game2d.fillStyle = "rgb(255,255,255)";
			game2d.fillRect(x,y,width,height);
					//DEbugging junk: (SHows padding)
			if(debug){
				var dxf = 50/Math.abs(player.xForce);
				var dyf = 50/Math.abs(player.yForce);
				game2d.fillStyle = "rgb(255,0,0)";
				game2d.fillRect(x+width/(dxf*2),y+height/(dyf*2),width-width/dxf,height-height/dyf);
			}
		}
		}} //draws boxes
	physicsMove(player);
	scrollGame(player);
	if(keys.left){addForce(player,-.15,0)}
	else if(keys.right){addForce(player,.15,0)}
	}

var int=self.setInterval(function(){update()},1);

//click handling, creates new terrain
document.addEventListener('mousedown', function(e){
	var Cx = e.clientX - gameCanvas.getBoundingClientRect().left;
	var Cy = e.clientY - gameCanvas.getBoundingClientRect().top;
	if(!keys.del){things.push(new newBox(Cx,Cy));}
	else{ //find and remove clicked boxes
		var arr = [];
		for(var i=0;i<things.length;i++){with(things[i]){
			if(Cx >= x && Cx <= x+width && Cy >= y && Cy <= y+height){
			}
			else{arr.push(things[i]);}
		}}
		things = arr;
	}
},false);

document.addEventListener('mousemove', function(e){
	if(things.length !=0){
		with(things[things.length-1]){
			if(drawing){
				var Cx = e.clientX - gameCanvas.getBoundingClientRect().left;
				var Cy = e.clientY - gameCanvas.getBoundingClientRect().top;
				width = Math.abs(Cx-dx);
				if(width<=10){width=10}
				if(keys.square){ //square box
					if(Cy<dy){(Cy<dy-width) ? y=dy-width : y=Cy;} //ehhh works for now
					else{y=dy}
					height=width;
				}
				else{
					height = Math.abs(Cy-dy);
					if(height<=10){height=10}
					if(Cy<dy){y=Cy;}
				}
				if(Cx<dx){x=Cx;}
				// weight = width*height/500; //scale weight based on size later
			}
		}
	}
},false);

addEventListener('mouseup', function(e){
	if(things.length !=0){things[things.length-1].drawing = false;}
},false);

//controls
document.addEventListener('keydown', function(e){
	if(e.keyCode==65||e.keyCode==37){keys.left=true}
	if(e.keyCode==68||e.keyCode==39){keys.right=true}
	if(e.keyCode==87||e.keyCode==38){if(!keys.up){addForce(player,0,-6);keys.up=true}}
	if(e.keyCode==17){keys.del=true}
	if(e.keyCode==16){keys.square=true}
	if(e.keyCode==18){keys.physics=true}
},false);
document.addEventListener('keyup', function(e){
	if(e.keyCode==65||e.keyCode==37){keys.left=false}
	if(e.keyCode==68||e.keyCode==39){keys.right=false}
	if(e.keyCode==87||e.keyCode==38){keys.up=false}
	if(e.keyCode==17){keys.del=false}
	if(e.keyCode==16){keys.square=false}
	if(e.keyCode==18){keys.physics=false}
},false);
//turns off keys when tabs/window is switched
window.addEventListener('blur', function() {
  keys.left,keys.right,keys.square,keys.physics=false;
},false);
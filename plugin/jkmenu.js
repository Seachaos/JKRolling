/*

Version : 0.0.3
Modify time : 20160130
-------
Copyright (c) 2016, Seachaos
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of JKRolling nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

function JKRolling_Menu(){
	// this.menu_style = 'Backslash';
	this.menu_style = 'Slash';
	this.menu = [
		{
			title:'PRE',
			color:'#FFF',
			background:'#333'
		}, {
			title:'JKRolling',
			click:'http://seachaos.github.io/JKRolling/',
			url_new_window:true
		}, {
			color:'#630',
			background:'#FFF',
			title:'First',
			click:function(){
				alert('First Click');
			}
		}, {
			color:'#0A0',
			background:'#CCC',
			title:'Second(Close)',
			click:':close'
		}, {
			color:'#00A',
			background:'#999',
			title:'Third',
		}, {
			title:'END',
			color:'#FFF',
			background:'#333'
		}
	];

	this.float_move_range = 0.1;
	this.float_x = 0;
	this.background = '#000';
}

// for gen uuid
JKRolling_Menu.prototype.uuid = function() {
  function gen() {
    return Math.floor((1 + Math.random()) * 0xFFFFFF)
      .toString(4)
      .substring(1).toString(16);;
  }
  return 'jk-guid-' + gen() + '-'+ gen() + '-'+ gen();
}

// hook windows size and create canvas / menu dom
JKRolling_Menu.prototype.resize = function(){
	var dom = this.menu_dom;
	var canvas = this.jcanvas;
	// resize menu dom
	dom.width($(window).width());
	dom.height($(window).height());

	this.width = parseInt(dom.width());
	this.height = parseInt(dom.height());

	// resize canvas
	canvas[0].width = this.width;
	var height = this.height;
	canvas[0].height = height;
	dom.canvas=canvas[0];
}

// when click or show menu
JKRolling_Menu.prototype.show = function(){
	var dom = this.menu_dom;
	var me = this;
	$(window).resize(function(){
		me.resize();
		me.render();
	});
	this.resize();
	// show menu dom
	dom.fadeIn();
	this.render();
}

JKRolling_Menu.prototype.hide = function(){
	var dom = this.menu_dom;
	dom.fadeOut();
}

// render menu canvas
JKRolling_Menu.prototype.render = function(){
	switch(this.menu_style){
		case 'Slash':
			this._render_slash(1);
			break;
		case 'Backslash': default:
			this._render_slash(-1);
			break;
	}
}


JKRolling_Menu.prototype._render_slash = function(slash_direct){
	var ctx = this.ctx;

	var menu = this.menu;
	var length = menu.length;
	var splitNum = this.height / 2;
	var preWidth = this.width / (length-1);
	var preHeight = this.height / splitNum;
	
	ctx.save();

	ctx.beginPath();
	ctx.rect(0, 0, this.width, this.height);
	ctx.fillStyle = this.background;
	ctx.fill();

	var scaleBl = 1 + this.float_move_range;

	var offsetX = -preWidth / 2;
	var offsetY = -(this.float_move_range/2) * this.height;
	// set offset
	ctx.translate( offsetX, offsetY);
	this.eventX += this.float_x;
	this.eventY += offsetY + this.float_y;
	// scale
	ctx.scale(scaleBl, scaleBl);
	this.eventX *= scaleBl;
	this.eventY *= scaleBl;
	
	ctx.translate(this.float_x, this.float_y * 0.8);
	var mouseFound = -1;
	for(var i in menu){
		var index = parseInt(i);
		var item = menu[index];
		mouseFound = this._render_slash_sction(mouseFound, slash_direct, index, item, preWidth, preHeight, splitNum);
	}
	ctx.restore();
	this.mouseFound = mouseFound;
}
JKRolling_Menu.prototype.mousemove = function(e){
	// console.log(e.clientX +'/'+e.clientY);
	this.eventX = e.clientX;
	this.eventY = e.clientY;
	var x = this.width / 2;
	x = (e.clientX - x) / x;
	var maxWidth = this.float_move_range * this.width;
	x *= - maxWidth;
	this.float_x = x / 2;

	var y = this.height / 2;
	y = (e.clientY - y) / y;
	var maxHeight = this.float_move_range * this.height;
	y *= - maxHeight;
	this.float_y = y / 2;

	this.render();
}
JKRolling_Menu.prototype._render_slash_sction = function(mouseFound, slash_direct, index, item, preWidth, preHeight, splitNum){
	var ctx = this.ctx;
	var title = item.title;
	// console.log('i:'+ index + '|' + preWidth + '/' + preHeight +'|' + title );
	var sy = 0, ox = preWidth * index, sx = ox;

	var me = this;
	var width_move = -(preWidth /2) / splitNum;
	width_move *= slash_direct;

	
	function drawRectBorder(sx,sy,ex,ey, ax){
		ctx.beginPath();
		ctx.lineWidth="4";
		ctx.rect(sx,sy,ex - sx,ey - ey); 
		ctx.stroke();
	}

	function drawRectImage(sx,sy,ex,ey, ax){
		if(!item.img_width){
			return;
		}
		var img = item.img;
		var img_width = item.img_width;

		var width = ex - sx;
		var bl = me.height > item.img_height ? (item.img_height / me.height) : ((preWidth * (1+me.float_move_range)) / img_width);
		var is = Math.abs(sx-ox);
		is = slash_direct >0? (img_width * 0.3 - is * bl):is*bl;
		ctx.drawImage(img,
			is, sy*bl,  width*bl, (ey - sy)*bl,
			sx, sy, width, ey - sy +1
			);
	}

	var drawFunction = drawRectBorder;
	if(item.background_img){ // draw image
		drawFunction = drawRectImage;
	}else{ // draw color background
		ctx.strokeStyle= item.background || "#CCC";
	}

	var startX = sx, startY = sy;
	for(var ax=1;ax<splitNum;ax++){
		var ex = sx + preWidth;
		var ey = sy + preHeight;
		if(mouseFound== -1 && this.eventX >sx && this.eventX <ex && this.eventY >= sy && this.eventY <= ey ){
			mouseFound = index;
		}
		drawFunction(sx,sy,ex,ey, ax);
		sy = ey;
		sx += width_move;
	}

	var endX = sx, endY = sy;
	// draw title
	if(item.title){
		ctx.fillStyle = item.color || '#000';
		ctx.font = "30px Arial";
		ctx.fillText(item.title, (startX + endX + preWidth / 2) / 2, (startY + endY) / 2);
	}
	return mouseFound;
}

JKRolling_Menu.prototype.click = function(){
	if(this.mouseFound==-1){
		return;
	}
	var item = this.menu[this.mouseFound];
	if(typeof(item.click)=="string"){
		if(item.click==':close'){
			this.hide();
			return;
		}
		if(item.url_new_window){
			window.open(item.click);
		}else{
			window.location.href = item.click;
		}
	}else if(typeof(item.click)=="function"){
		item.click();
	}
}

JKRolling_Menu.prototype.load_images = function(){
	var dom = this.menu_dom;
	var me = this;
	for(var i in this.menu){
		var item = this.menu[i];
		if(!item.background_img){
			continue;
		}
		var src = item.background_img;
		var img_id = this.uuid();
		var img = $('<img id="'+img_id+'" />');
		img.attr('src', src);
		img.css('display','none');
		img[0].item = item;
		img.load(function(){
			var item = this.item;
			item.img_width = parseFloat(this.width);
			item.img_height = parseFloat(this.height);
		});
		dom.append(img);
		item.img = document.getElementById(img_id);
	}
}

JKRolling_Menu.prototype.apply = function(btn_dom){
	var me = this;

	// create canvas
	var canvas_id = this.uuid();
	this.jcanvas = $('<canvas id="' + canvas_id + '" />');

	// create menu dom
	this.menu_dom = $('<div style="background:#000;position:fixed;left:0px;top:0px;display:none;" />');
	this.menu_dom.append(this.jcanvas);
	$('body').append(this.menu_dom);

	this.load_images();

	// prepare ctx
	this.canvas = document.getElementById(canvas_id);
	this.ctx = this.canvas.getContext("2d");

	// bind menu show action
	btn_dom.click(function(){
		me.show();
	});
	this.menu_dom.mousemove(function(e){
		me.mousemove(e);
	})
	this.menu_dom.click(function(e){
		me.click();
	});
}

// jkrolling plugin register
$.jkmenu = {
	apply : function(btn_dom, menu){
		var jkm = new JKRolling_Menu();
		jkm.menu = menu || jkm.menu;
		jkm.apply(btn_dom);
	}
}

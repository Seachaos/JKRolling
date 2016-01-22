/*


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

$.jkrolling = {
	type_straight : 1,
	type_roller : 0,

	apply : function(dom, imgUrl, opt){
		var canvas = $('<canvas id="canvas" />');
		if(opt==null){
			opt = {};
		}
		// slice effect num
		dom.sliceNum = opt.sliceNum || 300;
		// Chrome Speed
		dom.rollingSpeed = opt.rollingSpeed || 30;
		// FireFox speed
		dom.rollingSpeed2 = opt.rollingSpeed2 || 0.2;
		// rolling center keep range
		dom.centerKeepRange = opt.centerKeepRange || 0.1;
		// rolling deep
		dom.rollingDeep = opt.rollingDeep || 0.3;
		// rolling type
		dom._rolling_type = opt.rollingType || $.jkrolling.type_roller;


		dom.resize = function(){
			canvas[0].width = parseInt(dom.width());
			var height = parseInt(dom.height());
			canvas[0].height = height;
			dom.canvas=canvas[0];
		}
		dom.append(canvas);
		dom.resize();
		$(window).resize(function(){
			dom.resize();
			dom.render();
		});

		var img = $('<img src="'+imgUrl+'" style="display:none;" id="demoImg" />');
		img.load(function(){
			dom.pic_real_width = parseFloat(this.width);
			dom.pic_real_height = parseFloat(this.height);
			console.log('w:'+dom.pic_real_width +"/" + dom.width() +"/" + canvas.width());
			$.jkrolling.prepareRender(dom, canvas);
		});
		dom.css('overflow','hidden');
		dom.append(img);

		dom.offsetY = 0;
		dom.jkbl = 1;

		// bind actions
		dom.scrollUp = function(value){
			dom.offsetY += value;
			if(dom.offsetY > 0){
				dom.offsetY = 0;
			}
			dom.render();
		}
		dom.scrollDown = function(value){
			dom.offsetY += value;
			var max = - dom.pic_real_height + parseInt(dom.height()) / dom.jkbl;
			if(dom.offsetY < max){
				dom.offsetY = max;
			}
			dom.render();
		}
		dom.bind('touchstart', function(e){
			dom.touchStartY = event.touches[0].pageY;
		});
		dom.bind('touchmove', function(e){
			var delta = event.touches[0].pageY - dom.touchStartY;
			dom.touchStartY = event.touches[0].pageY;
			if(delta>0){
				dom.scrollUp(delta);
		    } else {
		        dom.scrollDown(delta);
		    }
			e.preventDefault();
		});
		dom.bind('mousewheel DOMMouseScroll', function(e){
			var up = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta  >= 0: e.originalEvent.detail <= 0;

			var delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta / dom.rollingSpeed : e.originalEvent.detail ? -e.originalEvent.detail/dom.rollingSpeed2 : 0;
			delta /= dom.jkbl;
			if (up) {
		        dom.scrollUp(delta);
		    } else {
		        dom.scrollDown(delta);
		    }
			e.preventDefault();
		});
	},
	_rolling_straight : function(dom, ctx, img, bl, cwidth, cheight){
		var cropTop = -dom.offsetY;
		ctx.drawImage(img,
				0, cropTop, dom.pic_real_width,  cheight,
				0, 0, cwidth, cheight);
	},
	_rolling_normal : function(dom, ctx, img, bl, cwidth, cheight){
		var sliceNum = dom.sliceNum;
		var offset = -dom.offsetY;
		var cropHeight = cheight / sliceNum;

		var scaleWidthMax = 3;

		var centerTopSilce = sliceNum / 3;
		var centerBottomSilce = centerTopSilce * 2;

		for(var ax=0;ax<sliceNum;ax++){
			var cropTop = cropHeight * ax + offset;
			ctx.save();

			var scbl = (sliceNum * 0.5);
			scbl = Math.abs((ax - scbl)) / scbl;
			scbl -= dom.centerKeepRange * 2 * (0.5 - scbl);
			if(scbl<0){
				scbl = 0;
			}
			scbl *= scbl ;
			var scaleWidth =  1 + dom.rollingDeep * (scbl);
			ctx.translate( -(scaleWidth - 1) * cwidth / 2 , 0);
			ctx.scale(scaleWidth , 1);
			ctx.drawImage(img,
				0, cropTop, dom.pic_real_width,  cropHeight,
				0, cropHeight * ax, cwidth, cropHeight+1);
			ctx.restore();
		}
		
	},
	prepareRender : function(dom, canvas){
		switch(dom._rolling_type){
			case $.jkrolling.type_straight:
				dom._render = $.jkrolling._rolling_straight;
				break;
			case $.jkrolling.type_roller: default:
				dom._render = $.jkrolling._rolling_normal;
		}

		var c = document.getElementById(canvas.attr('id'));
		var ctx=c.getContext("2d");	
		dom.ctx = ctx;
		dom.render = function(){
			var ctx = dom.ctx;
			var img = document.getElementById("demoImg");
			var bl = parseFloat(dom.width()) / dom.pic_real_width;
			dom.jkbl = bl;
			var cwidth = canvas.width();
			var cheight = canvas.height();

			ctx.save();
			ctx.scale(bl, bl);

			dom._render(dom, ctx, img, bl, cwidth / bl, cheight / bl);
			ctx.restore();

		};
		dom.render();
	}
}
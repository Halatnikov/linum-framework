// ECMAScript 5 strict mode
/* global cr,log,assert2 */
/* jshint globalstrict: true */
/* jshint strict: true */
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.Polygon = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.Polygon.prototype;

	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{

	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;

		// any other properties you need, e.g...
		// this.myValue = 0;
		// set the collision poly to bounding box;
		//this.collision_poly = new cr.CollisionPoly(new Array(-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.5));
		this.collision_poly = new cr.CollisionPoly(new Array(0,0,0,0,0,0,0,0));
	};

	var instanceProto = pluginProto.Instance.prototype;
	var fxNames = [ "lighter",
						"xor",
						"copy",
						"destination-over",
						"source-in",
						"destination-in",
						"source-out",
						"destination-out",
						"source-atop",
						"destination-atop"];

	instanceProto.effectToCompositeOp = function(effect)
	{
		// (none) = source-over
		if (effect <= 0 || effect >= 11)
			return "source-over";

		// (none)|Additive|XOR|Copy|Destination over|Source in|Destination in|Source out|Destination out|Source atop|Destination atop
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};

	instanceProto.updateBlend = function(effect)
	{
		var gl = this.runtime.gl;

		if (!gl)
			return;

		// default alpha blend
		this.srcBlend = gl.ONE;
		this.destBlend = gl.ONE_MINUS_SRC_ALPHA;

		switch (effect) {
		case 1:		// lighter (additive)
			this.srcBlend = gl.ONE;
			this.destBlend = gl.ONE;
			break;
		case 2:		// xor
			break;	// todo
		case 3:		// copy
			this.srcBlend = gl.ONE;
			this.destBlend = gl.ZERO;
			break;
		case 4:		// destination-over
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.ONE;
			break;
		case 5:		// source-in
			this.srcBlend = gl.DST_ALPHA;
			this.destBlend = gl.ZERO;
			break;
		case 6:		// destination-in
			this.srcBlend = gl.ZERO;
			this.destBlend = gl.SRC_ALPHA;
			break;
		case 7:		// source-out
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.ZERO;
			break;
		case 8:		// destination-out
			this.srcBlend = gl.ZERO;
			this.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:		// source-atop
			this.srcBlend = gl.DST_ALPHA;
			this.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:	// destination-atop
			this.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this.destBlend = gl.SRC_ALPHA;
			break;
		}
	};

	// called whenever an instance is created
	var MIN_SIZE = 1;
	instanceProto.onCreate = function()
	{

		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
		this.vertexCount = 0;
		this.vertices = [];

		this.isInPreview = (typeof cr_is_preview !== "undefined");

		this.area = 0;
		this.originalWidth = this.width;
		this.originalHeight = this.height;
		this.visible = (this.properties[0] === 0);							// 0=visible, 1=invisible
		this.compositeOp = this.effectToCompositeOp(this.properties[1]);
		this.updateBlend(this.properties[1]);
		//keep the user property in memory
		this.collisionsEnabled_ = (this.properties[2] !== 0);
		this.debugMode = (this.properties[3] !== 0);
		//collision disabled until the first drawPolygon
		this.collisionsEnabled = false;
		this.canvas = document.createElement('canvas');
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.ctx = this.canvas.getContext('2d');


		this.boundingBox = {};
		this.boundingBox.right=0;
		this.boundingBox.bottom=0;
		this.boundingBox.left=0;
		this.boundingBox.top=0;
		this.boundingBox.center = new cr.vector2(this.x,this.y);
		this.barycenter = new cr.vector2(this.x,this.y);

		this.updatedBoundingBox = true;

		this.prevX = this.x;
		this.prevY = this.y;
		this.prevAngle = this.angle;
		this.prevWidth = this.width;
		this.prevWidth = this.width;
	};

	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
		ctx.globalCompositeOperation = this.compositeOp;

		var myx = this.x;
		var myy = this.y;
		var width = this.width;
		var height = this.height;

		// Object not rotated: can draw without transformation.
		if (this.angle === 0 && width >= 0 && height >= 0)
		{
			myx -= this.hotspotX * width;
			myy -= this.hotspotY * height;

			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			ctx.drawImage(this.canvas, myx, myy, width, height);
		}
		else
		{
			// Only pixel round the x/y position, otherwise objects don't rotate smoothly
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}

			// Angle applied; we need to transform the canvas.  Save state.
			ctx.save();

			var widthFactor  = width  > 0 ? 1 : -1;
			var heightFactor = height > 0 ? 1 : -1;

			// Translate to object's position, then rotate by its angle.
			ctx.translate(myx, myy);

			if (widthFactor !== 1 || heightFactor !== 1)
			{
				ctx.scale(widthFactor, heightFactor);
			}

			ctx.rotate(this.angle * widthFactor * heightFactor);

			var drawx = 0 - (this.hotspotX * cr.abs(width));
			var drawy = 0 - (this.hotspotY * cr.abs(height));

			// Draw the object; canvas origin is at hot spot.
			ctx.drawImage(this.canvas, drawx, drawy, cr.abs(width), cr.abs(height));

			// Restore previous state.
			ctx.restore();
		}

		//////////////////////////////////////////
		// Draw collision poly (for debug)
		/*

		ctx.strokeStyle = "#00f";
		ctx.lineWidth = 3;
		ctx.beginPath();
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		//log("collisions poly pts_count = "+this.collision_poly.pts_count );
		var i, len, ax, ay, bx, by;
		for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
		{
			ax = this.collision_poly.pts_cache[i*2] + this.x;
			ay = this.collision_poly.pts_cache[i*2+1] + this.y;
			bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
			by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
			//log("line "+i+": "+"("+ax+","+ay+") ("+bx+","+by+")" );
			ctx.moveTo(ax, ay);
			ctx.lineTo(bx, by);
		}

		ctx.stroke();
		ctx.closePath();
		*/
	};

	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
		glw.setBlend(this.srcBlend, this.destBlend);
		var tex=glw.loadTexture(this.canvas, false, this.runtime.linearSampling);
		glw.setTexture(tex);
		glw.setOpacity(this.opacity);

		var q = this.bquad;

		if (this.runtime.pixel_rounding)
		{
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;

			glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
		{
			glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
		glw.deleteTexture(tex);

	};


	instanceProto.getAsJSON = function ()
	{
		return JSON.stringify({
			"c2polygon": true,
			"vertexCount": this.vertexCount,
			"vertices": this.vertices
		});
	};

	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	var needscollisionfinish = false;

	function DoOverlapCondition(rtype, offx, offy)
	{
		if (!rtype)
			return false;

		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;

		if (rsol.select_all)
			rinstances = rsol.type.instances;
		else if (orblock)
			rinstances = rsol.else_instances;
		else
			rinstances = rsol.instances;

		rpicktype = rtype;
		needscollisionfinish = (ltype !== rtype && !inverted);

		if (do_offset)
		{
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed();
		}


		for (r = 0, lenr = rinstances.length; r < lenr; r++)
		{
			rinst = rinstances[r];

			// objects overlap: true for this instance, ensure both are picked
			// (if ltype and rtype are same, e.g. "Sprite overlaps Sprite", don't pick the other instance,
			// it will be picked when it gets iterated to itself)

			if (this.runtime.testOverlap(this, rinst))
			{
				ret = true;

				// Inverted condition: just bail out now, don't pick right hand instance -
				// also note we still return true since the condition invert flag makes that false


				if (inverted)
					break;

				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}

		if (do_offset)
		{
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed();
		}

		return ret;
	}

	instanceProto.getVertex = function(index,local)
	{
		var xScale = this.width/this.originalWidth;
		var yScale = this.height/this.originalHeight;
		var vertices = this.vertices;
		var x,y;
		index = cr.floor(index);
		if (index >= 0 && index < this.vertexCount)
		{
			// get position scaled and relative to origin in pixels
			x = vertices[index][0];
			y = vertices[index][1];

			if (!local)
			{
				x *= xScale;
				y *= yScale;
				// conversion to world-space
				// rotate by object angle
				var cosa = Math.cos(this.angle);
				var sina = Math.sin(this.angle);
				var x_temp = (x * cosa) - (y * sina);
				y = (y * cosa) + (x * sina);
				x = x_temp;
			}
		}
		else
		{
			x = 0;
			y = 0;
		}

		if (!local)
		{
			x += this.x;
			y += this.y;
		}

		var result = [];
		result[0] = x;
		result[1] =  y;

		return result;
	};

	instanceProto.logVertexList = function()
	{
		// alert the message
		if (this.isInPreview)
		{
			log("vertices ("+this.vertexCount+"):");
			for (var i = 0; i < this.vertices.length ; i++)
			{

				log("["+i+"]("+this.vertices[i][0]+","+this.vertices[i][1]+")");
			}
		}
	};

	instanceProto.computeArea = function()
	{
		var area = 0;         // Accumulates area in the loop
		var j = this.vertexCount-1;  // The last vertex is the 'previous' one to the first
		var vertices = this.vertices;
		for (var i=0; i<this.vertexCount; i++)
		{
			area +=   (vertices[j][0]+vertices[i][0]) *
                      (vertices[j][1]-vertices[i][1]);
			j = i;  //j is previous vertex to i
		}
		this.area = cr.abs(area/2) ;
	};

	instanceProto.computeBoundingBox = function()
	{
		var reCompute = !this.updatedBoundingBox ||
						(this.prevWidth != this.width) ||
						(this.prevHeight != this.height) ||
						(this.prevAngle != this.angle) ;
		var doOffset = this.prevX != this.x || this.prevY != this.y;

		if (reCompute)
		{
			log('recompute');
			var vertices = this.vertices;

			if (this.vertexCount > 0)
			{
				log('some vertices');
				var right,bottom,left,top;
				var vertex;
				var sumX = 0,sumY = 0;

				for (var i = 0; i < this.vertexCount ; i++)
				{
					vertex = this.getVertex(i,false);
					log(vertex);
					if (!right || right < vertex[0])
					{
						right = vertex[0];
					}
					if (!left || left > vertex[0])
					{
						left = vertex[0];
					}
					if (!bottom || bottom < vertex[1])
					{
						bottom = vertex[1];
					}
					if (!top || top > vertex[1])
					{
						top = vertex[1];
					}
					sumX += vertex[0];
					sumY += vertex[1];
					log(cr.is_undefined(bottom));
				}
				this.boundingBox.right = right;
				this.boundingBox.bottom = bottom ;
				this.boundingBox.left = left;
				this.boundingBox.top = top;
				this.boundingBox.center.x = (left+right)/2;
				this.boundingBox.center.y = (top+bottom)/2;
				this.barycenter.x = sumX/this.vertexCount;
				this.barycenter.y = sumY/this.vertexCount;
				log(this.boundingBox);

			}
			else
			{
				log('no vertices');
				this.boundingBox.right = this.x;
				this.boundingBox.bottom = this.y;
				this.boundingBox.left = this.x;
				this.boundingBox.top = this.y;
				this.boundingBox.center.x = this.x;
				this.boundingBox.center.y = this.y;
				this.barycenter.x = this.x;
				this.barycenter.y = this.y;
			}

			this.updatedBoundingBox = true;
			this.prevWidth = this.width;
			this.prevHeight = this.height;
			this.prevAngle = this.angle;
			this.prevX = this.x;
			this.prevY = this.y;
		}
		else if (doOffset)
		{
			log('doOffset');
			var xOffset = this.x - this.prevX;
			var yOffset = this.y - this.prevY;
			this.boundingBox.right += xOffset;
			this.boundingBox.bottom += yOffset;
			this.boundingBox.left += xOffset;
			this.boundingBox.top += yOffset;

			this.boundingBox.center.x += xOffset;
			this.boundingBox.center.y += yOffset;

			this.barycenter.x += xOffset;
			this.barycenter.y += yOffset;

			this.prevX = this.x;
			this.prevY = this.y;
		}

	};

	function isNumber (number) {
		return number && isFinite(number) && !isNaN(number);
	}

	instanceProto.worldToLocal = function(x,y)
	{
		var xScale = this.width/this.originalWidth;
		var yScale = this.height/this.originalHeight;

		x = x - this.x;
		y = y - this.y;

		var cosa = Math.cos(-this.angle);
		var sina = Math.sin(-this.angle);

		var xTmp = (x * cosa) - (y * sina);
		y = (y * cosa) + (x * sina);
		x = xTmp;

		x /= xScale;
		y /= yScale;

		var vertex = [];
		vertex[0] = x;
		vertex[1] = y;
		return vertex;
	};



	//////////////////////////////////////
	// Conditions
	function Cnds() {}

	// the example condition
	Cnds.prototype.IsOverlapping = function (rtype)
	{
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	Cnds.prototype.IsCollisionEnabled = function ()
	{
		return this.collisionsEnabled;
	};
	Cnds.prototype.OnDrawn = function ()
	{
		return true;
	};
	Cnds.prototype.CompareArea = function (cmp, area)
	{
		return cr.do_cmp(this.area, cmp, area);
	};
	// ... other conditions here ...

	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {}

	// the example action
	Acts.prototype.addVertex = function (x,y,space)
	{
		// alert the message
		var vertices = this.vertices;
		if (cr.is_undefined(vertices[this.vertexCount])) {
			vertices[this.vertexCount] = [];
		}
		if (space === 1)
		{
			var vertex = this.worldToLocal(x,y);
			x = vertex[0];
			y = vertex[1];
		}
		vertices[this.vertexCount][0] = x;
		vertices[this.vertexCount][1] = y;

		this.vertexCount++;

		if (this.isInPreview && this.debugMode)
		{
			log("Vertex["+(this.vertexCount-1)+"] added at: ("+vertices[this.vertexCount-1][0]+","+vertices[this.vertexCount-1][1]+")");
			log("the polygon has now "+this.vertexCount+" vertices");
		}

		this.updatedBoundingBox = false;
	};
	// the example action
	Acts.prototype.moveVertex = function (index,x,y,space)
	{
		index = Math.floor(index);
		// valid index
		if (index >= 0 && index < this.vertexCount)
		{
			var vertices = this.vertices;

			if (!cr.is_undefined(vertices[index]))
			{
				if (space === 1)
				{
					var vertex = this.worldToLocal(x,y);
					x = vertex[0];
					y = vertex[1];
				}

				vertices[index][0] = x;
				vertices[index][1] = y;

				if (this.isInPreview && this.debugMode)
				{
					log("Vertex["+index+"] moved at: ("+this.vertices[index][0]+","+this.vertices[index][1]+")");
				}
			}
		}
		else if (this.isInPreview && this.debugMode)
		{
			if (this.vertexCount === 0)
			{
				log("Vertex["+index+"] can't be moved - the vertex list is empty","warn");
			}
			else
			{
				log("invalid index "+index+" - Should be in the range [0;"+(this.vertexCount-1)+"]","warn");
			}
		}

		this.updatedBoundingBox = false;
	};

	// the example action
	Acts.prototype.insertVertex = function (index,x,y,space)
	{
		// alert the message
		index = Math.floor(index);
		index = cr.clamp (index,0,this.vertexCount);

		var vertices = this.vertices;
		var newVertex = [];

		if (space === 1)
		{
			var vertex = this.worldToLocal(x,y);
			x = vertex[0];
			y = vertex[1];
		}
		newVertex[0] = x;
		newVertex[1] = y;
		vertices.splice(index,0,newVertex);
		this.vertexCount++;

		if (this.isInPreview && this.debugMode)
		{
			log("Vertex["+index+"] Inserted at: ("+vertices[this.vertexCount-1][0]+","+vertices[this.vertexCount-1][1]+")");
			log("the polygon has now "+this.vertexCount+" vertices");
		}
		this.updatedBoundingBox = false;
	};

	// the example action
	Acts.prototype.removeVertex = function (index)
	{
		index = Math.floor(index);
		// valid index
		if (index >= 0 && index < this.vertexCount)
		{
			// alert the message
			var vertices = this.vertices;
			if (!cr.is_undefined(vertices[index]))
			{
				vertices.splice(index,1);
				this.vertexCount--;

				if (this.isInPreview && this.debugMode)
				{
					log("Vertex["+index+"] removed");
					log("the polygon has now "+this.vertexCount+" vertices");
				}
			}
		}
		else if (this.isInPreview && this.debugMode)
		{
			if (this.vertexCount === 0)
			{
				log("Vertex["+index+"] can't be removed - the vertex list is empty","warn");
			}
			else
			{
				log("invalid index "+index+" - Should be in the range [0;"+(this.vertexCount-1)+"]","warn");
			}
		}
		this.updatedBoundingBox = false;
	};
	// the example action
	Acts.prototype.setOrigin = function (x,y,space)
	{

		var xOffset = x ;
		var yOffset = y ;

		if (space === 1)
		{
			var offset = this.worldToLocal(x,y);
			xOffset = offset[0];
			yOffset = offset[1];
		}

		for (var i = 0; i < this.vertexCount ; i++)
		{
			// draw lines
			this.vertices[i][0] -= xOffset;
			this.vertices[i][1] -= yOffset;
		}

		this.x = x;
		this.y = y;

		this.updatedBoundingBox = false;

		if (this.isInPreview && this.debugMode)
		{
			this.logVertexList();
		}
	};

	// the example action
	Acts.prototype.drawPolygon = function (fillColor,lineWidth,lineColor)
	{
		var right,bottom,left,top;
		var width,height;
		var vertices = this.vertices;

		// to keep the relative scale
		var xScale = this.width/this.originalWidth;
		var yScale = this.height/this.originalHeight;

		var colPts = [];
		// draw the shape
		if (this.vertexCount > 0)
		{

			for (var point in vertices)
			{
				if (!right || right < vertices[point][0])
				{
					right = vertices[point][0];
				}
				if (!left || left > vertices[point][0])
				{
					left = vertices[point][0];
				}
				if (!bottom || bottom < vertices[point][1])
				{
					bottom = vertices[point][1];
				}
				if (!top || top > vertices[point][1])
				{
					top = vertices[point][1];
				}
			}


			left   -= lineWidth;
			right  += lineWidth;
			top    -= lineWidth;
			bottom += lineWidth;

			width  = Math.max(right-left,MIN_SIZE);
			height = Math.max(bottom-top,MIN_SIZE);

			this.originalWidth = width;
			this.originalHeight = height;
			this.width = width;
			this.height = height;
			this.canvas.width = width ;
			this.canvas.height = height;

			this.hotspotX = -left/width;
			this.hotspotY = -top/height;


			this.ctx.beginPath();
			var j=0;
			this.ctx.moveTo(vertices[0][0]-left,vertices[0][1]-top);
			for (var i = 0; i < this.vertexCount ; i++)
			{
				// draw lines

				if (i > 0)
				{
					this.ctx.lineTo(vertices[i][0]-left, vertices[i][1]-top);
				}

				colPts[i*2]   = vertices[i][0]/width;
				colPts[i*2+1] = vertices[i][1]/height;
			}
			this.ctx.lineTo(vertices[0][0]-left, vertices[0][1]-top);

			this.collision_poly.set_pts(colPts);

			this.ctx.closePath();
			// fill poly

			this.ctx.fillStyle = fillColor;
			this.ctx.fill();

			if (lineWidth > 0)
			{
				this.ctx.lineWidth = lineWidth;
				this.ctx.strokeStyle = lineColor;
				this.ctx.stroke();
			}


			if (this.collisionsEnabled_)
			{
				this.collisionsEnabled = true;
			}

			this.width = xScale * this.originalWidth;
			this.height = yScale * this.originalHeight;

			this.set_bbox_changed();
			this.computeArea();
		}
		else
		{
			this.collisionsEnabled = false;
			this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
			this.area = 0;
		}

		this.runtime.redraw = true;
		this.update_bbox();

		if (this.isInPreview && this.debugMode)
		{
			log("polygon redrawn");
		}

		this.runtime.trigger(cr.plugins_.Polygon.prototype.cnds.OnDrawn, this);
	};

	Acts.prototype.clearPolygon = function ()
	{
		this.vertexCount = 0;
		this.vertices.length = 0;
		this.collisionsEnabled = false;
		this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.runtime.redraw = true;
		if (this.isInPreview && this.debugMode)
		{
			log("polygon cleared");
		}
		this.updatedBoundingBox = false;
	};


	// for debug purpose, display all added vertices
	Acts.prototype.logVertexList = function ()
	{
		this.logVertexList();
	};

	Acts.prototype.JSONLoad = function (json_)
	{
		var o;

		try
		{
			o = JSON.parse(json_);
		}
		catch(e)
		{
			return;
		}

		if (!o["c2polygon"])		// presumably not a c2array object
		{
			return;
		}

		this.vertexCount = o["vertexCount"];
		this.vertices = o["vertices"];

		if (this.isInPreview && this.debugMode)
		{
			log("JSON loaded");
		}

		this.updatedBoundingBox = false;
	};

	Acts.prototype.JSONDownload = function (axes)
	{
		var str = 'data:text/html,' + encodeURIComponent("<p><a download='data.json' href='data:application/json," +
				this.getAsJSON() +
				"'>Download link</a></p><p>Left click the link in Chrome, or in other browsers right-click and select 'Save link'</p>");
		window.open(str);
	};

	// ... other actions here ...

	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {}

	// the example expression
	Exps.prototype.VertexX = function (ret, index)
	{
		var vertex = this.getVertex(index,false);
		ret.set_float(vertex[0]);
	};

	Exps.prototype.VertexY = function (ret, index)
	{
		var vertex = this.getVertex(index,false);
		ret.set_float(vertex[1]);
	};

	Exps.prototype.VertexCount = function (ret)
	{
		ret.set_int(this.vertexCount);

	};
	Exps.prototype.Area = function (ret)
	{
		ret.set_float(this.area);
	};
	Exps.prototype.LocalVertexX = function (ret, index)
	{
		var vertex = this.getVertex(index,true);
		ret.set_float(vertex[0]);
	};

	Exps.prototype.LocalVertexY = function (ret, index)
	{
		var vertex = this.getVertex(index,true);
		ret.set_float(vertex[1]);
	};

	Exps.prototype.AsJSON = function (ret)
	{
		ret.set_string(this.getAsJSON());
	};

	Exps.prototype.OriginalWidth = function (ret)
	{
		ret.set_float(this.originalWidth);
	};

	Exps.prototype.OriginalHeight = function (ret)
	{
		ret.set_float(this.originalHeight);
	};

	Exps.prototype.Right = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.right);
	};

	Exps.prototype.Bottom = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.bottom);
	};
	Exps.prototype.Left = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.left);
	};

	Exps.prototype.Top = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.top);
	};
	Exps.prototype.CenterX = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.center.x);
	};

	Exps.prototype.CenterY = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.boundingBox.center.y);
	};
	Exps.prototype.BarycenterX = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.barycenter.x);
	};

	Exps.prototype.BarycenterY = function (ret)
	{
		this.computeBoundingBox();
		ret.set_float(this.barycenter.y);
	};
	// ... other expressions here ...

	pluginProto.exps = new Exps();

} ());
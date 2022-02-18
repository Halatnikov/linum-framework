// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.TiledSprite = function(runtime)
{
  this.runtime = runtime;
};

(function ()
{
  var pluginProto = cr.plugins_.TiledSprite.prototype;
    
  /////////////////////////////////////
  // Object type class
  pluginProto.Type = function(plugin)
  {
    this.plugin = plugin;
    this.runtime = plugin.runtime;
  };

  var typeProto = pluginProto.Type.prototype;
  
  function frame_getPattern(){
    if (!this.patternData){
      // Get Sprite image as data URI
      var tmpcanvas = document.createElement("canvas");
      tmpcanvas.width = this.width;
      tmpcanvas.height = this.height;
      var tmpctx = tmpcanvas.getContext("2d");
      if (this.spritesheeted){
        tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height, 0, 0, this.width, this.height);
      }else{
        tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
      }
      this.patternData = tmpcanvas;
    }
    return this.patternData;
  };

  typeProto.onCreate = function()
  {
    if (this.is_family)
      return;
    
    this.pattern = null;

    var i, leni, j, lenj;
    var anim, frame, animobj, frameobj, wt, uv;
    
    this.all_frames = [];
    this.has_loaded_textures = false;
    
    // Load all animation frames
    for (i = 0, leni = this.animations.length; i < leni; i++)
    {
      anim = this.animations[i];
      animobj = {};
      animobj.name = anim[0];
      animobj.speed = anim[1];
      animobj.loop = anim[2];
      animobj.repeatcount = anim[3];
      animobj.repeatto = anim[4];
      animobj.pingpong = anim[5];
      animobj.sid = anim[6];
      animobj.frames = [];
      
      for (j = 0, lenj = anim[7].length; j < lenj; j++)
      {
        frame = anim[7][j];
        frameobj = {};
        frameobj.texture_file = frame[0];
        frameobj.texture_filesize = frame[1];
        frameobj.offx = frame[2];
        frameobj.offy = frame[3];
        frameobj.width = frame[4];
        frameobj.height = frame[5];
        frameobj.duration = frame[6];
        frameobj.pixelformat = frame[11];
        frameobj.spritesheeted = (frameobj.width !== 0);
        frameobj.patternData = null;    // generated on demand and cached
        frameobj.getPattern = frame_getPattern;
        frameobj.patternTexture = null;    // generated on demand and cached
        frameobj.webGL_texture = null;
        
        // Sprite sheets may mean multiple frames reference one image
        // Ensure image is not created in duplicate
        wt = this.runtime.findWaitingTexture(frame[0]);
        
        if (wt){
          frameobj.texture_img = wt;
        }else{
          frameobj.texture_img = new Image();
          frameobj.texture_img.cr_src = frame[0];
          frameobj.texture_img.cr_filesize = frame[1];
          frameobj.texture_img.c2webGL_texture = null;
          
          // Tell runtime to wait on this texture
          this.runtime.waitForImageLoad(frameobj.texture_img, frame[0]);
        }
        
        cr.seal(frameobj);
        animobj.frames.push(frameobj);
        this.all_frames.push(frameobj);
      }
      
      cr.seal(animobj);
      this.animations[i] = animobj;    // swap array data for object
    }

  };

  typeProto.updateAllCurrentTexture = function ()
  {
    var i, len, inst;
    for (i = 0, len = this.instances.length; i < len; i++)
    {
      inst = this.instances[i];
      inst.curWebGLTexture = inst.curFrame.webGL_texture;
    }
  };
  
  typeProto.onLostWebGLContext = function ()
  {
    if (this.is_family)
      return;
      
    var i, len, frame;
    
    // Release all animation frames
    for (i = 0, len = this.all_frames.length; i < len; ++i)
    {
      frame = this.all_frames[i];
      frame.texture_img.c2webGL_texture = null;
      frame.webGL_texture = null;
    }
    
    this.has_loaded_textures = false;
    
    this.updateAllCurrentTexture();
  };
  
  typeProto.onRestoreWebGLContext = function ()
  {
    // No need to create textures if no instances exist, will create on demand
    if (this.is_family || !this.instances.length)
      return;
      
    var i, len, frame;
    
    // Re-load all animation frames
    for (i = 0, len = this.all_frames.length; i < len; ++i)
    {
      frame = this.all_frames[i];
      frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, true, this.runtime.linearSampling, frame.pixelformat);
    }
    
    this.updateAllCurrentTexture();
  };
  
  typeProto.loadTextures = function ()
  {
    if (this.is_family || this.has_loaded_textures || !this.runtime.glwrap)
      return;
      
    var i, len, frame;
    for (i = 0, len = this.all_frames.length; i < len; ++i)
    {
      frame = this.all_frames[i];
      
      this.all_frames[i].webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, true, this.runtime.linearSampling, frame.pixelformat);
    }
    
    this.has_loaded_textures = true;
  };

  typeProto.unloadTextures = function ()
  {
    // Don't release textures if any instances still exist, they are probably using them
    if (this.is_family || this.instances.length || !this.has_loaded_textures)
      return;
      
    var i, len, frame;
    for (i = 0, len = this.all_frames.length; i < len; ++i)
    {
      frame = this.all_frames[i];
      
      this.runtime.glwrap.deleteTexture(frame.webGL_texture);
      frame.webGL_texture = null;
    }
    
    this.has_loaded_textures = false;
  };
  
  var already_drawn_images = [];

  typeProto.preloadCanvas2D = function (ctx)
  {
    var i, len, frameimg;
    already_drawn_images.length = 0;
    
    for (i = 0, len = this.all_frames.length; i < len; ++i)
    {
      frameimg = this.all_frames[i].texture_img;
      
      if (already_drawn_images.indexOf(frameimg) !== -1)
          continue;
        
      // draw to preload, browser should lazy load the texture
      ctx.drawImage(frameimg, 0, 0);
      already_drawn_images.push(frameimg);
    }
  };

  /////////////////////////////////////
  // Instance class
  pluginProto.Instance = function(type)
  {
    this.type = type;
    this.runtime = type.runtime;
  };
  
  var instanceProto = pluginProto.Instance.prototype;

  instanceProto.onCreate = function()
  {
    this.visible = (this.properties[0] === 0);  // 0=visible, 1=invisible
    this.isTicking = false;
    this.inAnimTrigger = false;
    
    this.rcTex = new cr.rect(0, 0, 1, 1);

    this.cur_animation = this.getAnimationByName(this.properties[2]) || this.type.animations[0];
    this.cur_frame = this.properties[1];
    
    if (this.cur_frame < 0){
      this.cur_frame = 0;
    }
    if (this.cur_frame >= this.cur_animation.frames.length){
      this.cur_frame = this.cur_animation.frames.length - 1;
    }
    
    this.cur_anim_speed = this.cur_animation.speed;
    this.cur_anim_repeatto = this.cur_animation.repeatto;
    
    // Tick this object to change animation frame, but never tick single-animation, single-frame objects.
    // Also don't tick zero speed animations until the speed or animation is changed, which saves ticking
    // on tile sprites.
    if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
    {
      this.runtime.tickMe(this);
      this.isTicking = true;
    }
    
    if (this.recycled){
      this.animTimer.reset();
    } else {
      this.animTimer = new cr.KahanAdder();
    }
    this.frameStart = this.getNowTime();
    this.animPlaying = true;
    this.animRepeats = 0;
    this.animForwards = true;
    this.animTriggerName = "";
    
    this.changeAnimName = "";
    this.changeAnimFrom = 0;
    this.changeAnimFrame = -1;
    
    // Ensure type has textures loaded
    this.type.loadTextures();
    
    // Iterate all animations and frames ensuring WebGL textures are loaded and sizes are set
    var i, leni, j, lenj;
    var anim, frame, uv, maintex;
    
    for (i = 0, leni = this.type.animations.length; i < leni; i++)
    {
      anim = this.type.animations[i];
      
      for (j = 0, lenj = anim.frames.length; j < lenj; j++)
      {
        frame = anim.frames[j];
        
        // If size is zero, image is not on a sprite sheet.  Determine size now.
        if (frame.width === 0)
        {
          frame.width = frame.texture_img.width;
          frame.height = frame.texture_img.height;
        }
        
        // If frame is spritesheeted update its uv coords
        if (frame.spritesheeted)
        {
          maintex = frame.texture_img;
          // Check if frame is in fact a complete-frame spritesheet
          if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
          {
            frame.spritesheeted = false;
          }
        }
      }
    }
    
    // Create the pattern if the type doesn't have one yet
    if (!this.type.pattern){
      if (this.runtime.glwrap){
        this.cur_animation.frames[this.cur_frame].patternTexture = this.runtime.glwrap.loadTexture(
          this.cur_animation.frames[this.cur_frame].getPattern(),
          true,
          this.runtime.linearSampling,
          this.cur_animation.frames[this.cur_frame].pixelformat
        );
      }else{
        this.cur_animation.frames[this.cur_frame].patternTexture = this.runtime.ctx.createPattern(this.cur_animation.frames[this.cur_frame].getPattern(), "repeat");
      }
      this.cur_animation.frames[this.cur_frame].patternData = "";//delete cached canvas
    }
    this.type.pattern = this.cur_animation.frames[this.cur_frame].patternTexture;
    this.curFrame = this.cur_animation.frames[this.cur_frame];
  };
  
  instanceProto.saveToJSON = function ()
  {
    var o = {
      "a": this.cur_animation.sid,
      "f": this.cur_frame,
      "cas": this.cur_anim_speed,
      "fs": this.frameStart,
      "ar": this.animRepeats,
      "at": this.animTimer.sum,
      "rt": this.cur_anim_repeatto
    };
    
    if (!this.animPlaying)
      o["ap"] = this.animPlaying;
      
    if (!this.animForwards)
      o["af"] = this.animForwards;
    
    return o;
  };
  
  instanceProto.loadFromJSON = function (o)
  {
    var anim = this.getAnimationBySid(o["a"]);
    
    if (anim)
      this.cur_animation = anim;
    
    this.cur_frame = o["f"];
    
    if (this.cur_frame < 0)
      this.cur_frame = 0;
    if (this.cur_frame >= this.cur_animation.frames.length)
      this.cur_frame = this.cur_animation.frames.length - 1;
    
    this.cur_anim_speed = o["cas"];
    this.frameStart = o["fs"];
    this.animRepeats = o["ar"];
    this.animTimer.reset();
    this.animTimer.sum = o["at"];
    this.animPlaying = o.hasOwnProperty("ap") ? o["ap"] : true;
    this.animForwards = o.hasOwnProperty("af") ? o["af"] : true;
    
    if (o.hasOwnProperty("rt")){
      this.cur_anim_repeatto = o["rt"];
    } else {
      this.cur_anim_repeatto = this.cur_animation.repeatto;
    }
    this.curFrame = this.cur_animation.frames[this.cur_frame];
    this.curWebGLTexture = this.curFrame.webGL_texture;
  };
  
  instanceProto.animationFinish = function (reverse)
  {
    // stop
    this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
    this.animPlaying = false;
    
    // trigger finish events
    this.animTriggerName = this.cur_animation.name;
    
    this.inAnimTrigger = true;
    this.runtime.trigger(cr.plugins_.TiledSprite.prototype.cnds.OnAnyAnimFinished, this);
    this.runtime.trigger(cr.plugins_.TiledSprite.prototype.cnds.OnAnimFinished, this);
    this.inAnimTrigger = false;
      
    this.animRepeats = 0;
  };
  
  instanceProto.getNowTime = function()
  {
    return this.animTimer.sum;
  };
  
  instanceProto.tick = function()
  {
    this.animTimer.add(this.runtime.getDt(this));
    
    // Change any animation or frame that was queued
    if (this.changeAnimName.length)
      this.doChangeAnim();
    if (this.changeAnimFrame >= 0)
      this.doChangeAnimFrame();
    
    var now = this.getNowTime();
    var cur_animation = this.cur_animation;
    var prev_frame = cur_animation.frames[this.cur_frame];
    var next_frame;
    var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
    
    if (this.animPlaying && now >= this.frameStart + cur_frame_time)
    {
      // Next frame
      if (this.animForwards){
        this.cur_frame++;
        //log("Advancing animation frame forwards");
      }else{
        this.cur_frame--;
        //log("Advancing animation frame backwards");
      }
        
      this.frameStart += cur_frame_time;
      
      // Reached end of frames
      if (this.cur_frame >= cur_animation.frames.length){
        //log("At end of frames");
        
        if (cur_animation.pingpong){
          this.animForwards = false;
          this.cur_frame = cur_animation.frames.length - 2;
          //log("Ping pong looping from end");
        }
        // Looping: wind back to repeat-to frame
        else if (cur_animation.loop){
          this.cur_frame = this.cur_anim_repeatto;
        }else{
          this.animRepeats++;
          
          if (this.animRepeats >= cur_animation.repeatcount){
            //log("Number of repeats reached; ending animation");
            
            this.animationFinish(false);
          }else{
            //log("Repeating");
            this.cur_frame = this.cur_anim_repeatto;
          }
        }
      }
      // Ping-ponged back to start
      if (this.cur_frame < 0)
      {
        if (cur_animation.pingpong)
        {
          this.cur_frame = 1;
          this.animForwards = true;
          //log("Ping ponging back forwards");
          
          if (!cur_animation.loop)
          {
            this.animRepeats++;
              
            if (this.animRepeats >= cur_animation.repeatcount)
            {
              //log("Number of repeats reached; ending animation");
              
              this.animationFinish(true);
            }
          }
        }
        // animation running backwards
        else
        {
          if (cur_animation.loop)
          {
            this.cur_frame = this.cur_anim_repeatto;
          }
          else
          {
            this.animRepeats++;
            
            // Reached number of repeats
            if (this.animRepeats >= cur_animation.repeatcount)
            {
              //log("Number of repeats reached; ending animation");
              
              this.animationFinish(true);
            }
            else
            {
              //log("Repeating");
              this.cur_frame = this.cur_anim_repeatto;
            }
          }
        }
      }
      
      // Don't go out of bounds
      if (this.cur_frame < 0)
        this.cur_frame = 0;
      else if (this.cur_frame >= cur_animation.frames.length)
        this.cur_frame = cur_animation.frames.length - 1;
        
      // If frameStart is still more than a whole frame away, we must've fallen behind.  Instead of
      // going catch-up (cycling one frame per tick), reset the frame timer to now.
      if (now > this.frameStart + (cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed))
      {
        //log("Animation can't keep up, resetting timer");
        this.frameStart = now;
      }
        
      next_frame = cur_animation.frames[this.cur_frame];
      this.OnFrameChanged(prev_frame, next_frame);
      
      //this.runtime.redraw = true;
    }
  };
  
  instanceProto.getAnimationByName = function (name_)
  {
    var i, len, a;
    for (i = 0, len = this.type.animations.length; i < len; i++)
    {
      a = this.type.animations[i];
      
      if (cr.equals_nocase(a.name, name_))
        return a;
    }
    
    return null;
  };
  
  instanceProto.getAnimationBySid = function (sid_)
  {
    var i, len, a;
    for (i = 0, len = this.type.animations.length; i < len; i++)
    {
      a = this.type.animations[i];
      
      if (a.sid === sid_)
        return a;
    }
    
    return null;
  };
  
  instanceProto.doChangeAnim = function ()
  {
    var prev_frame = this.cur_animation.frames[this.cur_frame];
    
    // Find the animation by name
    var anim = this.getAnimationByName(this.changeAnimName);
    
    this.changeAnimName = "";
    
    // couldn't find by name
    if (!anim)
      return;
      
    // don't change if setting same animation and the animation is already playing
    if (cr.equals_nocase(anim.name, this.cur_animation.name) && this.animPlaying)
      return;
      
    this.cur_animation = anim;
    this.cur_anim_speed = anim.speed;
    this.cur_anim_repeatto = anim.repeatto;

    if (this.cur_frame < 0)
      this.cur_frame = 0;
    if (this.cur_frame >= this.cur_animation.frames.length)
      this.cur_frame = this.cur_animation.frames.length - 1;
      
    // from beginning
    if (this.changeAnimFrom === 1)
      this.cur_frame = 0;
      
    this.animPlaying = true;
    this.frameStart = this.getNowTime();
    this.animForwards = true;
    
    this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
    
    this.runtime.redraw = true;
  };
  
  instanceProto.doChangeAnimFrame = function ()
  {
    var prev_frame = this.cur_animation.frames[this.cur_frame];
    var prev_frame_number = this.cur_frame;
    
    this.cur_frame = cr.floor(this.changeAnimFrame);
    
    if (this.cur_frame < 0)
      this.cur_frame = 0;
    if (this.cur_frame >= this.cur_animation.frames.length)
      this.cur_frame = this.cur_animation.frames.length - 1;
      
    if (prev_frame_number !== this.cur_frame)
    {
      this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
      this.frameStart = this.getNowTime();
      this.runtime.redraw = true;
    }
    
    this.changeAnimFrame = -1;
  };
  
  instanceProto.OnFrameChanged = function (prev_frame, next_frame)
  {
    // Has the frame size changed?  Resize the object proportionally
    var oldw = prev_frame.width;
    var oldh = prev_frame.height;
    var neww = next_frame.width;
    var newh = next_frame.height;
    if (oldw != neww)
      this.width *= (neww / oldw);
    if (oldh != newh)
      this.height *= (newh / oldh);
    
    this.set_bbox_changed();
    
    // Update texture
    if (!next_frame.patternTexture){
      if (this.runtime.glwrap){
        next_frame.patternTexture = this.runtime.glwrap.loadTexture(next_frame.getPattern(), true, this.runtime.linearSampling, next_frame.pixelformat);
      } else {
        next_frame.patternTexture = this.runtime.ctx.createPattern(next_frame.getPattern(), "repeat");
      }
      next_frame.patternData = "";//delete cached canvas
    }
    this.type.pattern = next_frame.patternTexture;
    this.curFrame = next_frame;
    
    // Notify behaviors
    var i, len, b;
    for (i = 0, len = this.behavior_insts.length; i < len; i++)
    {
      b = this.behavior_insts[i];
      
      if (b.onSpriteFrameChanged)
        b.onSpriteFrameChanged(prev_frame, next_frame);
    }

    // Trigger 'on frame changed'
    this.runtime.trigger(cr.plugins_.TiledSprite.prototype.cnds.OnFrameChanged, this);
  };

  instanceProto.draw = function(ctx)
  {
    if(!this.debugShowed){
      console.log(this);
      this.debugShowed = true;
    }
    ctx.globalAlpha = this.opacity;
    ctx.save();
    
    // The current animation frame to draw
    var cur_frame = this.curFrame;
    var cur_image = cur_frame.texture_img;
  
    ctx.fillStyle = this.type.pattern;
    
    var myx = this.x;
    var myy = this.y;
    var w = this.width;
    var h = this.height;
    
    if (this.runtime.pixel_rounding)
    {
      myx = Math.round(myx);
      myy = Math.round(myy);
    }
    // Patterns tile from the origin no matter where you draw from.
    // Translate the canvas to align with the draw position, then offset the draw position as well.
    var drawX = -(this.hotspotX * this.width);
    var drawY = -(this.hotspotY * this.height);
    
    var offX = drawX % cur_image.width;
    var offY = drawY % cur_image.height;
    if (offX < 0)
      offX += cur_image.width;
    if (offY < 0)
      offY += cur_image.height;
    
    ctx.translate(myx, myy);
    ctx.rotate(this.angle);
    ctx.translate(offX, offY);
    
    ctx.fillRect(drawX - offX,
           drawY - offY,
           this.width,
           this.height);
    
    ctx.restore();
  };
  
  instanceProto.drawGL_earlyZPass = function(glw)
  {
    this.drawGL(glw);
  };
  
  instanceProto.drawGL = function(glw)
  {
    glw.setTexture(this.type.pattern);
    glw.setOpacity(this.opacity);

    var q = this.bquad;
    var rcTex = this.rcTex;
    rcTex.right = this.width / this.curFrame.width;
    rcTex.bottom = this.height / this.curFrame.height;

    if (this.runtime.pixel_rounding)
    {
      var ox = Math.round(this.x) - this.x;
      var oy = Math.round(this.y) - this.y;
      glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, this.rcTex);
    }else{
      glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, this.rcTex);
    }
  };

  instanceProto.getImagePointIndexByName = function(name_)
  {
    var cur_frame = this.curFrame;
    
    var i, len;
    for (i = 0, len = cur_frame.image_points.length; i < len; i++)
    {
      if (cr.equals_nocase(name_, cur_frame.image_points[i][0]))
        return i;
    }
    
    return -1;
  };
  
  instanceProto.getImagePoint = function(imgpt, getX)
  {
    var cur_frame = this.curFrame;
    var image_points = cur_frame.image_points;
    var index;
    
    if (cr.is_string(imgpt))
      index = this.getImagePointIndexByName(imgpt);
    else
      index = imgpt - 1;  // 0 is origin
      
    index = cr.floor(index);
    if (index < 0 || index >= image_points.length)
      return getX ? this.x : this.y;  // return origin
      
    // get position scaled and relative to origin in pixels
    var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
    var y = image_points[index][2];
    
    y = (y - cur_frame.hotspotY) * this.height;
    
    // rotate by object angle
    var cosa = Math.cos(this.angle);
    var sina = Math.sin(this.angle);
    var x_temp = (x * cosa) - (y * sina);
    y = (y * cosa) + (x * sina);
    x = x_temp;
    x += this.x;
    y += this.y;
    return getX ? x : y;
  };

  //////////////////////////////////////
  // Conditions
  function Cnds() {};
  Cnds.prototype.IsAnimPlaying = function (animname)
  {
    // If awaiting a change of animation to really happen next tick, compare to that now
    if (this.changeAnimName.length)
      return cr.equals_nocase(this.changeAnimName, animname);
    else
      return cr.equals_nocase(this.cur_animation.name, animname);
  };
  
  Cnds.prototype.CompareFrame = function (cmp, framenum)
  {
    return cr.do_cmp(this.cur_frame, cmp, framenum);
  };
  
  Cnds.prototype.CompareAnimSpeed = function (cmp, x)
  {
    var s = (this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
    return cr.do_cmp(s, cmp, x);
  };
  
  Cnds.prototype.OnAnimFinished = function (animname)
  {
    return cr.equals_nocase(this.animTriggerName, animname);
  };
  
  Cnds.prototype.OnAnyAnimFinished = function ()
  {
    return true;
  };
  
  Cnds.prototype.OnFrameChanged = function ()
  {
    return true;
  };
  
  Cnds.prototype.IsMirrored = function ()
  {
    return this.width < 0;
  };
  
  Cnds.prototype.IsFlipped = function ()
  {
    return this.height < 0;
  };
  
  Cnds.prototype.OnURLLoaded = function ()
  {
    return true;
  };
  
  pluginProto.cnds = new Cnds();
  //////////////////////////////////////
  // Actions
  function Acts() {};
  
  Acts.prototype.SetEffect = function (effect)
  {
    this.compositeOp = cr.effectToCompositeOp(effect);
    cr.setGLBlend(this, effect, this.runtime.gl);
    this.runtime.redraw = true;
  };
  
  Acts.prototype.StopAnim = function ()
  {
    this.animPlaying = false;
    //log("Stopping animation");
  };
  
  Acts.prototype.StartAnim = function (from)
  {
    this.animPlaying = true;
    this.frameStart = this.getNowTime();
    //log("Starting animation");
    
    // from beginning
    if (from === 1 && this.cur_frame !== 0)
    {
      this.changeAnimFrame = 0;
      
      if (!this.inAnimTrigger)
        this.doChangeAnimFrame();
    }
    
    // start ticking if not already
    if (!this.isTicking)
    {
      this.runtime.tickMe(this);
      this.isTicking = true;
    }
  };
  
  Acts.prototype.SetAnim = function (animname, from)
  {
    this.changeAnimName = animname;
    this.changeAnimFrom = from;
    
    // start ticking if not already
    if (!this.isTicking)
    {
      this.runtime.tickMe(this);
      this.isTicking = true;
    }
    
    // not in trigger: apply immediately
    if (!this.inAnimTrigger)
      this.doChangeAnim();
  };
  
  Acts.prototype.SetAnimFrame = function (framenumber)
  {
    this.changeAnimFrame = framenumber;
    
    // start ticking if not already
    if (!this.isTicking)
    {
      this.runtime.tickMe(this);
      this.isTicking = true;
    }
    
    // not in trigger: apply immediately
    if (!this.inAnimTrigger)
      this.doChangeAnimFrame();
  };
  
  Acts.prototype.SetAnimSpeed = function (s)
  {
    this.cur_anim_speed = cr.abs(s);
    this.animForwards = (s >= 0);
    
    //this.frameStart = this.runtime.kahanTime.sum;
    
    // start ticking if not already
    if (!this.isTicking)
    {
      this.runtime.tickMe(this);
      this.isTicking = true;
    }
  };
  
  Acts.prototype.SetMirrored = function (m)
  {
    var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
    
    if (this.width === neww)
      return;
      
    this.width = neww;
    this.set_bbox_changed();
  };
  
  Acts.prototype.SetFlipped = function (f)
  {
    var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
    
    if (this.height === newh)
      return;
      
    this.height = newh;
    this.set_bbox_changed();
  };
  
  Acts.prototype.SetScale = function (s)
  {
    var cur_frame = this.curFrame;
    var mirror_factor = (this.width < 0 ? -1 : 1);
    var flip_factor = (this.height < 0 ? -1 : 1);
    var new_width = cur_frame.width * s * mirror_factor;
    var new_height = cur_frame.height * s * flip_factor;
    
    if (this.width !== new_width || this.height !== new_height)
    {
      this.width = new_width;
      this.height = new_height;
      this.set_bbox_changed();
    }
  };
  
  Acts.prototype.LoadURL = function (url_, resize_)
  {
    
  };
  
  pluginProto.acts = new Acts();
  //////////////////////////////////////
  // Expressions
  function Exps() {};
  
  Exps.prototype.AnimationFrame = function (ret)
  {
    ret.set_int(this.cur_frame);
  };
  
  Exps.prototype.AnimationFrameCount = function (ret)
  {
    ret.set_int(this.cur_animation.frames.length);
  };
  
  Exps.prototype.AnimationName = function (ret)
  {
    ret.set_string(this.cur_animation.name);
  };
  
  Exps.prototype.AnimationSpeed = function (ret)
  {
    ret.set_float(this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
  };
  
  Exps.prototype.ImageWidth = function (ret)
  {
    ret.set_float(this.curFrame.width);
  };
  
  Exps.prototype.ImageHeight = function (ret)
  {
    ret.set_float(this.curFrame.height);
  };
  
  pluginProto.exps = new Exps();

}());
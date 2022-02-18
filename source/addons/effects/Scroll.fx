/////////////////////////////////////////////////////////
// Scroll effect
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;
uniform lowp float seconds;

uniform lowp float xshift;
uniform lowp float yshift;

void main(void)
{	
	mediump vec2 tex = vTex;
	
	if (xshift != 0.0) tex.x = mod(tex.x-mod(seconds,xshift)/xshift,1.0);
	if (yshift != 0.0) tex.y = mod(tex.y-mod(seconds,yshift)/yshift,1.0);
		
	gl_FragColor = texture2D(samplerFront,tex);
}
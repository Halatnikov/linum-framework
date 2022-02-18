/////////////////////////////////////////////////////////
// Replace color effect
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

uniform lowp float rsource1;
uniform lowp float gsource1;
uniform lowp float bsource1;
uniform lowp float rdest1;
uniform lowp float gdest1;
uniform lowp float bdest1;
uniform lowp float rsource2;
uniform lowp float gsource2;
uniform lowp float bsource2;
uniform lowp float rdest2;
uniform lowp float gdest2;
uniform lowp float bdest2;
uniform lowp float rsource3;
uniform lowp float gsource3;
uniform lowp float bsource3;
uniform lowp float rdest3;
uniform lowp float gdest3;
uniform lowp float bdest3;
uniform lowp float rsource4;
uniform lowp float gsource4;
uniform lowp float bsource4;
uniform lowp float rdest4;
uniform lowp float gdest4;
uniform lowp float bdest4;
uniform lowp float rsource5;
uniform lowp float gsource5;
uniform lowp float bsource5;
uniform lowp float rdest5;
uniform lowp float gdest5;
uniform lowp float bdest5;
uniform lowp float rsource6;
uniform lowp float gsource6;
uniform lowp float bsource6;
uniform lowp float rdest6;
uniform lowp float gdest6;
uniform lowp float bdest6;
uniform lowp float rsource7;
uniform lowp float gsource7;
uniform lowp float bsource7;
uniform lowp float rdest7;
uniform lowp float gdest7;
uniform lowp float bdest7;
uniform lowp float rsource8;
uniform lowp float gsource8;
uniform lowp float bsource8;
uniform lowp float rdest8;
uniform lowp float gdest8;
uniform lowp float bdest8;
uniform lowp float rsource9;
uniform lowp float gsource9;
uniform lowp float bsource9;
uniform lowp float rdest9;
uniform lowp float gdest9;
uniform lowp float bdest9;
uniform lowp float rsource10;
uniform lowp float gsource10;
uniform lowp float bsource10;
uniform lowp float rdest10;
uniform lowp float gdest10;
uniform lowp float bdest10;
uniform lowp float rsource11;
uniform lowp float gsource11;
uniform lowp float bsource11;
uniform lowp float rdest11;
uniform lowp float gdest11;
uniform lowp float bdest11;
uniform lowp float rsource12;
uniform lowp float gsource12;
uniform lowp float bsource12;
uniform lowp float rdest12;
uniform lowp float gdest12;
uniform lowp float bdest12;

uniform lowp float tolerance;
uniform lowp float intensity;

void main(void)
{
	lowp vec4 front = texture2D(samplerFront, vTex);
    lowp vec4 newColor;
	
	if (length(front.rgb - vec3(rsource1, gsource1, bsource1) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest1, gdest1, bdest1) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource2, gsource2, bsource2) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest2, gdest2, bdest2) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource3, gsource3, bsource3) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest3, gdest3, bdest3) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource4, gsource4, bsource4) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest4, gdest4, bdest4) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource5, gsource5, bsource5) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest5, gdest5, bdest5) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource6, gsource6, bsource6) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest6, gdest6, bdest6) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource7, gsource7, bsource7) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest7, gdest7, bdest7) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource8, gsource8, bsource8) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest8, gdest8, bdest8) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource9, gsource9, bsource9) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest9, gdest9, bdest9) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource10, gsource10, bsource10) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest10, gdest10, bdest10) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource11, gsource11, bsource11) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest11, gdest11, bdest11) / 255.0;
	}
	else if (length(front.rgb - vec3(rsource12, gsource12, bsource12) / 255.0) <= tolerance)
	{
		newColor.rgb = vec3(rdest12, gdest12, bdest12) / 255.0;
	}
	else  // no color correspondence
	{
		newColor.rgb = front.rgb;
	}
	newColor.a = front.a;
	
	gl_FragColor = mix(front, newColor, intensity);
}

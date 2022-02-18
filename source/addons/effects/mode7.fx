/////////////////////////////////////////////////////////
// Mode7 effect
//
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

precision highp float;
uniform highp float pos_x;
uniform highp float pos_y;
uniform highp float ang;
uniform highp float pixelWidth;
uniform highp float pixelHeight;
uniform highp float horizon;
uniform highp float fov;
uniform highp float scale_x;
uniform highp float scale_y;
uniform highp float single_image;


void main(void)
{
	vec4 front = texture2D(samplerFront, vTex);

    float px = vTex.x-0.5;
    float py = vTex.y-0.5 - horizon - fov; 
    float pz = vTex.y-0.5 - horizon;      

    //projection 
    float sx = px / pz;
    float sy = py / pz;
     
    float sin_ang = sin(radians(ang));
    float cos_ang = cos(radians(ang));
     
    float xx = sx * cos_ang - sy * sin_ang + pos_y;
    float yy = sx * sin_ang + sy * cos_ang - pos_x;
    
    if(single_image == 1.0)
    {
        xx=clamp(xx, 0.0, 1.0/scale_x);
        yy=clamp(yy, 0.0, 1.0/scale_y);
    }
    vec4 color = texture2D(samplerFront, vec2(mod(xx * scale_x, 1.0), mod(yy * scale_y, 1.0)));
    
    //add some fog in the distance
    gl_FragColor = vec4(color.rgb/color.a, color.a*(abs(pz)*15.0));
}

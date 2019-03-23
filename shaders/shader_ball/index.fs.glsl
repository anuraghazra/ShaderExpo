// fragment shader
precision mediump float;

uniform vec2 resolution;
uniform float uTime;
uniform vec2 mouse;
uniform sampler2D backbuffer;

const int num_x = 5;
const int num_y = 5;
float w = resolution.x;
float h = resolution.y;
 
vec4 draw_ball(int i, int j) {
	float t = uTime;
	float x = w/2.0 * (1.0 + cos(mouse.x/w*0.1 * t + float(3*i+4*j)));
	float y = h/2.0 * (1.0 + sin(2.3 * t + float(3*i+4*j)));
	float size = 10.0 - 5.0 * sin(t);
	vec2 pos = vec2(x, y);
	float dist = length(gl_FragCoord.xy - pos);
	float intensity = pow(size/dist, 2.0);
	vec4 color = vec4(0.0);
	color.r = mouse.y/h;
	color.g = 0.5 + sin(t*float(j));
	color.b = 0.5 + sin(float(j));
	return color*intensity;
}

void main() {
	vec4 color = vec4(0.0);
	for (int i = 0; i < num_x; ++i) {
		for (int j = 0; j < num_y; ++j) {
			color += draw_ball(i, j);
		}
	}
	vec2 texPos = vec2(gl_FragCoord.xy/resolution);
	vec4 shadow = texture2D(backbuffer, texPos)*0.7;
	gl_FragColor = color + shadow;
	gl_FragColor = vec4(gl_FragColor.xyz,1.0);
}
// co3moz - mandelbrot
precision highp float;
uniform float uTime;
uniform vec2 resolution;

#define ITERATION 1024

vec3 mandelbrot(vec2 p) {
  vec2 s = p;
  float d = 0.0, l;
	
  for (int i = 0; i < ITERATION; i++) {
    s = vec2(s.x * s.x - s.y * s.y + p.x, 2.0 * s.x * s.y + p.y);
    l = length(s);
    d += l + 0.2;
    if (l > 3.0) return vec3(sin(d * .0314), sin(d * 0.02), sin(d * 0.01));
  }
	
  return vec3(0.0);
}
	
void main() {
  vec2 a = resolution.xy / min(resolution.x, resolution.y);
  vec2 p = ((gl_FragCoord.xy / resolution.xy) * 4.0  - 2.0) * a;
  float f = sin(uTime * 0.5 + 99.0) * 0.5 + 0.5;
  p *= pow(1.5, f * (-31.0));
  p += vec2(-1.002029, 0.303865);
	
  gl_FragColor = vec4(1.0 - mandelbrot(p), 1.0);
}
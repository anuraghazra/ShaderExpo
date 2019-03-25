// Fragment Shader
precision mediump float;

uniform vec2 mouse;
uniform float uTime;
uniform vec2 resolution;

void main() {
  vec2 r = resolution,
  o = gl_FragCoord.xy - r/2.;
  o = vec2(length(o) / r.y - .35, atan(o.y,o.x));    
  vec4 s = .1*cos(1.5*vec4(0,1,2,3) + uTime + o.y + sin(o.y) * sin(uTime)*2.);
  vec4 e = s.yzwx;
  vec4 f = min(o.x-s,e-o.x);
  gl_FragColor = dot(clamp(f*r.y,0.,1.),80.*(s-e)) * (s-0.1) - f;
}
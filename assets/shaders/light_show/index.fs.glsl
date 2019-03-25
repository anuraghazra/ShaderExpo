// Fragment Shader
precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNorm; 

uniform vec2 mouse;
uniform float uTime;
uniform sampler2D texture;

void main() {
  vec4 texel = texture2D(texture, vTexCoord);
  
  vec3 ambientIntensity = vec3(0.3);
  vec3 sunIntensity = vec3(vec3(sin(uTime) * 2.0, cos(uTime) * 2.0, sin(-uTime) * 2.0));
  vec3 sunDirection = normalize(vec3(cos(uTime) * 10.0, sin(uTime) * 5.0, sin(-uTime) * 10.0));
  float dotProd = max(dot(vNorm, sunDirection), 0.0);
  vec3 lightIntensity = ambientIntensity + sunIntensity * dotProd;

  gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}

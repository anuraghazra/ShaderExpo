// Fragment Shader
precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNorm; 

uniform vec2 mouse;
uniform float uTime;
uniform sampler2D texture;

void main() {
  vec4 texel = texture2D(texture, vTexCoord);
  
  vec3 ambientIntensity = vec3(0.5);
  vec3 sunIntensity = vec3(1.0, 1.0, 1.0);
  vec3 sunDirection = normalize(vec3(-1.0, 2.0, -1.1));
  float dotProd = max(dot(vNorm, sunDirection), 0.0);
  vec3 lightIntensity = ambientIntensity + sunIntensity * dotProd;

  gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}

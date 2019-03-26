// Fragment Shader
precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNorm; 
varying vec3 fragPos;

uniform vec3 viewPos;
uniform vec2 mouse;
uniform float uTime;
uniform sampler2D texture;

void main() {
  vec4 texel = texture2D(texture, vTexCoord);
  vec3 lightPos = vec3(5.0, 5.0, -10.0);
  vec3 lightColor = vec3(1.0);

  float ambientStrength = 0.5;
  vec3 ambient = ambientStrength * lightColor;

  vec3 norm = normalize(vNorm);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  float specularStrength = 1.0;
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);  
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * lightColor; 

  vec3 result = (ambient + diffuse + specular) * texel.xyz;
  gl_FragColor = vec4(result, 1.0);
}

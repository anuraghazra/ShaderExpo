// Vertex Shader
precision mediump float;
attribute vec3 aVertexPos;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uTime;

varying vec3 vNorm; 
varying vec2 vTexCoord;
varying vec3 fragPos;


void main() {
  gl_Position = uProjMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPos, 1.0);

  fragPos = vec3(uWorldMatrix * vec4(aVertexPos, 1.0));
  vNorm = (uWorldMatrix * vec4(aNormal, 0.0)).xyz;
  vTexCoord = aTexCoord;
}
// Vertex Shader
precision mediump float;
attribute vec3 aVertexPos;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

void main() {
  gl_Position = vec4(aVertexPos, 1.0);
}

// Vertex Shader
precision highp float;
attribute vec3 aVertexPos;

void main() {
  gl_Position = vec4(aVertexPos, 1.0);
}

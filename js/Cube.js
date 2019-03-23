class Cube {
  constructor(gl) {
    this.gl = gl;
    // init buffers
    this.positions = new Float32Array([
      // Front face
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
      1.0, 1.0, -1.0,
      1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,

      // Right face
      1.0, -1.0, -1.0,
      1.0, 1.0, -1.0,
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0,
    ]);
    this.normals = [
      // Front
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,

      // Back
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,

      // Top
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,

      // Bottom
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,

      // Right
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      // Left
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
    ];
    this.indices = [
      0, 1, 2, 0, 2, 3,    // front
      4, 5, 6, 4, 6, 7,    // back
      8, 9, 10, 8, 10, 11,   // top
      12, 13, 14, 12, 14, 15,   // bottom
      16, 17, 18, 16, 18, 19,   // right
      20, 21, 22, 20, 22, 23,   // left
    ];
    this.textureCoords = [
      // Front
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Back
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Top
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Bottom
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Right
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Left
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ]

    this.buffers = {};
  }


  initBuffers() {
    this.buffers.position = createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(this.positions));
    this.buffers.normal = createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(this.normals));
    this.buffers.texture = createBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoords));
    this.buffers.position.numItems = 3;
    this.buffers.normal.numItems = 3;
    this.buffers.texture.numItems = 2;
    this.buffers.indices = createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices));
  }

  enableAttribs(postionAttribLoc, normalAttribLoc, textureAttribLoc) {
    // pos attibs
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.vertexAttribPointer(postionAttribLoc, this.buffers.position.numItems, this.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    // normal attibs
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
    this.gl.vertexAttribPointer(normalAttribLoc, this.buffers.normal.numItems, this.gl.FLOAT, true, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    // texture attrib
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
    this.gl.vertexAttribPointer(textureAttribLoc, this.buffers.texture.numItems, this.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  }

}
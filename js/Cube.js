class Cube {
  constructor(gl) {
    this.gl = gl;

    let { positions, normals, indices, texCoords } = this.createGeometry({});
    this.positions = positions;
    this.normals = normals;
    this.indices = indices;
    this.texCoords = texCoords;
    this.buffers = {};
  }

  createGeometry(options) {
    let width = options.width || 1;
    let height = options.height || 1;
    let depth = options.depth || 1;

    let CUBE_FACE_INDICES_ = [
      [3, 7, 5, 1], // right
      [6, 2, 0, 4], // left
      [6, 7, 3, 2], // top?
      [0, 1, 5, 4], // bottom?
      [7, 6, 4, 5], // front
      [2, 3, 1, 0]  // back
    ];

    let cornerVertices = [
      [-width, -height, -depth],
      [+width, -height, -depth],
      [-width, +height, -depth],
      [+width, +height, -depth],
      [-width, -height, +depth],
      [+width, -height, +depth],
      [-width, +height, +depth],
      [+width, +height, +depth]
    ];

    let faceNormals = [
      [+1, +0, +0],
      [-1, +0, +0],
      [+0, +1, +0],
      [+0, -1, +0],
      [+0, +0, +1],
      [+0, +0, -1]
    ];

    let uvCoords = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1]
    ];

    // let numVertices = 6 * 4;
    let positions = [];
    let normals = [];
    let texCoords = [];
    let indices = [];

    for (let f = 0; f < 6; ++f) {
      let faceIndices = CUBE_FACE_INDICES_[f];
      for (let v = 0; v < 4; ++v) {
        let position = cornerVertices[faceIndices[v]];
        let normal = faceNormals[f];
        let uv = uvCoords[v];
        // Each face needs all four vertices because the normals and texture
        // coordinates are not all the same.
        positions.push(position);
        normals.push(normal);
        texCoords.push(uv);

      }
      // Two triangles make a square face.
      let offset = 4 * f;
      indices.push([offset + 0, offset + 1, offset + 2]);
      indices.push([offset + 0, offset + 2, offset + 3]);
    }
    positions = [].concat.apply([], positions);
    normals = [].concat.apply([], normals);
    texCoords = [].concat.apply([], texCoords);
    indices = [].concat.apply([], indices);

    positions = new Float32Array(positions);
    normals = new Float32Array(normals);
    texCoords = new Float32Array(texCoords);
    indices = new Uint16Array(indices);

    return { positions, normals, texCoords, indices };

  }

  initBuffers() {
    this.buffers.position = createBuffer(this.gl, this.gl.ARRAY_BUFFER, this.positions);
    this.buffers.normal = createBuffer(this.gl, this.gl.ARRAY_BUFFER, this.normals);
    this.buffers.texture = createBuffer(this.gl, this.gl.ARRAY_BUFFER, this.texCoords);
    this.buffers.position.numItems = 3;
    this.buffers.normal.numItems = 3;
    this.buffers.texture.numItems = 2;
    this.buffers.indices = createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.indices);
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
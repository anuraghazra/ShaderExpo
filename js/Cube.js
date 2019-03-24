class Mesh {
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
    this.verticesCount = indices.length;

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
    // checking attrib location for undefined because i'm using 
    // gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    // https://stackoverflow.com/questions/22307766/how-to-use-getactiveuniform-in-webgl 
    if (postionAttribLoc == undefined) { postionAttribLoc = -1 };
    if (normalAttribLoc == undefined) { normalAttribLoc = -1 };
    if (textureAttribLoc == undefined) { textureAttribLoc = -1 };

    // pos attibs
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.vertexAttribPointer(postionAttribLoc, this.buffers.position.numItems, this.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    // normal attibs
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
    this.gl.vertexAttribPointer(normalAttribLoc, this.buffers.normal.numItems, this.gl.FLOAT, true, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    // texture attrib
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
    this.gl.vertexAttribPointer(textureAttribLoc, this.buffers.texture.numItems, this.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(postionAttribLoc);
    this.gl.enableVertexAttribArray(normalAttribLoc);
    this.gl.enableVertexAttribArray(textureAttribLoc);
  }

}

class Torus extends Mesh {
  constructor(gl) {
    super(gl);
  }

  createGeometry(options) {
    options = options || {};
    let radialSubdivisions = options.radialSubdivisions || 16;
    let bodySubdivisions = options.bodySubdivisions || 16;
    let opt_startAngle = options.opt_startAngle;
    let opt_endAngle = options.opt_endAngle;
    let radius = options.radius || 1;
    let thickness = options.thickness || 0.5;

    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (bodySubdivisions < 3) {
      throw Error('verticalSubdivisions must be 3 or greater');
    }

    var startAngle = opt_startAngle || 0;
    var endAngle = opt_endAngle || Math.PI * 2;
    var range = endAngle - startAngle;

    var positions = [];
    var normals = [];
    var texCoords = [];
    var indices = [];

    for (var slice = 0; slice < bodySubdivisions; ++slice) {
      var v = slice / bodySubdivisions;
      var sliceAngle = v * Math.PI * 2;
      var sliceSin = Math.sin(sliceAngle);
      var ringRadius = radius + sliceSin * thickness;
      var ny = Math.cos(sliceAngle);
      var y = ny * thickness;
      for (var ring = 0; ring < radialSubdivisions; ++ring) {
        var u = ring / radialSubdivisions;
        var ringAngle = startAngle + u * range;
        var xSin = Math.sin(ringAngle);
        var zCos = Math.cos(ringAngle);
        var x = xSin * ringRadius;
        var z = zCos * ringRadius;
        var nx = xSin * sliceSin;
        var nz = zCos * sliceSin;
        positions.push([x, y, z]);
        normals.push([nx, ny, nz]);
        texCoords.push([u, 1 - v]);
      }
    }

    for (var slice = 0; slice < bodySubdivisions; ++slice) {
      for (var ring = 0; ring < radialSubdivisions; ++ring) {
        var nextRingIndex = (1 + ring) % radialSubdivisions;
        var nextSliceIndex = (1 + slice) % bodySubdivisions;
        indices.push([radialSubdivisions * slice + ring,
        radialSubdivisions * nextSliceIndex + ring,
        radialSubdivisions * slice + nextRingIndex]);
        indices.push([radialSubdivisions * nextSliceIndex + ring,
        radialSubdivisions * nextSliceIndex + nextRingIndex,
        radialSubdivisions * slice + nextRingIndex]);
      }
    }

    positions = [].concat.apply([], positions);
    normals = [].concat.apply([], normals);
    texCoords = [].concat.apply([], texCoords);
    indices = [].concat.apply([], indices);

    positions = new Float32Array(positions);
    normals = new Float32Array(normals);
    texCoords = new Float32Array(texCoords);
    indices = new Uint16Array(indices);

    this.verticesCount = indices.length;
    return { positions, normals, texCoords, indices };
  }
}


class Plane extends Mesh {
  constructor(gl) {
    super(gl);
  }

  createGeometry(options) {
    options = options || {};


    let positions = new Float32Array([
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
    ]);
    let normals = new Float32Array([
      1.0, 1.0, 1.0,
      -1.0, -1.0, -1.0,
      1.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ]);
    let texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]);
    let indices = new Uint16Array([
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
    ]);

    this.verticesCount = indices.length;
    return { positions, normals, texCoords, indices };
  }
}

class Sphere extends Mesh {
  constructor(gl) {
    super(gl);
  }

  createGeometry(options) {
    options = options || {};

    var long_bands = options.long_bands || 32;
    var lat_bands = options.lat_bands || 32;
    var radius = options.radius || 1;
    var lat_step = Math.PI / lat_bands;
    var long_step = 2 * Math.PI / long_bands;
    var num_positions = long_bands * lat_bands * 4;
    var num_indices = long_bands * lat_bands * 6;
    var lat_angle, long_angle;
    var positions = new Float32Array(num_positions * 3);
    var normals = new Float32Array(num_positions * 3);
    var texCoords = new Float32Array(num_positions * 2);
    var indices = new Uint16Array(num_indices);
    var x1, x2, x3, x4,
      y1, y2,
      z1, z2, z3, z4,
      u1, u2,
      v1, v2;
    var i, j;
    var k = 0, l = 0;
    var vi, ti;

    for (i = 0; i < lat_bands; i++) {
      lat_angle = i * lat_step;
      y1 = Math.cos(lat_angle);
      y2 = Math.cos(lat_angle + lat_step);
      for (j = 0; j < long_bands; j++) {
        long_angle = j * long_step;
        x1 = Math.sin(lat_angle) * Math.cos(long_angle);
        x2 = Math.sin(lat_angle) * Math.cos(long_angle + long_step);
        x3 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle);
        x4 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle + long_step);
        z1 = Math.sin(lat_angle) * Math.sin(long_angle);
        z2 = Math.sin(lat_angle) * Math.sin(long_angle + long_step);
        z3 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle);
        z4 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle + long_step);
        u1 = 1 - j / long_bands;
        u2 = 1 - (j + 1) / long_bands;
        v1 = 1 - i / lat_bands;
        v2 = 1 - (i + 1) / lat_bands;
        vi = k * 3;
        ti = k * 2;

        positions[vi] = x1 * radius;
        positions[vi + 1] = y1 * radius;
        positions[vi + 2] = z1 * radius; //v0

        positions[vi + 3] = x2 * radius;
        positions[vi + 4] = y1 * radius;
        positions[vi + 5] = z2 * radius; //v1

        positions[vi + 6] = x3 * radius;
        positions[vi + 7] = y2 * radius;
        positions[vi + 8] = z3 * radius; // v2


        positions[vi + 9] = x4 * radius;
        positions[vi + 10] = y2 * radius;
        positions[vi + 11] = z4 * radius; // v3

        normals[vi] = x1;
        normals[vi + 1] = y1;
        normals[vi + 2] = z1;

        normals[vi + 3] = x2;
        normals[vi + 4] = y1;
        normals[vi + 5] = z2;

        normals[vi + 6] = x3;
        normals[vi + 7] = y2;
        normals[vi + 8] = z3;

        normals[vi + 9] = x4;
        normals[vi + 10] = y2;
        normals[vi + 11] = z4;

        texCoords[ti] = u1;
        texCoords[ti + 1] = v1;

        texCoords[ti + 2] = u2;
        texCoords[ti + 3] = v1;

        texCoords[ti + 4] = u1;
        texCoords[ti + 5] = v2;

        texCoords[ti + 6] = u2;
        texCoords[ti + 7] = v2;

        indices[l] = k;
        indices[l + 1] = k + 1;
        indices[l + 2] = k + 2;
        indices[l + 3] = k + 2;
        indices[l + 4] = k + 1;
        indices[l + 5] = k + 3;

        k += 4;
        l += 6;
      }
    }
    this.verticesCount = indices.length;

    return { positions, normals, texCoords, indices };
  }
}

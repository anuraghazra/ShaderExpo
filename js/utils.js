/**
 * 
 * @param {WebGLRenderingContext} _gl 
 * @param {Number} type 
 * @param {any} data 
 * @param {Number} drawMethod 
 */
function createBuffer(_gl, type, data, drawMethod) {
  drawMethod = drawMethod || _gl.STATIC_DRAW;
  let buffer = _gl.createBuffer();
  _gl.bindBuffer(type, buffer);
  _gl.bufferData(type, data, drawMethod);
  return buffer;
}

/**
 * 
 * @param {WebGLRenderingContext} _gl 
 * @param {WebGLBuffer} buffer 
 * @param {Number} type 
 */
function bindBuffer(_gl, buffer, type) {
  type = type || _gl.ARRAY_BUFFER;
  _gl.bindBuffer(type, buffer);
}

/**
 * 
 * @param {WebGLRenderingContext} _gl 
 * @param {*} pos 
 * @param {*} items 
 * @param {*} norm 
 * @param {*} stride 
 * @param {*} offset 
 */
function setVertexAttribPointer(_gl, pos, items, norm, stride, offset) {
  norm = norm || false;
  stride = stride || 0;
  offset = offset || 0;
  _gl.vertexAttribPointer(pos, items, _gl.FLOAT, norm, stride, offset);

}

/**
 * 
 * @param {String} url 
 * @param {Function} callback 
 */
function loadImage(url, callback) {
  let img = new Image();
  img.src = url;
  img.onload = callback;
  return img;
}

/**
 * 
 * @param {WebGLRenderingContext} _gl 
 * @param {WebGLTexture} texture 
 * @param {any} image 
 */
function renderTexture(_gl, texture, image) {
  _gl.bindTexture(_gl.TEXTURE_2D, texture);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
  _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, image);
  _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
}

/**
 * 
 * @param {String} id 
 */
function id(id) {
  return document.getElementById(id);
}
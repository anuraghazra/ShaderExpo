function getShaderError(_gl, shader, shaderString) {
  if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
    let errorline = +_gl.getShaderInfoLog(shader).match(/ERROR:\s\d+:(\d+):/)[1];
    let codeline = errorline + ' : ' + shaderString.split('\n')[errorline - 1].trim();

    return [_gl.getShaderInfoLog(shader), '------',  '> ' + codeline, '------'].join('\n');
  }
}

function createShader(_gl, type, source) {
  const shader = _gl.createShader(type);
  _gl.shaderSource(shader, source);
  _gl.compileShader(shader);
  // Check For Shader Errors
  let error = getShaderError(_gl, shader, source);
  let name = (type == _gl.VERTEX_SHADER) ? 'VERTEX_SHADER ' : 'FRAGMENT_SHADER ';
  
  if (error) { console.log(error); return { error: '\n' +  name + '\n' + error } }

  return shader;
}


function createProgram(_gl, vshader, fshader) {
  const program = _gl.createProgram();
  _gl.attachShader(program, vshader);
  _gl.attachShader(program, fshader);
  _gl.linkProgram(program);
  if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
    console.warn('Unable to initialize program ' + _gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}



function loadImage(url, callback) {
  let img = new Image();
  img.src = url;
  img.onload = callback;
  return img;
}

function renderTexture(_gl, texture, image) {
  _gl.bindTexture(_gl.TEXTURE_2D, texture);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
  _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
  _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, image)
}


function id(id) {
  return document.getElementById(id);
}
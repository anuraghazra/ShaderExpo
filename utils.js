function getShaderVariables(gl, shader, program) {
  if (!program.attribs) program.attribs = {};
  if (!program.uniforms) program.uniforms = {};

  function getVar(match) {
    return match.split(' ')[2].replace(';', '');
  }
  function getType(match) {
    return match.split(' ')[1].replace(';', '');
  }
  
  // * > Find Variables

  // regEx Taken From claygl.js
  let matchUnis = shader.match(/uniform\s+(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+([\s\S]*?);/g);
  let matchAttrs = shader.match(/attribute\s+(float|int|vec2|vec3|vec4)\s+([\s\S]*?);/g);
  // old regex
  // let matchAttrs = shader.match(/attribute\s(.*?);/img);
  // let matchUnis = shader.match(/uniform\s(.*?);/img);

  if (matchAttrs) {
    for (let i = 0; i < matchAttrs.length; i++) {
      let _var = getVar(matchAttrs[i]);
      program.attribs[_var] = gl.getAttribLocation(program, _var);
    }
  }

  if (matchUnis) {
    for (let i = 0; i < matchUnis.length; i++) {
      let _var = getVar(matchUnis[i]);
      let location = gl.getUniformLocation(program, _var)
      if (location) {
        program.uniforms[_var] = location;
        program.uniforms[_var].type = getType(matchUnis[i]);
      }
    }
  }


  // * > Find Structs
  // let matchStruct = shader.match(/struct\s.*\w\s?\{(\s\n.*;){0,}/gm);
  let matchStruct = shader.match(/\bstruct.+?{(\n?[^\;]?.+?){0,}?\n?\};/mg);
  let matchStructVar = shader.match(/uniform\s[a-zA-Z\s]+;/img);

  if (matchStructVar === null || matchStruct === null) {
    return;
  }
  for (let i = 0; i < matchStructVar.length; i++) {
    for (let j = 0; j < matchStruct.length; j++) {
      let structname = matchStruct[j].split(' ')[1];
      let varname = matchStructVar[i].split(' ')[2].replace(';', '');

      if (matchStructVar[i].split(' ')[1] === structname) {
        // * filter Booleans and remove new line with second filter
        let struct = matchStruct[j].split(' ').filter(Boolean).filter(function (i) {
          return i.match('^\n$') === null;
        });
        for (let k = 4; k < struct.length; k += 2) {
          struct[k] = struct[k].replace(/\}|;|\n/g, '');
          let prop = (varname + '.' + struct[k]).replace('"', '').trim();
          program.uniforms[prop] = gl.getUniformLocation(program, prop);
          program.uniforms[prop].name = struct[k];
          program.uniforms[prop].type = struct[k - 1];
        }
      }
    }
  }

  return program;
}

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

function createBuffer(_gl, type, data, drawMethod) {
  drawMethod = drawMethod || _gl.STATIC_DRAW;
  let buffer = _gl.createBuffer();
  _gl.bindBuffer(type, buffer);
  _gl.bufferData(type, data, drawMethod);
  return buffer;
}


function bindBuffer(_gl, buffer, type) {
  type = type || _gl.ARRAY_BUFFER;
  _gl.bindBuffer(type, buffer);
}
function setVertexAttribPointer(_gl, pos, items, norm, stride, offset) {
  norm = norm || false;
  stride = stride || 0;
  offset = offset || 0;
  _gl.vertexAttribPointer(pos, items, _gl.FLOAT, norm,  stride, offset);

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
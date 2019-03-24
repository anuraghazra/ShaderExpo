class Shader {
  constructor(gl, vShader, fShader) {
    this.gl = gl;
    this.vShader = vShader;
    this.fShader = fShader;

    this.vertexShader = null;
    this.fragmentShader = null;

    this.uniforms = {};
    this.attribs = {};

    this.program = null;

    this.errors = [];
  }



  init() {
    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vShader);
    this.fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fShader);

    this.errors = [this.vertexShader.error, this.fragmentShader.error];
    if (!(this.vertexShader.error || this.fragmentShader.error)) {
      this.createProgram();
      this.errors = [];
    }
  }

  createProgram() {
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.warn('Unable to initialize program ' + this.gl.getProgramInfoLog(this.program));
      return null;
    }
    return this.program;
  }

  deleteShader() {
    this.gl.deleteShader(this.vertexShader);
    this.gl.deleteShader(this.fragmentShader);
  }
  setShaders(vShader, fShader) {
    this.vShader = vShader;
    this.fShader = fShader;
  }

  cleanUp() {
    this.vShader = null;
    this.fShader = null;
    this.vertexShader = null;
    this.fragmentShader = null;
    this.uniforms = {};
    this.attribs = {};
    this.program = null;
    this.errors = [];
  }

  /**
   * @method getShaderError
   * @param {WebGLShader} shader 
   * @param {String} shaderString 
   */
  getShaderError(shader, shaderString) {
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      let errorline = +this.gl.getShaderInfoLog(shader).match(/ERROR:\s\d+:(\d+):/)[1];
      let codeline = errorline + ' : ' + shaderString.split('\n')[errorline - 1].trim();

      return [this.gl.getShaderInfoLog(shader), '------', '> ' + codeline, '------'].join('\n');
    }
  }

  /**
   * 
   * @param {Number} type 
   * @param {String} source 
   */
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    // Check For Shader Errors
    let error = this.getShaderError(shader, source);
    let name = (type == this.gl.VERTEX_SHADER) ? 'VERTEX_SHADER ' : 'FRAGMENT_SHADER ';

    if (error) {
      console.warn(error);
      return { error: '\n' + name + '\n' + error };
    }
    return shader;
  }

  /**
   * @method getShaderVariables
   * @param {WebGLRenderingContext} gl 
   * @param {WebGLProgram} program 
   */
  getShaderVariables(program) {
    // get shader variables location;
    this.uniforms = {};
    this.attribs = {};
    const numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
      const info = this.gl.getActiveUniform(this.program, i);
      this.uniforms[info.name] = this.gl.getUniformLocation(this.program, info.name);
    }
    const numAttribs = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i) {
      const info = this.gl.getActiveAttrib(this.program, i);
      this.attribs[info.name] = this.gl.getAttribLocation(this.program, info.name);
    }

    return program;
  }

}
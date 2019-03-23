// class Setup {
//   constructor(gl) {
//     this.gl = gl;

//     gl.clearColor(0.0, 0.0, 0.0, 1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT);

//     gl.enable(gl.DEPTH_TEST);
//     gl.depthFunc(gl.LEQUAL);
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     this.image = loadImage('./assets/wood.jpg', this.main);

//     this.fieldOfView = glMatrix.toRadian(45);   // in radians
//     this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//     this.zNear = 0.1;
//     this.zFar = 1000.0;
//     this.program = null;
    
//     this.worldMatrix = mat4.create();
//     this.viewMatrix = mat4.create();
//     this.projMatrix = mat4.create();
    
//     this.cube = new Cube(gl);
//     this.texture = gl.createTexture();
//   }
  
//   init() {
    
//     this.cube.initBuffers();
//     renderTexture(this.gl, this.texture, this.image);

//     // get shader code
//     this.vShader = editorVertex.getValue();
//     this.fShader = editorFragment.getValue();
//     // create, compile, check shaders
//     this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vShader);
//     this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShader);
//     showErrors(this.vertexShader, this.fragmentShader, DOMError);

//     // create program and set get shader variables
//     program = createProgram(gl, this.vertexShader, this.fragmentShader);
//     getShaderVariables(gl, vShader, program);
//     getShaderVariables(gl, fShader, program);

//     gl.useProgram(program);
//   }

//   main() {

//   }
// }
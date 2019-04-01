///<reference path="../../webgl.d.ts" />
window.onload = function () {

  // Shader Code
  const vertexShaderValue = `// Vertex Shader
precision mediump float;
attribute vec3 aVertexPos;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform float uTime;

varying vec3 vNorm; 
varying vec2 vTexCoord;

void main() {
  gl_Position = uProjMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPos, 1.0);
  vNorm = (uWorldMatrix * vec4(aNormal, 0.0)).xyz;
  vTexCoord = aTexCoord;
}
`;
  const fragmentShaderValue = `// Fragment Shader
precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNorm;

uniform vec2 mouse;
uniform float uTime;
uniform sampler2D texture;

void main() {
  vec4 texel = texture2D(texture, vTexCoord);

  vec3 ambientIntensity = vec3(0.5);
  vec3 sunIntensity = vec3(1.0, 1.0, 1.0);
  vec3 sunDirection = normalize(vec3(-1.0, 2.0, -1.1));
  float dotProd = max(dot(vNorm, sunDirection), 0.0);
  vec3 lightIntensity = ambientIntensity + sunIntensity * dotProd;

  gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}
`;

  // init gl
  const glcanvas = document.getElementById('c');
  const gl = glcanvas.getContext('webgl');
  const width = window.innerWidth;
  const height = window.innerHeight;
  glcanvas.width = width;
  glcanvas.height = height;

  let image = loadImage('../../assets/textures/wood.jpg', main);

  // Main Run
  function main() {

    // GL CLEAR -----------
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


    // INTIALIZE VARIABLES
    let timeStart = Date.now() / 1000.0; // time
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let camera = new Camera([0, 0, -8], aspect);


    // init texture
    let texture = gl.createTexture();
    renderTexture(gl, texture, image);

    // init mesh
    let mesh = new Mesh(gl);
    mesh.initBuffers();

    // init shader
    let shader = new Shader(gl);

    // init matrices
    let worldMatrix = mat4.create();
    let viewMatrix = mat4.create();
    let projMatrix = mat4.create();
    function setMatrices() {
      gl.uniformMatrix4fv(shader.uniforms.uWorldMatrix, false, worldMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, viewMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, projMatrix);
    }


    function compile() {
      // create, compile, check shaders
      shader.setShaders(vertexShaderValue, fragmentShaderValue);
      shader.init();
      if (shader.isVertexShaderError || shader.isFragmentShaderError) {
        return false;
      };

      shader.getShaderVariables();
      gl.useProgram(shader.program);


      // bind buffer
      mesh.enableAttribs(shader.attribs.aVertexPos, shader.attribs.aNormal, shader.attribs.aTexCoord);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.indices);

      // init and set matrices
      camera.lookAt(viewMatrix).perspective(projMatrix);

      gl.uniform2fv(shader.uniforms.resolution, [gl.canvas.width, gl.canvas.height]);

    }


    compile();
    animate();
    function animate() {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // camera position
      gl.uniform3fv(shader.uniforms.viewPos, camera.position);
      gl.uniform1f(shader.uniforms.uTime, (Date.now() / 1000.0) - timeStart);

      // mat4.identity(worldMatrix);
      mat4.rotate(worldMatrix, worldMatrix, 0.01, [0, 1, 0]);
      mat4.rotate(worldMatrix, worldMatrix, 0.01, [-1, 0, 0]);

      // init and set matrices
      setMatrices();
      gl.drawElements(gl.TRIANGLES, mesh.indicesCount, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(animate);
    }
  }

}
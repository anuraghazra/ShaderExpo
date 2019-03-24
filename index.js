///<reference path="webgl.d.ts" />
window.onload = function () {
  const width = window.innerWidth / 2;
  const height = window.innerHeight;
  let t0 = Date.now() / 1000.0; // time
  const glcanvas = document.getElementById('c');
  glcanvas.width = width;
  glcanvas.height = height;
  /**
   * @type WebGLRenderingContext
   */
  const gl = glcanvas.getContext('webgl');

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
`
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


  // CODE EDITOR
  const DOMPreloader = id('preloader');
  const DOMRotX = id('rot-x');
  const DOMRotY = id('rot-y');
  const DOMFile = id('file-load');
  const DOMSelect = id('select-box');
  const DOMRun = id('run-shader');
  const DOMError = id('error-msg');
  const DOMVertexDiv = id('vertex-shader-code');
  const DOMFragmentDiv = id('fragment-shader-code');
  const DOMLiveEdit = id('live-edit');
  DOMPreloader.classList.add('hide');
  let editorSetting = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    useSoftTabs: true,
    theme: "ace/theme/dracula",
    mode: "ace/mode/glsl"
  }
  var editorVertex = ace.edit("vertex-shader-code");
  var editorFragment = ace.edit("fragment-shader-code");
  editorVertex.setOptions(editorSetting);
  editorFragment.setOptions(editorSetting);
  editorVertex.session.setValue(vertexShaderValue, 1);
  editorFragment.session.setValue(fragmentShaderValue, 1);


  let image = loadImage('./assets/wood.jpg', main);
  // Main function which runs once
  function main() {
    DOMVertexDiv.addEventListener('keyup', function () {
      DOMLiveEdit.checked && compile();
    })
    DOMFragmentDiv.addEventListener('keyup', function () {
      DOMLiveEdit.checked && compile();
    })
    DOMRun.addEventListener('click', compile);
    DOMFile.addEventListener('change', function (evt) {
      let tgt = evt.target || window.event.srcElement;
      let files = tgt.files;

      if (!("FileReader" in window)) {
        alert('file loader API is not supported, you will not be able to load textures');
      }
      // FileReader support
      if (FileReader && files && files.length) {
        let fr = new FileReader();
        fr.onload = function () {
          image = loadImage(fr.result, function () {
            renderTexture(gl, texture, image);
          });
        }
        fr.readAsDataURL(files[0]);
      }
    });
    // Load Examples
    DOMSelect.addEventListener('input', function (e) {
      DOMVertexDiv.classList.add('shader-loading');
      DOMFragmentDiv.classList.add('shader-loading');
      let loader = document.createElement('div');
      loader.className = 'loader loader-shader';
      let loader2 = loader.cloneNode();
      DOMVertexDiv.appendChild(loader);
      DOMFragmentDiv.appendChild(loader2);

      let value = e.target.value;
      let path = './shaders/' + value;
      fetchShader(path, (vert, frag) => {
        editorVertex.session.setValue(vert, 1);
        editorFragment.session.setValue(frag, 1);
        DOMVertexDiv.removeChild(loader);
        DOMFragmentDiv.removeChild(loader2);
        DOMVertexDiv.classList.remove('shader-loading');
        DOMFragmentDiv.classList.remove('shader-loading');
        compile();
      })
    });

    // GL CLEAR -----------
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // INTIALIZE VARIABLES
    const fieldOfView = glMatrix.toRadian(45); // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 1000.0;
    // init matrices
    let worldMatrix = mat4.create();
    let viewMatrix = mat4.create();
    let projMatrix = mat4.create();
    // init texture
    let texture = gl.createTexture();
    renderTexture(gl, texture, image);
    // init mesh
    let mesh = new Mesh(gl);
    mesh.initBuffers();
    // init shader
    let shader = new Shader(gl);


    /**
     * @method compile 
     * recompiles the code everytime when any change has happen in shaders
     */
    function compile() {
      // get shader code
      let vShader = editorVertex.getValue();
      let fShader = editorFragment.getValue();

      // create, compile, check shaders
      shader.setShaders(vShader, fShader);
      shader.init();
      shader.getShaderVariables();
      showErrors(shader.errors, DOMError);
      if (shader.errors.length > 0) {
        return;
      }
      gl.useProgram(shader.program);


      // bind buffer
      mesh.enableAttribs(shader.attribs.aVertexPos, shader.attribs.aNormal, shader.attribs.aTexCoord);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.indices);

      // init and set matrices
      mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
      mat4.perspective(projMatrix, fieldOfView, aspect, zNear, zFar);
      gl.uniform2fv(shader.uniforms.resolution, [gl.canvas.width, gl.canvas.height]);
    }

    function setMatrices() {
      gl.uniformMatrix4fv(shader.uniforms.uWorldMatrix, false, worldMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, viewMatrix);
      gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, projMatrix);
    }



    window.addEventListener('mousemove', function (e) {
      gl.uniform2fv(shader.uniforms.mouse, [e.offsetX, e.offsetY]);
    });

    // -- draw
    compile();
    animate();
    function animate() {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniform1f(shader.uniforms.uTime, (Date.now() / 1000.0) - t0);

      mat4.rotate(worldMatrix, worldMatrix, DOMRotX.value, [0, 1, 0]);
      mat4.rotate(worldMatrix, worldMatrix, DOMRotY.value, [1, 0, 0]);

      setMatrices();

      gl.drawElements(gl.TRIANGLES, mesh.verticesCount, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(animate);
    }

  }

}
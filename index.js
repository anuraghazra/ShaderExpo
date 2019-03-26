///<reference path="webgl.d.ts" />
window.onload = function () {

  // empty shaders
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
  const width = window.innerWidth / 2;
  const height = window.innerHeight;
  glcanvas.width = width;
  glcanvas.height = height;

  // DOM Variables
  const DOMPreloader = id('preloader');
  const DOMRotX = id('rot-x');
  const DOMRotY = id('rot-y');
  const DOMFile = id('file-load');
  const DOMLoadModel = id('model-load');
  const DOMSelect = id('select-box');
  const DOMModel = id('select-model');
  const DOMRun = id('run-shader');
  const DOMError = id('error-msg');
  const DOMVertexDiv = id('vertex-shader-code');
  const DOMFragmentDiv = id('fragment-shader-code');
  const DOMLiveEdit = id('live-edit');
  const DOMRotate = id('auto-rotate');

  DOMPreloader.classList.add('hide');

  // CODE Editor
  const editorSetting = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    useSoftTabs: true,
    theme: "ace/theme/dracula",
    mode: "ace/mode/glsl"
  }
  const editorVertex = ace.edit("vertex-shader-code");
  const editorFragment = ace.edit("fragment-shader-code");
  editorVertex.setOptions(editorSetting);
  editorFragment.setOptions(editorSetting);
  editorVertex.session.setValue(vertexShaderValue, 1);
  editorFragment.session.setValue(fragmentShaderValue, 1);

  let image = loadImage('./assets/textures/wood.jpg', main);

  // Main Run
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
      let path = './assets/shaders/' + value;
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
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


    // INTIALIZE VARIABLES
    let RAf;
    let timeStart = Date.now() / 1000.0; // time
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let camera = new Camera([0, 0, -8], aspect);

    // init texture
    let texture = gl.createTexture();
    renderTexture(gl, texture, image);

    // init mesh
    let mesh = new Mesh(gl);
    mesh.initBuffers();

    DOMLoadModel.addEventListener('change', function (evt) {
      let tgt = evt.target || window.event.srcElement;
      let files = tgt.files;

      if (!("FileReader" in window)) {
        alert('file loader API is not supported, you will not be able to load model');
      }
      // FileReader support
      if (FileReader && files && files.length) {
        let fr = new FileReader();
        fr.onload = function () {
          cancelAnimationFrame(RAf);
          mesh.loadRawModel(fr.result);
          compile();
          animate();
        }
        fr.readAsText(files[0]);
      }
    });

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
      camera.lookAt(viewMatrix).perspective(projMatrix);

      gl.uniform2fv(shader.uniforms.resolution, [gl.canvas.width, gl.canvas.height]);
    }

    window.addEventListener('mousemove', function (e) {
      gl.uniform2fv(shader.uniforms.mouse, [e.offsetX, e.offsetY]);
    });

    // Select Model From DropDown
    DOMModel.addEventListener('input', function (e) {
      cancelAnimationFrame(RAf);
      switch (e.target.value) {
        case 'CUBE':
          mesh = new Mesh(gl);
          mesh.initBuffers();
          break;
        case 'SPHERE':
          mesh = new Sphere(gl);
          mesh.initBuffers();
          break;
        case 'TORUS':
          mesh = new Torus(gl);
          mesh.initBuffers();
          break;
        case 'TEAPOT':
          mesh.rawModel.loadFromUrl('./assets/models/teapot.obj', function () {
            cancelAnimationFrame(RAf);
            mesh.setData();
            mesh.initBuffers();
            compile();
            animate();
          })
          break;
      }
      compile();
      animate();
    });


    let MOUSE_DOWN = false;
    let camAngleY = 0;
    let camAngleX = 0;
    let offset = { x: 0, y: 0 };
    glcanvas.addEventListener('mousedown', function (e) {
      MOUSE_DOWN = true;
      offset.x = e.offsetX;
      offset.y = e.offsetY;
    })
    glcanvas.addEventListener('mouseup', function (e) {
      MOUSE_DOWN = false;
      offset.x = e.offsetX;
      offset.y = e.offsetY;
    })
    glcanvas.addEventListener('mousemove', function (e) {
      if (!MOUSE_DOWN) return;
      camAngleX = e.offsetX - offset.x;
      camAngleY = e.offsetY - offset.y;
      mat4.rotate(worldMatrix, worldMatrix, glMatrix.toRadian(camAngleX), [0, 1, 0]);
      mat4.rotate(worldMatrix, worldMatrix, glMatrix.toRadian(camAngleY), [-1, 0, 0]);
      offset.x = e.offsetX;
      offset.y = e.offsetY;
    });

    // -- draw
    compile();
    animate();
    function animate() {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // camera position
      gl.uniform3fv(shader.uniforms.viewPos, camera.position);

      gl.uniform1f(shader.uniforms.uTime, (Date.now() / 1000.0) - timeStart);
      if (DOMRotate.checked && !MOUSE_DOWN) {
        mat4.rotate(worldMatrix, worldMatrix, DOMRotX.value, [0, 1, 0]);
        mat4.rotate(worldMatrix, worldMatrix, DOMRotY.value, [-1, 0, 0]);
      }

      // init and set matrices
      setMatrices();
      gl.drawElements(gl.TRIANGLES, mesh.indicesCount, gl.UNSIGNED_SHORT, 0);
      RAf = requestAnimationFrame(animate);
    }

  }

}
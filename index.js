///<reference path="webgl.d.ts" />

/**
 * @name ShaderExpo
 * @author <https://github.com/anuraghazra>
 * @license 
 */
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
  const DOMRotX = id('rot-x');
  const DOMRotY = id('rot-y');
  const DOMFile = id('file-load');
  const DOMLoadModel = id('model-load');
  const DOMSelect = id('select-box');
  const DOMModel = id('select-model');
  const DOMRun = id('run-shader');
  const DOMVertexDiv = id('vertex-shader-code');
  const DOMFragmentDiv = id('fragment-shader-code');
  const DOMLiveEdit = id('live-edit');
  const DOMRotate = id('auto-rotate');
  const DOMFps = id('fps-counter');
  const DOMCompileTime = id('compile-time');
  const DOMExport = id('export-html');
  const DOMExportName = id('export-name');
  const DOMShare = id('share-expo');
  const DOMShareLink = id('share-link');
  const DOMPopup = id('pop-up');
  const DOMCopy = id('copy-share-link');



  // URL Params
  let urlParams = new URLSearchParams(window.location.search);
  let urlShader = urlParams.get('shader') || '';
  let urlVert;
  let urlFrag;
  if (urlShader) {
    let url_shaders = getShaderFromUrl(urlShader);
    urlVert = url_shaders[0];
    urlFrag = url_shaders[1];
  }


  DOMShare.addEventListener('click', function () {
    DOMPopup.style.display = 'flex';
    let shareurl = getShaderShareLink(editorVertex.getValue(), editorFragment.getValue());
    DOMShareLink.value = shareurl;
  })

  DOMPopup.addEventListener('click', function (e) {
    DOMPopup.style.display = 'none';
  });

  DOMCopy.addEventListener('click', function (event) {
    event.stopPropagation();
    DOMShareLink.select();
    document.execCommand("copy");
  });


  // CODE Editor
  const editorVertex = new Editor('vertex-shader-code');
  const editorFragment = new Editor('fragment-shader-code');
  editorVertex.setValue(urlVert || vertexShaderValue);
  editorFragment.setValue(urlFrag || fragmentShaderValue);

  // export as HTML
  DOMExport.addEventListener('click', function () {
    let name = DOMExportName.value || 'shaderExpo';
    exportHTML(name, editorVertex.getValue(), editorFragment.getValue());
  });

  let image = loadImage('./assets/textures/wood.jpg', main);

  // Main Run
  function main() {
    DOMVertexDiv.addEventListener('keyup', debounce(function () {
      DOMLiveEdit.checked && compile();
    }, 500));
    DOMFragmentDiv.addEventListener('keyup', debounce(function () {
      DOMLiveEdit.checked && compile();
    }, 500));

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
        editorVertex.setValue(vert);
        editorFragment.setValue(frag);
        DOMVertexDiv.removeChild(loader);
        DOMFragmentDiv.removeChild(loader2);
        DOMVertexDiv.classList.remove('shader-loading');
        DOMFragmentDiv.classList.remove('shader-loading');
        compile();
      })
    });

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
        case 'PLANE':
          mesh = new Plane(gl);
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
    let mouse = new Mouse(glcanvas);


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

    /**
     * @method compile 
     * recompiles the code everytime when any change has happen in shaders
     */
    function compile() {
      var t0 = performance.now(); // compile time start

      // get shader code
      let vShader = editorVertex.getValue();
      let fShader = editorFragment.getValue();

      // create, compile, check shaders
      shader.setShaders(vShader, fShader);
      shader.init();

      // Show Errors in the editor
      editorVertex.annotations = [];
      editorFragment.annotations = [];
      if (shader.isVertexShaderError) {
        shader.vertexShaderErrors.line.forEach((e, index) => {
          editorVertex.setAnnotations({
            row: e - 1,
            text: shader.vertexShaderErrors.msg[index],
            type: "error"
          })
        })
        shader.isVertexShaderError = false;
      }
      if (shader.isFragmentShaderError) {
        shader.fragmentShaderErrors.line.forEach((e, index) => {
          editorFragment.setAnnotations({
            row: e - 1,
            text: shader.fragmentShaderErrors.msg[index],
            type: "error"
          })
        })
        shader.isFragmentShaderError = false;
      }

      editorVertex.showAnnotations();
      editorFragment.showAnnotations();
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

      // compile time
      var t1 = performance.now();
      DOMCompileTime.innerText = "Compiled in " + (t1 - t0).toFixed(2) + " miliseconds";
    }

    window.addEventListener('mousemove', function (e) {
      gl.uniform2fv(shader.uniforms.mouse, [e.offsetX, e.offsetY]);
    });


    // -- draw
    compile();
    animate();

    // FPS  
    var PREV_TIME = 0;
    var FRAME_TIME = 0;
    var FRAMES = 0;
    function animate(time) {
      var dt = (time - PREV_TIME);

      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // FPS
      PREV_TIME = time;
      FRAME_TIME += dt;
      FRAMES++;
      if (FRAME_TIME > 1000) {
        var fps = 1000 * FRAMES / FRAME_TIME;
        DOMFps.innerHTML = Math.round(fps) + " FPS";
        FRAME_TIME = FRAMES = 0;
      }

      // camera position
      gl.uniform3fv(shader.uniforms.viewPos, camera.position);
      gl.uniform1f(shader.uniforms.uTime, (Date.now() / 1000.0) - timeStart);

      // mouse acceleration
      mouse.accelerate();
      if (DOMRotate.checked && !mouse.isDown) {
        mouse.THETA += +(DOMRotX.value);
        mouse.PHI += +(DOMRotY.value);
      }
      mat4.identity(worldMatrix);
      mat4.rotate(worldMatrix, worldMatrix, mouse.THETA, [0, 1, 0]);
      mat4.rotate(worldMatrix, worldMatrix, mouse.PHI, [-1, 0, 0]);

      // init and set matrices
      setMatrices();
      gl.drawElements(gl.TRIANGLES, mesh.indicesCount, gl.UNSIGNED_SHORT, 0);
      RAf = requestAnimationFrame(animate);
    }
  }

}
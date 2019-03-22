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


  // CODE EDITOR
  const DOMRun = id('run-shader');
  const DOMError = id('error-msg');

  var editorVertex = ace.edit("vertex-shader-code");
  var editorFragment = ace.edit("fragment-shader-code");
  editorVertex.setTheme("ace/theme/dracula");
  editorFragment.setTheme("ace/theme/dracula");
  editorVertex.getSession().setMode("ace/mode/glsl");
  editorFragment.getSession().setMode("ace/mode/glsl");

  editorVertex.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });
  editorFragment.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });


  const image = loadImage('./assets/wood.jpg', main);
  function main() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    DOMRun.addEventListener('click', compile);

    let program = null;
    // init buffers
    const vertices = new Float32Array([
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ]);

    const textureCoord = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]);
    let VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    VBO.itemSize = 2;
    VBO.numItems = 4;

    let TBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoord, gl.STATIC_DRAW);
    TBO.itemSize = 2;
    TBO.numItems = 4;

    // Init Textures
    const texture = gl.createTexture();
    renderTexture(gl, texture, image);

    function compile() {
      const vShader = editorVertex.getValue();
      const fShader = editorFragment.getValue();

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vShader);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fShader);

      if (vertexShader.error || fragmentShader.error) {
        DOMError.classList.add('show');

        let verr = vertexShader.error || '';
        let ferr = fragmentShader.error || '';
        let error = verr + ferr;
        DOMError.innerText = error;
      } else {
        DOMError.classList.remove('show');
      }

      program = createProgram(gl, vertexShader, fragmentShader);

      program.attribs = {
        aVertexPos: gl.getAttribLocation(program, 'aVertexPos'),
        aTexCoord: gl.getAttribLocation(program, 'aTexCoord')
      }
      program.uniforms = {
        uTime: gl.getUniformLocation(program, 'uTime'),
        mousex: gl.getUniformLocation(program, 'mousex'),
        mousey: gl.getUniformLocation(program, 'mousey'),
      }
      gl.useProgram(program);

      // bind buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
      gl.vertexAttribPointer(program.attribs.aVertexPos, VBO.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, TBO);
      gl.vertexAttribPointer(program.attribs.aTexCoord, TBO.itemSize, gl.FLOAT, false, 0, 0);

      // enable buffer
      gl.enableVertexAttribArray(program.attribs.aVertexPos);
      gl.enableVertexAttribArray(program.attribs.aTexCoord);

      animate();
    }

    compile();
    glcanvas.addEventListener('mousemove', (e) => {
      gl.uniform1f(program.uniforms.mousex, -1.0 + e.offsetX / width * 2.0);
      gl.uniform1f(program.uniforms.mousey, -1.0 + -(e.offsetY - height) / height * 2.0);
    })


    function animate() {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(program.uniforms.uTime, (Date.now() / 1000.0) - t0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, VBO.numItems);

      requestAnimationFrame(animate);
    }
    animate();

  }

}

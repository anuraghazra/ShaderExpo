/**
 * @class Mouse
 * @param {HTMLCanvasElement} canvas
 */
class Mouse {
  constructor(canvas) {
    this.isDown = false;
    this.ACCELERATION = 0.96;
    this.old = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };
    this.THETA = 0;
    this.PHI = 0;

    canvas.addEventListener('mousedown', (e) => {
      this.isDown = true;
      this.old.x = e.pageX;
      this.old.y = e.pageY;
    })
    canvas.addEventListener('mouseup', (e) => {
      this.isDown = false;
      this.old.x = e.pageX;
      this.old.y = e.pageY;
    })
    canvas.addEventListener('mousemove', (e) => {
      if (!this.isDown) return;
      this.pos.x = (e.pageX - this.old.x) * 2 * Math.PI / canvas.width;
      this.pos.y = (e.pageY - this.old.y) * 2 * Math.PI / canvas.height;
      this.THETA += this.pos.x;
      this.PHI += this.pos.y;
      this.old.x = e.pageX;
      this.old.y = e.pageY;
    });
  }

  accelerate() {
    if (!this.isDown) {
      this.pos.x *= this.ACCELERATION;
      this.pos.y *= this.ACCELERATION;
      this.THETA += this.pos.x;
      this.PHI += this.pos.y;
    }
  }
}

function debounce(func, delay) {
  let debounceTimer
  return function () {
    const context = this
    const args = arguments
    clearTimeout(debounceTimer)
    debounceTimer
      = setTimeout(() => func.apply(context, args), delay)
  }
}

function fetchShader(path, callback) {
  fetch(path + '/index.vs.glsl')
    .then(res => res.text())
    .then(vert => {
      fetch(path + '/index.fs.glsl')
        .then(res => res.text())
        .then(frag => {
          callback && callback(vert, frag);
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}
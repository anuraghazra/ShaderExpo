class Camera {
  constructor(position, aspect) {
    this.position = position || [0, 0, -5];
    this.fieldOfView = glMatrix.toRadian(45);
    this.aspect = aspect;
    this.zNear = 0.1;
    this.zFar = 1000.0;
  }

  lookAt(mat) {
    mat4.lookAt(mat, this.position, [0, 0, 0], [0, 1, 0]);
    return this;
  }
  perspective(mat) {
    mat4.perspective(mat, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    return this;
  }
}
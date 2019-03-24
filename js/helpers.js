function showErrors(errors, DOMError) {
  if (errors[0] || errors[1]) {
    DOMError.classList.add('show');

    let verr = errors[0] || '';
    let ferr = errors[1] || '';
    let error = verr + ferr;
    DOMError.innerText = error;

    return error;
  } else {
    DOMError.classList.remove('show');
  }

  return false;
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
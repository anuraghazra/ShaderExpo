// function showErrors(errors, DOMError) {
//   // console.log(errors)
//   if (errors[0] || errors[1]) {
//     DOMError.classList.add('show');

//     let verr = errors[0] && errors[0][0].msg || '';
//     let ferr = errors[1] && errors[1][0].msg || '';
//     let error = verr + ferr;
//     // console.log(error)
//     // '------', '> ' + codeline, '------'
//     DOMError.innerText = error;

//     return error;
//   } else {
//     DOMError.classList.remove('show');
//   }

//   return false;
// }

const debounce = (func, delay) => {
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
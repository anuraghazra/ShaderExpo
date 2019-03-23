function showErrors(vertexShader, fragmentShader, DOMError) {
  if (vertexShader.error || fragmentShader.error) {
    DOMError.classList.add('show');

    let verr = vertexShader.error || '';
    let ferr = fragmentShader.error || '';
    let error = verr + ferr;
    DOMError.innerText = error;
  } else {
    DOMError.classList.remove('show');
  }
}
window.addEventListener('load', initUI);


function initUI() {
  let DOMMenu = id('ui-menu');

  DOMMenu.addEventListener('click', function(e) {
    let target = e.target;
    if (target.tagName === 'BUTTON' && target.className.match('ui-menu__button')) {
      let dropDownContent = e.target.nextElementSibling;
      dropDownContent.classList.toggle('show');
    }
  });
}



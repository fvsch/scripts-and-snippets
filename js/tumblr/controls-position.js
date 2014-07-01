// Changing the position of tumblr controls when the navbar is at the top
// Too lazy to listen for mutation events so a setTimeout will have to do
(function(){
  var tries = 0, max = 5, controls = null, navbar = null, resizeTimeout;
  function test() {
    tries++;
    controls = document.querySelector( '#tumblr_controls' );
    navbar = document.querySelector( 'nav.global' );
    if ( controls !== null && navbar !== null ) change();
    else if ( tries < max ) setTimeout( test, 500 );
  }
  function change() {
    var navPos = window.getComputedStyle(navbar).getPropertyValue('position');
    if ( navPos === 'static' ) {
      controls.style.position = 'static';
      controls.style.display = 'block';
      controls.style.margin = '15px auto';
      controls.style.width = '315px';
    }
    else if ( navPos === 'fixed' ) {
      controls.style.position = 'absolute';
      controls.style.margin = '';
    }
  }
  function resizeThrottler() {
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout( function() {
        resizeTimeout = null;
        actualResizeHandler();
       }, 200);
    }
  }
  function actualResizeHandler() {
    test();
  }
  // Initialize
  setTimeout( test, 500 );
  window.addEventListener( 'resize', resizeThrottler, false );
})();

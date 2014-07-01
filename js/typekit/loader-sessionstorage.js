/**
 * Async JavaScript and/or CSS loader for Typekit.
 * This has NOT been battle-tested, so use with extreme caution!
 *
 * Purpose:
 * 1.  On first page load, load the Typekit script asynchronously so
 *     that it doesn't block rendering. This will most probably result
 *     in a FOUT (flash of unstyled fonts), which we don't try to mitigate.
 * 2.  On all subsequent page loads in the same session, do not load
 *     Typekit's script, but directly generate a link to the stylesheet:
 *     <link rel="stylesheet" href="cached_url_to_typekit_css">
 *     (What's more, this stylesheet should be cached by the browser, so it
 *     won't request it again. Adding the <link> only tells the browser to
 *     apply the stylesheet it cached slightly earlier.)
 *
 * Please note:
 * -   On subsequent page loads, this will NOT add 'wf-loading' / 'wf-active' /
 *     'wf-inactive' classes on the root element, or 'wf-fontname-active' classes.
 *     You CANNOT rely on Typekit's Font Events.
 * -   Using this script might be against Typekit's conditions or individual font
 *     licensing EULAs. I find that this kind of short-lived (session-based) URL
 *     caching is fair game, but if you use this technique on a medium or big
 *     website you might want to double-check!
 * -   If you use this for anything other than a personal website, I urge you to
 *     test the shit out of it. It might be broken, and it may hurt performance.
 *
 * Usage:
 * -   Change key to your kit's 8 character id.
 * -   Include this code in your pages' <head>.
 * -   Don't use in combination to Typekit's own loader (standard or async).
*/

void function typekitInit(d) {
  var kit = 'xxxxxxx'
  var key = 'typekit_url_cache'
  var sel = 'link[href*="use.typekit.net"]'
  function cacheUrl () {
    if ('sessionStorage' in window)
      sessionStorage.setItem(key, d.querySelector(sel).href)
  }
  function makeScript () {
    var js = d.createElement('script')
    js.src = '//use.typekit.net/' + kit + '.js'
    js.onload = function(){ Typekit.load({active: cacheUrl}) }
    d.head.appendChild(js)
  }
  function makeLink () {
    var css = d.createElement('link')
    css.rel = 'stylesheet'
    css.href = sessionStorage.getItem(key)
    css.onerror = makeScript
    d.head.appendChild(css)
  }
  if ('sessionStorage' in window && sessionStorage.getItem(key)) {
    makeLink()
  } else {
    makeScript()
  }
}(document)

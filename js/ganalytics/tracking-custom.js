/**
 * Google Analytics asynchronous setup code
 *
 * Custom version. Use at your own risk. When using, check that it’s working:
 * SCRIPT element added to the HEAD, no warning SCRIPT element added before
 * HEAD. Ideally, check that the data you’re collecting after a short while
 * is sensible.
 * Customizations:
 * - More compact syntax for the _gaq variable.
 * - HTTP only. If you need HTTPS, this won't work for you as is.
 * - Check the current domain against a string to avoid collecting data from
 *   other websites who copied part of your HTML code (it happens…).
 * - Adds SCRIPT element at the end of HEAD element (page must have one…).
 */

var _gaq = _gaq || [['_setAccount', 'UA-XXXXXXX-XX'], ['_trackPageview']];
(function() {
  var ga=document.createElement('script'), h=document.getElementsByTagName('head')[0];
  ga.async=true; ga.src='http://www.google-analytics.com/ga.js';
  if (document.domain=='example.org') h.appendChild(ga);
})();

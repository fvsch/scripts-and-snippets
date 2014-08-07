/*

  SOMEWHAT HACKISH SCRIPT TO DELETE SOME OF YOUR ACTIVITY ON TWITTER
  (OR MOST OF IT IF YOU’RE PATIENT ENOUGH)
  Usage: see delete-old.md

*/

var TWD = {

  // Constants you may want to modify
  DELETE: true,        // Delete your own tweets
  UNDO_RT: true,       // Un-RT everything
  UNDO_FAV: true,      // Un-favorite everything
  KEEP_LATEST: 100,    // Keep at least the latest N tweets
  KEEP_RECENT: 2.5,    // Keep at least tweets from the previous N days

  // Script behavior tweaks (wait times are in milliseconds)
  PROCESS_LIMIT: 500,        // Number of tweets to work on at most. 500 is fine.
  WAIT_BEFORE_NEXT: 200,     // Not sure it's necessary, but a short one works
  WAIT_BEFORE_CONFIRM: 500,  // I’ve seen it work with as low as 200
  WAIT_AFTER_CONFIRM: 2000,  // 2000 works nicely, 1000 not so much

  // Don't touch this unless you know exactly what you're doing
  VISIBLE_TWEETS_SELECTOR: '.original-tweet.js-actionable-tweet',
  TWEET_LINK_SELECTOR: '.tweet-timestamp.js-permalink',
  TWEET_TEXT_SELECTOR: '.tweet-text',
  DELETE_BUTTON_SELECTOR: '.action-del-container a.js-action-del',
  UNDO_RT_BUTTON_SELECTOR: '.action-rt-container a.undo-retweet',
  UNDO_FAV_BUTTON_SELECTOR: '.action-fav-container a.unfavorite',
  DELETE_MODAL_TWEET_SELECTOR: '#delete-tweet-dialog .original-tweet',
  DELETE_MODAL_BUTTON_SELECTOR: '#delete-tweet-dialog .delete-action'

};


// =================  HEY!  =================
// http://www.youtube.com/watch?v=otCpCn0l4Wo
// ==========================================

TWD.makeLogElement = function makeLogElement() {
  // Twitter seems to overwrite console.log, so we build our own
  // quircky logging device.

  // Remove existing log container
  var existing = document.querySelector('#twd-logs');
  if ( existing !== null ) {
    existing.parentNode.removeChild(existing);
  }

  // Create new log container
  var logElement = document.createElement( 'DIV' ),
    logToggle = document.createElement( 'BUTTON' ),
    logStyleElement = document.createElement( 'STYLE' ),
    logStyles = '#twd-logs {position:fixed;z-index:6001;top:0;bottom:0;left:0;width:450px;-moz-box-sizing:border-box;box-sizing:border-box;overflow-y:auto;opacity:.9;background:black;color:white;padding:20px 80px 20px 30px;font:12px/1.6 Verdana,sans-serif;border-right:solid 1px #AAA;transition:left .4s;} #twd-logs.twd-hidden {left:-385px;} #twd-logs button {position:absolute;top:15px;right:15px;border:none;padding:6px 9px;line-height:1;font-size:15px;background:#EEE;color:black;} #twd-logs button::before {content:"❮"} #twd-logs.twd-hidden button::before {content:"❯"} #twd-logs p {margin:.5em 0;} #twd-logs p.important {font-weight:bold;} #twd-logs .twd-link {text-decoration:none;color:inherit;border-bottom:solid 1px #777;} #twd-logs .twd-text {display:inline-block;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:90%;}';

  logStyleElement.textContent = logStyles;
  logElement.setAttribute( 'id', 'twd-logs' );
  logToggle.addEventListener('click', function() {
    logElement.classList.toggle('twd-hidden');
  }, false);

  logElement.appendChild( logToggle );
  document.querySelector('head').appendChild( logStyleElement );
  document.querySelector('body').appendChild( logElement );

  // Function to add log items (as child nodes)
  logElement.log = function( string, klass ) {
    var html = '<p class="' + klass + '">' + string.replace( '\n', '<br>', 'g' ) + '</p>';
    logElement.insertAdjacentHTML( 'afterbegin', html );
  }

  // Return a reference to the log container so that we can
  // call logElement.log()
  return logElement;
}

TWD.nextTweet = function nextTweet() {
  // Examine the "current" tweet and trigger action or skip or end.
  // Specific actions (delete, confirm, etc.) might need to update
  // the currentIndex then call nextTweet() themselves.

  TWD.currentIndex--;

  // End if there are no more tweets to examine
  // It's likely we'll end BEFORE that, if we hit the KEEP_RECENT
  // before we hit the KEEP_LATEST limit
  if ( TWD.currentIndex < TWD.maxIndex ) {
    var message = 'END - no more tweets to process\n' +
      'Reason: we hit the PROCESS_LIMIT or KEEP_LATEST limit\n' +
      'Processed: ' + TWD.processedTweets + ' tweets (' + TWD.skippedTweets + ' skipped)'
    TWD.logs.log( message, 'important' );
    return;
  }

  // Storing info on the current tweet
  var tweet = TWD.currentTweet = {
    'div': TWD.visibleTweets[TWD.currentIndex],
    'type': 'unknown', // RT or original tweet
    'lnk': null, // A element
    'log': '', // HTML text to use in log
    'age': null, // Date object
    'txt': '', // string
    'deleteTries': 0, // Number of times we checked for the confirm dialog
    'deleteBtn': null, // Delete button element
    'undoRtBtn': null, // Undo RT button element
    'undoFavBtn': null // Undo Favorite button element
  }

  // Getting a date to work with
  tweet.lnk = tweet.div.querySelector( TWD.TWEET_LINK_SELECTOR );
  var timestamp = tweet.lnk.firstElementChild.dataset.time;
  var timestamp = (typeof timestamp === 'string') ? timestamp : '';
  tweet.age = /1\d{9}/.test( timestamp ) ? new Date( parseInt( timestamp, 10 ) * 1000 ) : null;

  // Adding some more info
  tweet.txt = tweet.div.querySelector( TWD.TWEET_TEXT_SELECTOR ).textContent;
  tweet.log = '<a class="twd-link" target="_blank" href="' + tweet.lnk.href + '">' +
    tweet.age.toISOString().slice(0,16).replace('T',' ') + '</a>\n' +
    '<span class="twd-text">' + tweet.txt + '</a>';

  // We're just skipping tweets with missing timestamp (for whatever reason)
  if ( tweet.age === null ) {
    var message = '' + (TWD.currentIndex+1) + ' - SKIPPING (no date)';
    TWD.logs.log( message + ' ' + tweet.log );
    TWD.skippedTweets++;
    setTimeout( TWD.nextTweet, TWD.WAIT_BEFORE_NEXT );
    return;
  }

  // Tweet is too recent to process 
  else if ( tweet.age > TWD.maxDate ) {
    // Logging the current tweet
    var message = '' + (TWD.currentIndex+1) + ' - AGE LIMIT REACHED\n' +
      'Limit is: ' + TWD.maxDate.toISOString().slice(0,16).replace('T',' ') + '\n' +
      'Last tweet was:'
    TWD.logs.log( message + ' ' + tweet.log );
    // And finishing here
    var message = 'END - no more tweets to process\n' +
      'Processed: ' + TWD.processedTweets + ' tweets (' + TWD.skippedTweets + ' skipped)';
    TWD.logs.log( message, 'important' );
    return;
  }

  // Finally: tweet is old enough to process
  else if ( tweet.age < TWD.maxDate ) {
    TWD.processCurrentTweet();
  }
}

TWD.processCurrentTweet = function processCurrentTweet() {
  // This is where the action finally happens

  var tweet = TWD.currentTweet;

  function skipTweet() {
    TWD.logs.log( '' + (TWD.currentIndex+1) + ' - SKIPPING: ' + tweet.type );
    TWD.skippedTweets++;
    setTimeout( TWD.nextTweet, TWD.WAIT_BEFORE_NEXT );
  }
  function goToConfirmDelete() {
    tweet.deleteBtn.click();
    setTimeout( TWD.confirmDelete, TWD.WAIT_BEFORE_CONFIRM );
  }
  function undoRt() {
    var message = '' + (TWD.currentIndex+1) + ' - UNDO RT';
    TWD.logs.log( message + ': ' + tweet.log );
    TWD.processedTweets++;
    tweet.undoRtBtn.click();
    setTimeout( TWD.nextTweet, TWD.WAIT_BEFORE_NEXT );
  }
  function undoFavorite() {
    var message = '' + (TWD.currentIndex+1) + ' - UNDO FAVORITE';
    TWD.logs.log( message + ': ' + tweet.log );
    TWD.processedTweets++;
    tweet.undoFavBtn.click();
    setTimeout( TWD.nextTweet, TWD.WAIT_BEFORE_NEXT );
  }

  // Getting the action buttons for this tweet
  tweet.deleteBtn = tweet.div.querySelector( TWD.DELETE_BUTTON_SELECTOR );
  tweet.undoRtBtn = tweet.div.querySelector( TWD.UNDO_RT_BUTTON_SELECTOR );
  tweet.undoFavBtn = tweet.div.querySelector( TWD.UNDO_FAV_BUTTON_SELECTOR );

  // Determine if it’s an original tweet or a retweet or a fav
  // Order matters: a fav+retweet will be considered as a retweet
  tweet.type = tweet.div.classList.contains( 'favorited' ) ? 'favorite' : tweet.type;
  tweet.type = tweet.div.classList.contains( 'retweeted' ) ? 'retweet' : tweet.type;
  tweet.type = tweet.div.classList.contains( 'my-tweet' ) ? 'original' : tweet.type;

  // Skip if type is unknown, or disabled in options
  // Otherwise do the delete/undo thing and go to next step
  if (
  	( tweet.type === 'unknown' ) ||
  	( tweet.type === 'original' && !TWD.DELETE ) ||
  	( tweet.type === 'retweet' && !TWD.UNDO_RT ) ||
  	( tweet.type === 'favorite' && !TWD.UNDO_FAV )
  ) {
    skipTweet();
  }
  else if ( TWD.DELETE && tweet.type === 'original' ) {
    goToConfirmDelete();
  }
  else if ( TWD.UNDO_RT && tweet.type === 'retweet' ) {
    undoRt();
  }
  else if ( TWD.UNDO_FAV && tweet.type === 'favorite' ) {
    undoFavorite();
  }
}

TWD.confirmDelete = function confirmDelete() {
  // We try to confirm the deletion using the confirm dialog
  // If the dialog is nowhere to be found, or if its content
  // doesn't match the tweet we want to delete, we skip the
  // current tweet.

  var tweet = TWD.currentTweet;

  function skipDelete() {
    var message = '' + (TWD.currentIndex+1) + ' - SKIPPING';
    TWD.logs.log( message + ': ' + tweet.log + '\nCouldn’t confirm delete' );
    TWD.skippedTweets++;
    setTimeout( TWD.nextTweet, TWD.WAIT_BEFORE_NEXT );
  }
  function askDelete() {
    var message = '' + (TWD.currentIndex+1) + ' - DELETE';
    TWD.logs.log( message + ': ' + tweet.log );
    confirmBtn.click();
    TWD.processedTweets++;
    setTimeout( TWD.nextTweet, TWD.WAIT_AFTER_CONFIRM );
  }

  // Check the content of the modal box
  var confirmTweet = document.querySelector( TWD.DELETE_MODAL_TWEET_SELECTOR ),
    confirmBtn = document.querySelector( TWD.DELETE_MODAL_BUTTON_SELECTOR );

  if ( confirmTweet === null || confirmTweet.dataset.tweetId !== tweet.div.dataset.tweetId ) {
    skipDelete();
  }
  else {
    askDelete();
  }
}

TWD.start = function start() {

  // Make a log element we can write to with TWD.logs.log()
  TWD.logs = TWD.makeLogElement();

  // Get actual tweets from the page
  TWD.visibleTweets = document.querySelectorAll( TWD.VISIBLE_TWEETS_SELECTOR );
  TWD.processedTweets = 0;
  TWD.skippedTweets = 0;

  // Calculate the "skip tweets after" date
  var cond = ( typeof TWD.KEEP_RECENT === 'number' && TWD.KEEP_RECENT >= 0 );
  TWD.KEEP_RECENT = cond ? TWD.KEEP_RECENT : 0 ;
  // Beware: Date.now() returns milliseconds, and Date() takes milliseconds too
  TWD.maxDate = new Date( Math.round( Date.now() - TWD.KEEP_RECENT * 24 * 60 * 60 * 1000 ) );

  // Better to start from the end (with the limit being 0 or the number of
  // tweets we want to keep). We'll need to decrement currentIndex.
  var cond = ( typeof TWD.KEEP_LATEST === 'number' && TWD.KEEP_LATEST >= 0 );
  TWD.KEEP_LATEST = cond ? TWD.KEEP_LATEST : 0 ;
  var cond = ( typeof TWD.PROCESS_LIMIT === 'number' && TWD.PROCESS_LIMIT > 0 );
  TWD.PROCESS_LIMIT = cond ? TWD.PROCESS_LIMIT : 500 ;  

  TWD.currentIndex = TWD.visibleTweets.length;
  TWD.maxIndex = Math.max( TWD.KEEP_LATEST, TWD.currentIndex - TWD.PROCESS_LIMIT );

  if ( TWD.currentIndex <= TWD.maxIndex ) {
    var message = 'NOTHING TO DO - found ' + TWD.currentIndex + ' tweets\n' +
      'And KEEP_LATEST is set at ' + TWD.KEEP_LATEST + ' tweets';
    TWD.logs.log( message, 'important' );
  }
  else {
    var toProcess = TWD.currentIndex - TWD.maxIndex,
      maxDateString = TWD.maxDate.toISOString().slice(0,16).replace('T',' '),
      message = 'STARTING - ' + TWD.currentIndex + ' found, ' + toProcess + ' to process\n' +
        'Processing tweets from before ' + maxDateString;
    TWD.logs.log( message, 'important' );
    TWD.nextTweet();
  }
}


# facebook/[delete-posts.js](delete-posts.js)

VERY HACKISH SCRIPT TO DELETE MOST OF YOUR ACTIVITY ON FACEBOOK

This scripts tries to delete any post you've posted to FB, including text posts, links and pictures. It also tries to unlike anything you've liked.

Probably very unstable: if Facebook makes a single change to their front-end code for the relevant pages, this stops working.

Don’t use this if you know nothing about JavaScript. Or if you care about your Facebook account. Or if *any other sensible reason*.

BUT this won't fry your computer. That’s a start.

## Localization

Change the LANG variable below to the language you’re using Facebook in. Use [2 letter ISO_639-1 codes](https://en.wikipedia.org/wiki/ISO_639-1).

We have to work with Facebook’s text labels for buttons. If you want this script to work, you may have update the values for OPTION_TEXT with whatever button labels Facebook uses in your language.

## Instructions

1. In a modern web browser (I tested this with Firefox), log in to your Facebook account.

2. Go to `https://www.facebook.com/[USERNAME]/allactivity?privacy_source=activity_log&log_filter=cluster_11` for a list of your own posts and comments on your own posts, or to `https://www.facebook.com/[USERNAME]/allactivity` for a list of all kinds of activity. Note that this script doesn’t work on some activity types, and may not work for deleting your posts and comments from some groups, especially groups you have left, or other places on FB.

3. It might be useful to scroll the page a little bit and let FB lazy-load some more list items.

4. Open your browser's Web Console or JavaScript Console or whatever it’s called.

5. Paste the contents of [delete-posts.js](delete-posts.js) in the Console and execute/evalute (it doesn't do anything on its own).

6. Launch with: `startDeleting()`

7. It’s highly likely that Facebook will only have loaded a fraction of your posts, and you will have to *refresh the page and redo steps 3-6* several times. When refreshing the page, it’s probably best to do a hard refresh, which in most browsers means <kbd>Ctrl+F5</kbd> or <kbd>Cmd+Shift+R</kbd>.

## Tweaking

-  By default we're running up to 3 passes, with up to 300 items. At 2 seconds an item, that's a maximum execution time of 30 minutes (perhaps a bit more if the page/browser is busy). Of course it's unlikely all passes will work on the maximum number of items.

-  Default values for wait times amount to 2 seconds per post. If you want to try it quicker, you could divide all values by 2. But…

-  If you get too many 'SKIPPING - no option found', try to increase POPOVER_WAIT so that the pop-over menu has enough time to appear (it seems it's sometimes lazy-loaded or calculated when called).

-  If you get too many 'SKIPPING - no confirm button found', try to increase DIALOG_WAIT so that the confirm dialog has time to appear.

# twitter/[delete-old-tweets.js](delete-old-tweets.js)

SOMEWHAT HACKISH SCRIPT TO DELETE SOME OF YOUR ACTIVITY ON TWITTER  
(OR MOST OF IT IF YOU’RE PATIENT ENOUGH)

UPDATE: This is an old experiment! You might want to use [Twitter Archive Eraser](http://martani.github.io/Twitter-Archive-Eraser/) which is much more capable and robust.

Use at your very own risk.  
May delete a lot of your tweets and RT (that's the point).

No warranty, yada yada.  
Also: only tested in Firefox 24 and Chrome 28.

## Known limitations and issues

### 3200 tweets limit

You will not be able to delete more than the last 3200 tweets.  
This is a Twitter platform limitation.

### Phantom retweets

I’ve ended up with a bunch of half-retweeted tweets in my timeline, for a minority of the cancelled retweets. No idea why.

## Usage

### Manual

1. Copy [delete-old-tweets.js](delete-old-tweets.js) and change the default values if you want to (see below: Tweaking).
2. Do steps 2-4 above.
3. Use the browser's Web Console or JavaScript Console and paste all of your (possibly modified) script in it. (And run the code obviously.)
4. In the Console, launch the script with: `TWD.start()`

## Tweaking

- The first batch of options should have sensible values, but you may want to change them for different behavior. The `KEEP_LATEST` and `KEEP_RECENT` options will be combined. If a tweet meets any of the two criteria, it will be kept.

- You may want to tweak the waiting times. Generally speaking, higher times mean less skipped tweets.

- The one time setting I found was critical is `WAIT_AFTER_CONFIRM`. After you ask for a tweet's deletion, the twitter.com UI is busy with showing a confirmation message (and possibly getting the information for that message with a HTTP request), and if you process the next tweet too soon you won’t be able to confirm deletion for it.

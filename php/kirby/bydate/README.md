Kirby CMS plugin – bydate
=========================

Kirby plugin that helps working with dated pages, such as blog posts. Provides a `pagesByDate` function for your templates.

## Install

1. Get [bydate.php](plugins/bydate.php) and put it in the `site/plugins` folder of your Kirby-powered site.

2. Optional: [Download or copy example templates](templates/). Some can be included as-is in your templates, but you’ll probably want to copy the relevant examples and customize them in your own templates.

## pagesByDate function

Function which returns an array of Kirby page URIs, or nested arrays when grouping by year or month.

The feature set for this function is:

- *Only* returns URIs for pages with a valid `date` or `Date` metadata field.
- Set limit dates, and by default do not return pages with a future date.
- … Which allows you to set pages to be [published in the future](#future-publishing).
- Return all pages with a date in your site, or limit to a specific folder.
- Exclude pages with a `status` metadata key set to either `draft`, `archive` or `ignore`. Pages with a different `status` or with no `status` metadata will be included.
- Option to group by year or year then month, for instance if you want to ouput titles with years or months before the relevant posts.
- Use `limit` and `offset` options to limit the number of results and perhaps do some semi-manual pagination (sorry, no Kirby pagination object).

### Usage

The `pagesByDate` function may take two arguments:

1. Source (required): A kirby Pages object which represents the set of pages to work with. Use `$pages` for all pages in the site. Or use any Kirby Pages object, such as the ones returned by `$page->children()` and `$page->siblings()`.

2. Options (optional): An array of options. [See below for available options](#option-documentation). You can also set options for this plugin [in your Kirby config files](#set-options-in-config).

If you want to work on all child pages of a given folder, you could use:

```php
$posts = pagesByDate($pages->find('myfolder')->children());
```

If you want to include descendant pages as well, you can use:

```php
$posts = pagesByDate($pages->find('myfolder')->children(), array('recursive', true));
```

Note that we need to use `->children()`, since `$pages->find()` will return a unique page, and we need a set of pages instead.

To set some custom options:

```php
$posts = pagesByDate($pages, array('order'=>'asc', 'recursive'=>false));
```

See the option documentation below for available options.

### How to use in templates

Here's a basic example:

```php
<?php foreach (pagesByDate($pages) as $uri): ?>
<?php $p = $pages->find($uri) ?>
<p>
  <a href="<?php echo $p->url() ?>"><?php echo $p->title() ?></a>
  - <?php echo $p->date('j F Y') ?>
</p>
<?php endforeach; ?>
```

(Make sure you put `bydate.php` in your `plugins` folder first.)

See complete examples:

- [Simple example](templates/bydate-basic.php)
- [Example with custom options](templates/bydate-options.php)
- [Example with results grouped by year](templates/bydate-years.php)
- [Example with results grouped by month](templates/bydate-months.php)

## Highlights

### Future publishing

If you write a post with a date in the future:

    Title: Is HTML5 Ready Yet?
    ----
    Date: 2020-04-01
    ----
    Text: …

With default options, `pagesByDate` will not return this page's URI until the current server date is beyond the page’s date (even if only by a few seconds). One gotcha: if you only specify a date and not the exact publishing time, this defaults to 00:00 in the morning. If you want your post to go live at 8:00 in the morning, you could use `2020-04-01 8:00`.

Warning: the function currently doesn’t manage time zones in any way!

Let’s be clear about posts “going live”: we only mean that any place you used `pagesByDate` with the default `max` setting will not show a page with a date in the future. So the lists of posts, archives, and RSS/Atom feeds in your site all use `pagesByDate`, that makes your content almost invisible. Almost, because you can still see it if you go to the post’s own URL (unless you write some date-based logic of your own in the template that handles showing your posts).

### Group results by year

```php
pagesByDate($pages, array('group'=>'year'));
```

will return an array of page URIs that may look like (pseudocode):

    [
        "2013" => ["blog/some-post", "work/recent-project", "blog/another-one"],
        "2012" => ["work/older-project", "blog/yet-another-post"],
        …
    ]

where each item in the child arrays is a Kirby page URI.

See [Example with results grouped by year](templates/bydate-years.php) for relevant templating code.

### Group results by month

```php
pagesByDate($pages, array('group'=>'month'));
```

will return an array of page URIs that may look like (pseudocode):

    [
        "2013" => [
            "05" => ["blog/some-post", "work/recent-project"],
            "03" => ["blog/another-one"]
        ],
        "2012" => [
            "11" => ["work/older-project"],
            "01" => ["blog/yet-another-post"]
        ],
        …
    ]

where each item in the deepest arrays is a Kirby page URI.

See [Example with results grouped by month](templates/bydate-months.php) for relevant templating code.

## Option documentation

    order:      Sort order: 'asc' (oldest first) or 'desc' (newest first).
                Defaults to 'desc'.
    
    recursive:  Boolean.
                Should we get all *descendant* pages when working from a list
                pages such as $pages->find('somefolder')->children()?
                Defaults to false.

                KNOWN ISSUE when using 'recursive'=>true: if some subfolders use
                the same name, e.g. "source" or "data" or whatever, we end up
                with a FatalError. To avoid this, you could not name folders
                identically, or use names that start with an underscore,
                e.g. "_source", "_data" (these will not be returned in the results).
                Any better solution is welcomed.
    
    limit:      Integer. Max number of posts to return.
                Defaults to 100.
    
    offset:     Integer. Number of posts to skip. Use this and limit for
                manual pagination.
                Defaults to 0.
    
    max:        Integer (timestamp) or string (date).
                Posts from after this date won't be included.
                Defaults to the current timestamp (time()).
    
    min:        Integer (timestamp) or string (date).
                Posts from before this date won't be included.
                Defaults to UNIX epoch time (0 or roughly '1970-01-01').
    
    group:      Should the posts be grouped by year or month?
                When grouped by year, we will return an array of arrays,
                each child array containing the URI strings for a given year,
                with the year as the child array's key (e.g. '2011').
                When grouped by month, we will group by year first, then
                by month, so that means child and grandchild arrays.
                Month arrays have keys looking like '01', '02', …, '12'.
                Use var_dump to look at the resulting array's structure,
                or look at the templating examples.

## Set options in config

We're using the same option keys, prefixed with 'bydate.'

For instance, adding these lines to your `site/config/config.php` would set the same thing as the default values:

```php
c::set('bydate.recursive', false);
c::set('bydate.order', 'desc');
c::set('bydate.limit', 100);
c::set('bydate.offset', 0);
c::set('bydate.max', time());
c::set('bydate.min', 0);
c::set('bydate.group', 'none');
```

Values set in an option array passed to the `pagesByDate` will take precedence over site config.

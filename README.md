# Ignore All But the Last Result

Pretty commonly, when performing asynchronous operations, you might fire off multiple of them, but then only care about
the last result that comes back. A common example is searching:

```js
$(searchEl).on("input", function (ev) {
    doSearch(searchEl.value).then(updateUIWithResults).done();
});
```

But consider this scenario:

1. The user types "do," so you send off an asynchronous search to your server for "do."
2. The user then types "g," so you send off a search for "dog."
3. The results for "dog" come back before the results for "do," so you update your UI with those.
4. But then the results for "do" come back, so you overwrite the UI with results for "do" instead of "dog!"

This isn't what you wanted! Once you sent off the search for "dog," you want to ignore any results from the previous
search for "do."

Well, this package will solve your problems.

## Using Last

This package's main module has as its default export a single function, `last`, which you can use to wrap naïve
functions into smart ones that will ignore all but the last result. It works with any function that returns a
[Promises/A+](http://promisesaplus.com/)-compliant promise. Once you do that, your code can look just as pretty as the
above example, but this time it will actually be correct!

```js
var last = require("last");

var smartSearch = last(doSearch);

$(searchEl).on("input", function (ev) {
    smartSearch(searchEl.value).then(updateUIWithResults).done();
});
```

The wrapped function will return a promise of the same type as that returned by the original. And once you call the
wrapped function again, you will be guaranteed that previously-returned pending promises stay pending forever, so you
don't have to worry about them coming back later than your new promise.

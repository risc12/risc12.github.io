---
{
  "title": "First post",
  "createdAt": "2020-04-12"
}
---

This could be my first blog-post!

Let's take a look at some code:

```js
  const compose = 
    (...fns) => 
      (...args) =>
        fns
          .slice(0, fns.length - 1)
          .reduceRight(
            (result, fn) => fn(result), fns[fns.length - 1]
          );

  class Something { /*.... ....*/ }
```

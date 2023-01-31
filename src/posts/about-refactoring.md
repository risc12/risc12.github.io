---
{
  "title": "About refactoring",
  "createdAt": "2023-01-31",
  "description": "When, how and what to refactor?"
}
---

# About Refactoring

Technically speaking, refactoring is the act of changing the code without altering its behavior. In practice, however, we often refer to any action that makes the code "prettier" or "better" as refactoring. This makes it difficult to determine when and how to refactor.

## Does your feature fit right in?

Sometimes, when you're working on something, you read the ticket and you immediately understand where it should go. Other times, you need to use brute force and duct tape to make your new functionality fit. Often, it's somewhere in between.

My goal is often to get the codebase in a state where my new feature seems to fit in naturally, this is refactoring I most definitely wouldn’t postpone because of the following reasons:

- It is unrewarding work in the moment: If ****only**** I would change this bit, then it would fit right in.
- It is unrewarding work later: It already works fine, I don’t really feel like changing it, I might break something.
- It leaves the codebase in a bit of a messy state for others: Why would anyone force this in here like this!?

Here my advice would be to indeed try and get the codebase in a state where your feature fits right in.

## Is it a vanity refactor?

Sometimes when you want to refactor it isn’t necessarily *bad* code, it’s more that you don’t really like it. I call these vanity refactors, some examples:

```jsx
// If-syntax
function changeCase(toUpperCase, stringToChange) {
  if (toUpperCase) return stringToChange.toUpperCase();

	return stringToChange.toLowerCase();
}

// Ternary syntax
function changeCase(toUpperCase, stringToChange) {
	return toUpperCase ? stringToChange.toUpperCase() : stringToChange.toLowerCase();
}
```

```jsx
// async/await
function async getUser(id) {
	try {
    const response = await fetch(`myApi/users/${id}`);
    
    if (!response.ok) throw new Error('Request Error');

		const user = response.json();

		return user
    
  } catch () {
    throw new Error('Unable to feth user')
  }
}

// Promise
function getUser(id) {
	return fetch(`myApi/users/${id}`)
		.then(response => {
			if (!response.ok) throw new Error('Request Error');
    })
		.then(response => response.json())
    .catch(() => {
	    throw new Error('Unable to feth user')
		})
}
```

In both these cases, both methods do the same thing and they have roughly the same complexity. If this is not code you’re already heavily modifying in your MR I would not refactor this in the current MR.

Instead:

1. What is the pattern in the rest of the code base?
    1. If there is no clear pattern, can the team agree that they want a clear pattern and want to allocate time to that.
2. Is that a pattern we still agree upon, if not, do we see enough incentive to change it?
3. If we want to change it, create a separate MR so changes needed for your functionality are clear in your MR. This is also a place where a ticket could be made to fix it.

## Are you touching the smelly code already?

Do you smell that? That is some smelly code!

Sometimes that smelly code can be smelled from adjacent files and you don’t really need to touch it, in that case I would leave it be, finish my MR and create a new MR that resolves the issue. Or if I really can’t wait, first create an MR for that refactor and then finish my feature. This could also be a place where a ticket could be made to fix it.

If you’re already touching those files then I would include the refactor in my commit to prevent my commit relying on some kind of refactoring MR.

## Why not always create a ticket?

Personally I’m a big fan of cleaning up the codebase as you go, I really like to make the codebase a place that is fun to work and experiment in.

Keep in mind that code in the codebase is read far more often than it is written, so every time you make the code a bit cleaner you make the work of the rest of the team nicer!

Incremental changes also seem to break less or at least less explosively. Incremental changes are also often easier to write tests for.

## How to refactor?

To make your refactor a success, I would try to test the surface area of your refactor and then refactor. This removes a lot of the guesswork out of the process.

If you think the code is a bit smelly but you’re not completely sure what is wrong with it and how to resolve it. It is good to think in terms of code-smells and refactoring-recipes, a great website for that is the [refactor-guru website](https://refactoring.guru/refactoring/catalog).

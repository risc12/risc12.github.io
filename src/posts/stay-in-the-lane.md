---
{
  "title": "Stay in the lane: On levels of abstraction",
  "createdAt": "2020-12-XX",
  "description": "Writing readable code is hard, maintaining a certain level of abstraction within your functions can help."
}
---

Writing readable code is hard, defining readable code is even harder. Tons of books and articles have been written on the subject and there are a great deal of principles that are meant to help with it.

One such principle that stuck with me, is from a talk by Uncle Bob (_unfortunately I'm unable to find the exact talk, but it is also mentioned in his book about clean code_), a section of the talk is about not mixing levels of abstraction. Let's dive into that for a bit.

## What is a level of abstraction?
Because we are not directing what the CPU should do by sending it high and low signals, all programming is done using a certain level of abstraction.

Programming languages come in various levels, at a very low level there is assembly, not a lot of abstractions there. There are a couply of languages that abstract specifics away, Assembly helps us by having user-readably processor-instructions and registers. C helps us by abstracting away processor-architecture specifics, and higher level languages come with abstractions for datastructures, OS-interaction and the DOM. Some languages come with even higher level abstractions like Futures/Promises for future actions or fetch for sending packages over a network.

This is the stuff that we take for granted most of the time, but there are also other abstractions,You build your own abstractions often, we might for example have an object, with a firstname and lastname attribute, we might call this object a 'person'. We might even have a constructor of sorts that is able to check if the firstname and lastname are valid for a person.

This does not mean there are people living in your code, but it does mean that you created something that _represents_ a person in your codebase. This is an abstraction.

Now, there are different levels of abstraction, for example, the date of birth of a person might be expressed using a unix-timestamp, which is an integer, which in turn is just a bunch of zeroes and ones in memory. When we are reasoning about a date of birth in the context of a person, we probably want to use a Date-object, not the underlying integer or the string of zeroes and ones. If we are doing actual date-calculations the integer- or byte- representation might be of more evalue. Choosing how to represent that data is choosing a level of abstraction.

## Keeping a level of abstraction

So on the bottom-level we have the zero's and one's, on a high-level we have an object representing a user. In between there is probably some logic to fetch a user, some logic to display user data, some datastructures like lists or arrays to represent different aspects of a user.

When we try to keep a level of abstraction within a function or class, we try not to assume what the underlying representation is, and try to use data that is roughly abstract in the same way.

## Example one

This is a piece of code that does not keep a level of abstraction:

```js
function getUserFullname() {
  const userId = document.location.href.split('?id=')[1];

  if (!userId) throw new Error('No user')

  const userName = fetch(`http://example.com/api/users/${userId}`)
    .then(res => res.json())
    .then(data => new User(data))
    .then(user => user.name);

  return userName;
}

function render() {
  const nameElement = document.querySelector('h1.username')

  getUserFullname()
    .then(name => nameElement.textContent = name)
    .catch(err => nameElement.textContent = 'Cannot load name');
}

document.addEventlistener('load', render);
```

Why not? Let's try to list the levels of abstraction:

- String operations, splitting and concatenation and checking for a truthy value. Quite low-level.
- Fetching data and updating the DOM.
- Doing requests and handling json, which is a relatively high abstraction, but doesn't really express any domain logic.
- Construction of a user-object, which tells us something about our domain, quite high level.
- Getting a name from this user-object, which is defintely part of the domain, so high level.

## How could this be better?

Let's split up into a few different levels:

- Getting the parameters
- Fetching and constructing the user
- Updating the dom

```js
function fetchUser(id) {
  const apiUrl = `http://example.com/api/users/${id}`;

  return fetch(apiUrl)
    .then(res => res.json())
    .then(data => new User(data));
}

function currentUserId() {
  return document.location.href.split('?id=')[1];
}

function updateContent(content) {
  const element = document.querySelector('h2#username');
  element.textContent = content;
}

function render() {
  fetchUser(currentUserId())
    .then(user => updateContent(user.name))
    .catch(() => updateContent('Cannot load name'));
}

document.addEventlistener('load', render);
```

## Example two

Let's take a look at another example, this one is mixing abstractions in a different way:
```js
function enrollToCourse(student, course) {
  if (course.enrollments.length >= course.maxAmountOfEnrollments) throw new Error("Course is full");

  if (student.outstandingPayments.length > 0) throw new Error("Student is not allowed to enroll");

  const isEligable = course.prerequisites.every(prerequisite => student.achievements.contains(prerequisite));
  if (!isEligable) throw new Error("Student has not achieved all prerequisites");

  course.enrollments.push({ student, course, enrolledAt: new Date() });
}
```

This function does a bunch of things, which is not necesarrily a bad thing. The problem here is that levels of abstraction are not only mixed, but they are actually defined within the function. The function knows too much, not only about the specific implementation-details of the objects it is interacting with, but also about the domain.

It knows:
- That course has a "enrollments"-array and a maxAmountOfEnrollments property.
- That a course can be full.
- That student has a "outstandingPayments"-array.
- That a student is not allowed to enroll when there are too many outstanding payments.
- That both the prerequisites and the achievements are arrays.
- How to construct an object that fits in the enrollments-array.

## How could this be better?
Assuming a functional-environment, so I don't have to bother you with the classes that could make these objects, an example could look like this:
```js
function enrollToCourse(student, course) {
  if (isCourseFull(course)) throw new Error("Course is full");
  if (hasOutStandingPayments(student)) throw new Error("Student is not allowed to enroll");
  if (!isEligable) throw new Error("Student has not achieved all prerequisites")
  
  couse.enrollments.push(new Enrollment(student));
}

function hasOutStandingPayments(student) {
  return student.outstandingPayments.length > 0;
}

function isCourseFull(course) {
  return course.enrollments.length >= course.maxAmountOfEnrollments;
}

function isEligableForCourse(student, course) {
  return course.prerequisites.every(prerequisite => student.achievements.contains(prerequisite))
}

function Enrollment(student) {
  this.student = student;
  this.enrolledAt = new Date();
}
```

### Why does it help?
There are several upsides to the new code, even though the total amount of lines of code is a bit more.

#### Domain Specific Language
The new enrollToCourse-function reads like a set of requirements, if you read it you can intuitively tell that it makes sense. 

#### Easier to test
All the tiny functions are easy to test, then a few mocks or by putting these methods on classes it is trivial to test the overall behavior.

#### Smaller functions are easier to reason about
If there is a mistake in one of the tiny functions they are easy to catch. For example, if the `>=`-operator got switched with an `<=`-operator when checking for room in the course, that would be easier to spot if that is done in a named function.

#### You got some reusability for free!
The smaller functions can be used in other places within your codebase.

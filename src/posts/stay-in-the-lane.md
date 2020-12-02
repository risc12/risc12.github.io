---
{
  "title": "Stay in the lane: On levels of abstraction",
  "createdAt": "2020-12-XX",
  "description": "Writing readable code is hard, maintaining a certain level of abstraction within your functions can help."
}
---

Writing readable code is hard and defining what readable code is, is even harder. Tons of books and articles have been written on the subject and there are a great deal of principles of principles meant to help with it.

One such principle that stuck with me is from a talk from Uncle Bob, _unfortunately I'm unable to find the exact talk_, the section of the talk is about not mixing levels of abstraction. Let's dive into that for a bit.

## What is a level of abstraction?
_This comes later_


## What does mixing levels of abstraction look like?
Let's take a look at this very contrived example:
```js
function enrollToCourse(student, course) {
  if (course.enrollments.length >= course.maxAmountOfEnrollments) throw new Error("Course is full");

  if (student.outstandingPayments.length > 0) throw new Error("Student is not allowed to enroll");

  const isEligable = course.prerequisites.every(prerequisite => student.achievements.contains(prerequisite));
  if (!isEligable) throw new Error("Student has not achieved all prerequisites");

  course.enrollments.push({ student, course, enrolledAt: new Date() });
}
```

This function does a bunch of things, which is not necesarrily a bad thing, the problem is that the function nows too much about the specific implementation-details of the objects it is interacting with.

It knows that:
- Course has a "enrollments"-array and a maxAmountOfEnrollments property.
- Student has a "outstandingPayments"-array.
- Both the prerequisites and the achievements are arrays.
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

## Why does it help?
There are several upsides to the new code, even though the total amount of lines of code is a bit more.

### Domain Specific Language
The new enrollToCourse-function reads like a set of requirements, if you read it you can intuitively tell that it makes sense. 

### Easier to test
All the tiny functions are easy to test, then a few mocks or by putting these methods on classes it is trivial to test the overall behavior.

### Smaller functions are easier to reason about
If there is a mistake in one of the tiny functions they are easy to catch, for example if the ">="-operator got switched with an ">="-operator when checking for a spot in the course that would be easier to see if that is done a in named function.

### You got some reusability for free!
The smaller functions can be used in other places within your codebase.


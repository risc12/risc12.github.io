---
{
  "title": "How to build it?",
  "createdAt": "2020-08-29"
}
---

It's always great to start a new project, a clean slate and exciting opportunities, but did you ever start a project and found out a few sprint down the line that not everybody in the team had the same mental model of the project? Or even worse, that your customer and your team uses different words for the same concepts? I bet you have!

The solution can be a number of things, at YoungCapital we have a discovery-process before kicking of a project (read more about how we work [here](https://www.notion.so/How-we-work-Rituals-Roles-3b57289feb4a435fbb0decbbb1edf4e9)). How that meeting looks differs from project to project, but I'd like to share how one of those discoveries went.

The outcome of the meeting is not a planning, also not a deadline. The outcome of the meeting should be that the team is on the same page, because the page is going the change as iterations happen.



## Where to hold this meeting?

Normally I'd like to facilitate this meeting in the office, with a whole bunch of stickies and a whiteboard with enough markers, but this is 2020 so that won't work. There are quite a few tools that can help you doing this remote but we went with a combination of Google Meet (our standard communications tool) and Google Jamboard.



## Figure out the usecases

*What does this thing do at the end of the first milestone?*

This is not set in stone, but it's a good starting point to start talking.

Draw some boxes with arrows between them, it doesn't need to be a formal UML-diagram at all.

Figure out if everyone on the team agrees that this is indeed what we need to build.

Figure out if there are usecases you didn't think about, or whether there are usecases that can be automated away.



## Figure out the Glossary

*What did the words we just use mean?*

During the first step there will have been a lot of words thrown around that might sound natural to you (*user, admin, record, event, status*), but are these the words that the business uses?

Let everyone throw stickies on a (jam)board, group them, define them while have someone keep track of the definitions of the words. Then store those definitions in a shared document where it can be discussed further (definitions will change later on as the project pivots and evolves, that's is alright).



## Intermezzo

So now we know what to build, and we use the same words as the business, you might decide to split the meeting up from here, or just keep going if you're up for it.



## Moving parts

*Which parts have to move?*

How will we achieve the usecases? What do we need? Keep the terms nice and vague, don't dive into specific implementation-details. Talk about things like *backend-service, persistent storage, front-end client, A talks to B* not about Ruby-on-Rails, PostgreSQL, Vue.js, and JSON API.

If there aren't a lot of moving parts talk about which entities should be represented in your system and how they should interact.

Find the risks and uncertainties.



## Engineering questions

*How to move the parts?*

So now you know what to build, how to call the things and there is a rough outline of the structure. Time to get more concrete, discuss specific technologies and the order of execution. Which things are absolutely necessary and which things will change when iterating.
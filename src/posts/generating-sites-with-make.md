---
{
  "title": "Generating sites with a Makefile",
  "createdAt": "2020-05-04",
  "description": "As a sideproject I wanted to generate a blog using Makefile, this is a step-by-step explanation of the Makefile powering this blog."
}
---

As a sideproject I wanted to generate a blog using a [Makefile](https://www.gnu.org/software/make/manual/make.html).

I can't really recommend it and there are quite some improvements to _make_(no pun intended), but I learned some things regardless!

To see the version of the Makefile that this post is about, you can find it on [GitHub](https://github.com/risc12/risc12.github.io/blob/d393078d210c71d30934ea9bf30b6bf3f047ade5/Makefile).

<aside>If you are playing around with Makefiles, and it isn't working as it should, make sure you use tabs, not spaces. That one might've gotten me once or twice...</aside>

Without further ado, let's see how it works!

### The flow
I want to be able to write Markdown files, add some meta-data to them, and then generate the complete blog. The flow can be desribed as follows:
1. Markdown files are compiled into:
    1. A .html file containing handlebars
    2. A .json-file containing meta-data about the post
2. The meta-data files are combined into one posts.json
3. The handlebars files are compiled with this posts.json
4. The index-file is compiled given this posts.json
5. A dist-folder is prepared (containing the final html- and css-files)

### The top
Let's start at the top, here are some variables that define the files needed for each step:
```makefile
markdown_files := $(shell find src -name '*.md')

compiled_markdown_files := $(patsubst src/%,compiled_markdown/%,$(markdown_files))
compiled_handlebars_files := $(patsubst %.md,%.html,$(patsubst src/%,compiled_handlebars/%,$(markdown_files)))

distributable_files := $(patsubst compiled_handlebars/%,dist/%,$(compiled_handlebar_files))

post_jsons := $(wildcard compiled_handlebars/posts/*.json)
```

The following line tells make to create a variable called `markdown_files`, it will use the shell to execute `find src -name '*.md'` which will return all the paths inside the src-folder that end with `.md`.
```makefile
markdown_files := $(shell find src -name '*.md')
```

The lines following contain a bunch of [`patsubst`](https://www.gnu.org/software/make/manual/make.html#Text-Functions). patsubst substitute parts of a path, here, I basically take the array of markdown files and describe which intermediate files there will be. So the `compiled_markdown_files` live in side the `compiled_markdown`-folder, and the `compiled_handlebars_files` will live inside the `compiled_handlebars`-folder. 

Then the `distributable_files` live in the `dist` folder. Lastly, as part of one of the steps there will be posts.json created (which will get exposed to the handlebars step).

### Defining rules
So, when those variables are out of the way, let's define some rules. Rules are normally in the form of:
```makefile
target … : prerequisites …
    recipe
```

But you can also give the target a name that it will not create, I use those for utility-rules like clean-ups and intallations.

You are able to define wildcards using `%`. The recipe is called for every file in the dependency-list and accessible using the `$<`-variable, the target file is accessible using `$@`.

#### `all:`
This is the first rule, it doesn't create a file called all, but it is the first rule, and whenever `make` get's executed without a rule-name it will execute the first one. The prerequisites is a list of all the steps I want to take:
```makefile
all: clean_all $(compiled_markdown_files) fill_posts_json $(compiled_handlebars_files) compile_index move_styles prepare_dist clean
```

So make knows, in order to sucesfully execute this step, I need all those files, it also knows the rules for those files so it will execute them ony by one.

#### `clean_all:`
Let's take a look at our first recipe!
```makefile
clean_all:
	rm -r compiled_markdown || true
	rm -r data || true
	rm -r compiled_handlebars || true
	rm -r dist || true
```

This rule says it will create the file `clean_all`, it doesn't have any prerequisites, and it will execute the following lines one by one.

Note the `|| true` at the end of each line will make sure that this recipe is succesfull, even when the files don't exists.

The next rule, clean, is the same but doesn't remove the dist-folder.

#### `compiled_markdown/%:`
We encountered a wild wildcard!
```makefile
compiled_markdown/%: src/%
	mkdir -p $(dir $@)
	showdown makehtml --input $< --output $(patsubst %.md,%.html,$@) --metadata
	sed -n "/^---/,/^---/ { /^---/d ; /^---/d ; /^$$/d ; p;}" $< > $(patsubst %.md,%.json,$@)
```

This rule will create the files inside of `compiled_markdown`, it needs the files inside `src/` to do it and it will run the recipe for all files inside of `src`.


Let's go over the lines inside the recipe one by one:
```makefile
	mkdir -p $(dir $@)
```

This will create a folder for the directory that the target file is in, so for example for the file `src/posts/first-post.md` it will create `compiled_markdown/posts/`.
```makefile
	showdown makehtml --input $< --output $(patsubst %.md,%.html,$@) --metadata
```

This will create the actual html files from markdown, the `--metadata`-flag will make sure the metadata gets removed from the output.

At last, we take the metadata and put it in a JSON file:
```makefile
	sed -n "/^---/,/^---/ { /^---/d ; /^---/d ; /^$$/d ; p;}" $< > $(patsubst %.md,%.json,$@)
```

### `fill_posts_json:`
To create a json-file that we can feed into handlebars we create the data-folder, create a posts.json inside there.

Then for every post.json file we append its contents into a posts.protojson file, finally we sort that file by cretedAt, make sure it is a proper array and output it into data/posts.json.

### `compiled_handlebars/%: compiled_markdown/%`
So we compiled the markdown into html, now it is time to take the json file, and compile the handlebars template.

The sed command:
```makefile
	sed -e "/[[post]]/{r $<" -e "d" -e "}" 'src/layouts/posts.html' > $@
```

Will first replace the magic string [[post]] in the layout with the contents of the post. Now we have that all figured out I use `hbs` to compile the template:

```makefile
	hbs --data $(patsubst %.html,%.json,$<) --data 'src/data/*.json' --data 'data/posts.json' $@ --output $(dir $@)
```
Finally, to make the urls a bit prettier, I create a a folder with the name of the post, and rename the `<post-name>.html` to `index.html`.

### `compile_index:` 
This rule takes the `src/index.html` and renders it with the `data/posts.json`.

### `prepare_dist:`
Almost there, this step is just there to copy some files around, namely the compiled handlebars and json-files.

### `clean`
Lastly, we remove the intermediate folders.

### Conclusion
As you can see, this works (you're looking at the result right now). My main goal was to make something that worked ony any old Unix-like system, but unfortunately I still rely on NPM for `showdown` and `hbs-cli`, so I didn't manage that. I still like this though, it is something custom, quite simple, pretty fast, and doesn't rely on major frameworks.

Feel free you check my setup on the [`release`-branch](https://github.com/risc12/risc12.github.io/tree/release)

I might dive into the setup of the GitHub Action that make sure this deploys in a later post.

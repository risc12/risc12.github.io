markdown_files := $(shell find src -name '*.md')

compiled_markdown_files := $(patsubst src/%,compiled_markdown/%,$(markdown_files))
compiled_handlebars_files := $(patsubst %.md,%.html,$(patsubst src/%,compiled_handlebars/%,$(markdown_files)))

distributable_files := $(patsubst compiled_handlebars/%,dist/%,$(compiled_handlebar_files))

post_jsons := $(wildcard compiled_handlebars/posts/*.json)

all: clean_all $(compiled_markdown_files) fill_posts_json $(compiled_handlebars_files) compile_index move_styles prepare_dist clean

clean_all:
	-rm -r compiled_markdown
	-rm -r data
	-rm -r compiled_handlebars
	-rm -r dist

clean:
	-rm -r compiled_markdown
	-rm -r data
	-rm -r compiled_handlebars

compiled_markdown/%: src/%
	mkdir -p $(dir $@)
	# Use showdown to turn markdown into html, the output-file is the input-file but with html instead of md
	showdown makehtml --input $< --output $(patsubst %.md,%.html,$@) --metadata
	sed -n "/^---/,/^---/ { /^---/d ; /^---/d ; /^$$/d ; p;}" $< > $(patsubst %.md,%.json,$@)

fill_posts_json:
	mkdir -p data/
	touch data/posts.json
	# For every <post>.json file we get the title and use the filename as slug
	# It is saved into posts.protojson because we don't want to be bothered with comma's
	cd compiled_markdown/posts; \
	for f in *.json; \
		do echo "{ \"slug\": \"/posts/$$(echo $${f%.*})\", \"title\": $$(cat $$f | jq .title), \"createdAt\": $$(cat $$f | jq .createdAt) }" >> ../posts.protojson; \
	done; \
	cd ../..;
	# jq takes that protojson and formats it properly
	echo "{ \"posts\": $$(cat compiled_markdown/posts.protojson | jq --slurp) }" > data/posts.json

compiled_handlebars/%: compiled_markdown/%
	mkdir -p $(dir $@)
	# Replace instance of [[post]] in the posts-template with the contents of the post.html
	sed -e "/[[post]]/{r $<" -e "d" -e "}" 'src/layouts/posts.html' > $@
	# Render the handlebars, give it the metadata
	# TODO: Expose partials and helpers 
	hbs --data $(patsubst %.html,%.json,$<) --data 'src/data/*.json' --data 'data/posts.json' $@ --output $(dir $@)
	mkdir $(patsubst %.html,%,$@)
	mv $@ $(patsubst %.html,%/index.html,$@)

compile_index:
	# Render the handlebars of the index, give it the metadata
	# TODO: Expose partials and helpers 
	hbs --data 'src/data/*.json' --data 'data/posts.json' src/index.html --output compiled_handlebars/

prepare_dist:
	# A clean procedure to move the built files to the dist folder.
	mkdir -p dist/posts
	cp -r compiled_handlebars/posts/* dist/posts/
	cp compiled_handlebars/index.html dist/index.html
	cp data/posts.json dist/index.json

install:
	npm install showdown -g
	npm install hbs-cli -g

move_styles:
	mkdir -p dist/assets
	cp -r src/assets dist/
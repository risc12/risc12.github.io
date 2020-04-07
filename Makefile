markdown_files := $(shell find src -name '*.md')

compiled_markdown_files := $(patsubst src/%,compiled_markdown/%,$(markdown_files))
compiled_handlebars_files := $(patsubst %.md,%.html,$(patsubst src/%,compiled_handlebars/%,$(markdown_files)))

distributable_files := $(patsubst compiled_handlebars/%,dist/%,$(compiled_handlebar_files))

article_jsons := $(wildcard compiled_handlebars/articles/*.json)

all: clean_all $(compiled_markdown_files) fill_articles_json $(compiled_handlebars_files) compile_index prepare_dist clean

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

fill_articles_json:
	mkdir -p data/
	touch data/articles.json
	# For every <article>.json file we get the title and use the filename as slug
	# It is saved into articles.protojson because we don't want to be bothered with comma's
	cd compiled_markdown/articles; \
	for f in *.json; \
		do echo "{ \"slug\": \"$$(echo $${f%.*})\", \"title\": $$(cat $$f | jq .title) }" >> ../articles.protojson; \
	done; \
	cd ../..;
	# jq takes that protojson and formats it properly
	echo "{ \"articles\": $$(cat compiled_markdown/articles.protojson | jq --slurp) }" > data/articles.json

compiled_handlebars/%: compiled_markdown/%
	mkdir -p $(dir $@)
	# Replace instance of [[article]] in the articles-template with the contents of the article.html
	sed -e "/[[article]]/{r $<" -e "d" -e "}" 'src/layouts/articles.html' > $@
	# Render the handlebars, give it the metadata
	# TODO: Expose partials and helpers 
	hbs --data $(patsubst %.html,%.json,$<) --data 'src/data/*.json' --data 'data/articles.json' $@ --output $(dir $@)

compile_index:
	# Render the handlebars of the index, give it the metadata
	# TODO: Expose partials and helpers 
	hbs --data 'src/data/*.json' --data 'data/articles.json' src/index.html --output compiled_handlebars/

prepare_dist:
	# A clean procedure to move the built files to the dist folder.
	mkdir -p dist/articles
	cp compiled_handlebars/articles/*.html dist/articles/
	cp compiled_handlebars/index.html dist/index.html
	# TODO: Copy assets

install:
	npm install showdown -g
	npm install hbs-cli -g

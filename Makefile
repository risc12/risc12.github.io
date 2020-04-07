
markdown_files := $(shell find src -name '*.md')
compiled_files := $(patsubst src/%,compiled/%,$(markdown_files))

all: $(compiled_files)

compiled/%: src/%
	mkdir -p $(dir $@)
	showdown makehtml --input $< --output $(patsubst %.md,%.html,$@)

install:
	npm install showdown -g

clean:
	rm -r compiled
	rm -r dist


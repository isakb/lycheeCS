.PHONY: deps build clean watch

build:
	@mkdir -p lib/platform/html || true
	@cp src/package.json lib/
	@cp src/platform/html/bootstrap.progress.css lib/platform/html/
	@node_modules/.bin/coffee -c -o lib src

deps:
	@npm install

clean:
	@rm -rf ./lib/

watch:
	@node_modules/.bin/coffee -wc -o lib src

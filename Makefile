.PHONY: build clean

build:
	@mkdir -p lib/platform/html || true
	@cp src/package.json lib/
	@cp src/platform/html/bootstrap.progress.css lib/platform/html/
	@coffee -c -o lib src

clean:
	@rm -rf ./lib/

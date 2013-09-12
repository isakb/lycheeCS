COFFEE := node_modules/.bin/coffee
COFFEE_SOURCES := $(shell find src/ -name '*.coffee')
COFFEE_OBJECTS := $(addprefix lib/,$(subst src/,,$(COFFEE_SOURCES:%.coffee=%.js)))

.PHONY: all deps prepare build clean

all: deps prepare build

deps:
	@npm install

prepare:
	@mkdir -p lib/platform/html || true
	@mkdir -p lib/physics lib/game lib/ui || true
	@cp src/package.json lib/
	@cp src/platform/html/bootstrap.progress.css lib/platform/html/
	#@node_modules/.bin/coffee -c -o lib src

build: $(COFFEE_OBJECTS)

clean:
	@rm -rf ./lib/

lib/%.js: src/%.coffee
	$(COFFEE) -j -i $< -o $@

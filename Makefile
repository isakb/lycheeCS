COFFEE := node_modules/.bin/coffee
COFFEE_ARGS := --contracts
COFFEE_SOURCES := $(shell find src/ -name '*.coffee')
COFFEE_OBJECTS := $(subst src/,lib/,$(COFFEE_SOURCES:%.coffee=%.js))

.PHONY: all deps prepare build clean

all: deps prepare build

deps:
	@npm install

prepare:
	@mkdir -p lib/platform/html || true
	@mkdir -p lib/physics lib/game lib/ui || true
	@cp src/package.json lib/
	@cp src/platform/html/bootstrap.progress.css lib/platform/html/

build: $(COFFEE_OBJECTS)

clean:
	@rm -rf ./lib/

lib/%.js: src/%.coffee
	$(COFFEE) $(COFFEE_ARGS) -c $< > $@

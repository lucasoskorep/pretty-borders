NAME=prettyborders
DOMAIN=lucaso.io

.PHONY: all pack install clean

all: dist/extension.js

node_modules: package.json
	pnpm install

dist/extension.js dist/prefs.js: node_modules
	tsc

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas

#
$(NAME).zip: dist/extension.js dist/prefs.js schemas/gschemas.compiled
	@cp -r schemas dist/
	@cp metadata.json dist/
	@cp stylesheet.css dist/
	@(cd dist && zip ../$(NAME).zip -9r .)


pack: $(NAME).zip

install: $(NAME).zip
	@mkdir -p ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@rm -rf /.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)/*
	@cp dist/* ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)/

clean:
	@rm -rf dist node_modules $(NAME).zip

test:
	@dbus-run-session -- gnome-shell --nested --wayland

install-and-test: install test

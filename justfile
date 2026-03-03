set dotenv-load
NAME:="prettyborders"
DOMAIN:="lucaso.io"

packages:
	pnpm install

build: packages
    rm -rf dist/*
    pnpm run build
    glib-compile-schemas schemas
    cp metadata.json dist/
    cp stylesheet.css dist/
    mkdir dist/schemas
    cp schemas/*.compiled dist/schemas/


build-package: build
	cd dist && zip ../{{NAME}}.zip -9r .


install: build
	mkdir -p ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}
	rm -rf ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}/*
	cp -r dist/* ~/.local/share/gnome-shell/extensions/{{NAME}}@{{DOMAIN}}/

run:
    env MUTTER_DEBUG_DUMMY_MODE_SPECS=1280x720 dbus-run-session -- gnome-shell --devkit --wayland

install-and-run: install run

lint:
    pnpm run lint

clean:
    pnpm run clean
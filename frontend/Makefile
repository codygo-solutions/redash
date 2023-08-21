frontend-unit-tests:
	CYPRESS_INSTALL_BINARY=0 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 yarn --frozen-lockfile
	yarn test

test: frontend-unit-tests

build:
	yarn build

watch:
	yarn watch

start:
	yarn start
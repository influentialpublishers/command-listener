NODE_BIN=./node_modules/.bin


install:
	yarn


test: install
	${NODE_BIN}/ava


watch: install
	${NODE_BIN}/ava --watch


.PHONY: test

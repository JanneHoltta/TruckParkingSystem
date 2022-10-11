all: run

DIR := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))

# Tag Docker image :latest if this is a tagged commit (release)
LATEST_TAG := $(shell [ -z "${CI_COMMIT_TAG}" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

# Tag Docker image :latest if branch is master
#LATEST_TAG := $(shell [ "${CI_COMMIT_BRANCH}" != "master" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

build:
	docker build -t "$(notdir $(DIR:/=))" --build-arg NPM_REPO="$(shell sed -z 's/\n/\\n/g' ~/.npmrc)" .

run: build
	docker run -it --rm --init -p 3000:3000 "$(notdir $(DIR:/=))" || true

common-ci:
	docker login "${CI_REGISTRY}" -u "${CI_REGISTRY_USER}" -p "${CI_REGISTRY_PASSWORD}"
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --use
	docker buildx inspect --bootstrap

build-ci: common-ci
	docker buildx build \
		--build-arg NPM_REPO="${NPM_REPO}" \
		--platform linux/amd64 \
		--pull \
		-t "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}" ${LATEST_TAG} \
		.

build-push-ci: common-ci
	docker buildx build \
		--build-arg NPM_REPO="${NPM_REPO}" \
		--platform linux/amd64 \
		--pull \
		-t "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}" ${LATEST_TAG} \
		--push \
		.

.PHONY: build run common-ci build-ci build-push-ci

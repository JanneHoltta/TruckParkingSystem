all: build

DIR := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))

# Tag Docker image :latest if this is a tagged commit (release)
LATEST_TAG := $(shell [ -z "${CI_COMMIT_TAG}" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

# Tag Docker image :latest if branch is master
#LATEST_TAG := $(shell [ "${CI_COMMIT_BRANCH}" != "master" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

# Specifies which version of the app to build
APP ?= rekkaparkki

# Specifies the name for the Docker image, including the repo URL. GitLab requires repeating
# the project name in the URL, see: https://docs.gitlab.com/ee/user/packages/container_registry/
IMAGE_NAME := ${CI_REGISTRY_IMAGE}/${CI_PROJECT_NAME}-${APP}

build:
	docker build -t "$(notdir $(DIR:/=))" \
		--build-arg NPM_REPO="$(shell sed -z 's/\n/\\n/g' ~/.npmrc)" \
		--build-arg APP="${APP}" \
		.

common-ci:
	docker login "${CI_REGISTRY}" -u "${CI_REGISTRY_USER}" -p "${CI_REGISTRY_PASSWORD}"
#	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --use
	docker buildx inspect --bootstrap

build-ci: common-ci
	docker buildx build \
		--build-arg NPM_REPO="${NPM_REPO}" \
		--build-arg APP="${APP}" \
		--platform linux/amd64 \
		--pull \
		-t "${IMAGE_NAME}:${CI_COMMIT_REF_SLUG}" ${LATEST_TAG} \
		.

build-push-ci: common-ci
	docker buildx build \
		--build-arg NPM_REPO="${NPM_REPO}" \
		--build-arg APP="${APP}" \
		--platform linux/amd64 \
		--pull \
		-t "${IMAGE_NAME}:${CI_COMMIT_REF_SLUG}" ${LATEST_TAG} \
		--push \
		.

.PHONY: build common-ci build-ci build-push-ci

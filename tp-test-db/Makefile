all: build-push-ci

# Tag Docker image :latest if this is a tagged commit (release)
LATEST_TAG := $(shell [ -z "${CI_COMMIT_TAG}" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

# Tag Docker image :latest if branch is master
#LATEST_TAG := $(shell [ "${CI_COMMIT_BRANCH}" != "master" ] && echo "" || echo "-t ${CI_REGISTRY_IMAGE}:latest")

common-ci:
	docker login "${CI_REGISTRY}" -u "${CI_REGISTRY_USER}" -p "${CI_REGISTRY_PASSWORD}"
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker buildx create --use
	docker buildx inspect --bootstrap

build-push-ci: common-ci
	docker buildx build \
		--platform linux/amd64 \
		--pull \
		-t "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}" ${LATEST_TAG} \
		--push \
		.

.PHONY: common-ci build-push-ci

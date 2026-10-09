# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# [3.1.0](https://github.com/vorg/geom-merge/compare/v3.0.0...v3.1.0) (2026-10-09)

### Features

* set the type of the attribute from the first geometry if attribute is a mix of Array and TypedArray ([8f9fb94](https://github.com/vorg/geom-merge/commit/8f9fb949edb4e727d56f94a601c61552d2c46a52)), closes [vorg/geom-merge#6](https://github.com/vorg/geom-merge/issues/6)
* support merging the same geometry ([f84bf6a](https://github.com/vorg/geom-merge/commit/f84bf6a221b7e686cf6f56a4624f8246e145798f))

### Performance Improvements

* preallocate merged attributes instead of concatenating per geometry ([32b0ac1](https://github.com/vorg/geom-merge/commit/32b0ac11a7ee0341d9ecb8dd93240a20ca1ec5b5)), closes [TypedArray#set](https://github.com/TypedArray/issues/set) [Array#flat](https://github.com/Array/issues/flat)

# [3.0.0](https://github.com/vorg/geom-merge/compare/v2.0.0...v3.0.0) (2024-03-21)


### Features

* add support for mixed geometries ([d15eab8](https://github.com/vorg/geom-merge/commit/d15eab8f14faaa687bca24b549a3233354330204)), closes [#3](https://github.com/vorg/geom-merge/issues/3) [#4](https://github.com/vorg/geom-merge/issues/4)


### BREAKING CHANGES

* returned geometries attributes are flattened

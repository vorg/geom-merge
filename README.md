# geom-merge

Merge a list of geometries (simplicial complex) into one geometry and concat all other attributes.

![](screenshot.jpg)

## Installation

```bash
npm install geom-merge
```

## Usage

```js
import geomMerge from "geom-merge";

var merge = require("geom-merge");
var cube = require("primitive-cube")();
var sphere = require("primitive-sphere")();

var g = merge([cube, sphere]);
```

## API

#### `merge(geometries): geometry`

**Parameters**

- geometries: `Array<geometry>` – array of geometry objects

**Returns**

geometry: `{ positions: TypedArray|Array, cells: TypedArray|Array, ...otherAttributesMerged: TypedArray|Array }` - new geometry with merged attributes and cells from provided geometries.

_Note 1: Each geometry object requires at least `positions` and `cells`. Other properties like `uvs` or `normals` will be merged as well if available in all geometries._
_Note 2: This module doesn't perform CSG operations_

## License

MIT. See [license file](https://github.com/vorg/geom-merge/blob/master/LICENSE.md).

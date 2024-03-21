# geom-merge

Merge a list of geometries (simplicial complex) into one geometry and concat all other attributes.

![](screenshot.jpg)

## Installation

```bash
npm install geom-merge
```

## Usage

```js
import merge from "geom-merge";
import { cube, sphere } from "primitive-geometry";

const geometry = merge([cube(), sphere()]);
```

## API

#### `merge(geometries): geometry`

**Parameters**

- geometries: `Array<geometry>` – array of geometry objects

**Returns**

geometry: `{ positions: TypedArray | Array | Array<[x, y, z]>, cells: TypedArray | Array | Array<[a, b, c]>, ...otherAttributesMergedAndFlattened: TypedArray | Array }` - new geometry with cells, and merged/flattened attributes.

_Note 1: Each geometry object requires at least `positions` and `cells`. Other array-like properties like `uvs` or `normals` will be merged and flattened, if available in all geometries. Cells will be chunked if any of the geometries has chunked cells._

_Note 2: This module doesn't perform CSG operations_

## License

MIT. See [license file](https://github.com/vorg/geom-merge/blob/master/LICENSE.md).

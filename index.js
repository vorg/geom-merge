import typedArrayConcat from "typed-array-concat";
import typedArrayConstructor from "typed-array-constructor";

function merge(geometries) {
  const isTypedArray = !Array.isArray(geometries[0].positions);

  const CellsConstructor = isTypedArray
    ? typedArrayConstructor(
        geometries.reduce(
          (sum, geometry) =>
            sum + geometry.positions.length / (isTypedArray ? 3 : 1),
          0
        )
      )
    : Array;

  const mergedGeometry = { cells: new CellsConstructor() };

  let vertexOffset = 0;

  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];

    const vertexCount = geometry.positions.length / (isTypedArray ? 3 : 1);

    for (let attribute of Object.keys(geometry)) {
      if (attribute === "cells") {
        mergedGeometry.cells = isTypedArray
          ? typedArrayConcat(
              CellsConstructor,
              mergedGeometry.cells,
              // Add previous geometry vertex offset mapped via a new typed array
              // because new value could be larger than what current type supports
              new (typedArrayConstructor(vertexOffset + vertexCount))(
                geometry.cells
              ).map((n) => vertexOffset + n)
            )
          : mergedGeometry.cells.concat(
              geometry.cells.map((cell) => cell.map((n) => vertexOffset + n))
            );
      } else {
        const isAttributeTypedArray = !Array.isArray(geometry[attribute]);

        mergedGeometry[attribute] ||= isAttributeTypedArray
          ? new geometry[attribute].constructor()
          : [];

        mergedGeometry[attribute] = isAttributeTypedArray
          ? typedArrayConcat(
              mergedGeometry[attribute].constructor,
              mergedGeometry[attribute],
              geometry[attribute]
            )
          : mergedGeometry[attribute].concat(geometry[attribute]);
      }
    }

    vertexOffset += vertexCount;
  }

  return mergedGeometry;
}

export default merge;

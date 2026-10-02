import typedArrayConstructor from "typed-array-constructor";

const isAttributeFlat = (attribute) => !attribute[0]?.length;

const isAttributeTypedArray = (attribute) => !Array.isArray(attribute);

const isAttributeArrayLike = (attribute) =>
  Array.isArray(attribute) || ArrayBuffer.isView(attribute);

const getGeometryAttributes = (geometry) =>
  Object.keys(geometry).filter((attribute) =>
    isAttributeArrayLike(geometry[attribute]),
  );

const getFlatLength = (attribute) => {
  if (isAttributeFlat(attribute)) return attribute.length;

  let length = 0;
  for (let i = 0; i < attribute.length; i++) length += attribute[i].length;
  return length;
};

const writeFlat = (target, source, offset) => {
  if (isAttributeFlat(source)) {
    for (let i = 0; i < source.length; i++) target[offset++] = source[i];
  } else {
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      for (let j = 0; j < item.length; j++) target[offset++] = item[j];
    }
  }
  return offset;
};

const writeChunked = (target, source, offset, stride, increment) => {
  let chunk = [];
  for (let i = 0; i < source.length; i++) {
    chunk.push(source[i] + increment);
    if (i % stride === stride - 1) {
      target[offset++] = chunk;
      chunk = [];
    }
  }
  if (chunk.length) {
    console.warn(
      `Array length (${source.length}) is not a multiple of stride "${stride}".`,
    );
    target[offset++] = chunk;
  }
  return offset;
};

const preallocateAndFill = (Constructor, geometries, getLength, write) => {
  let length = 0;
  for (let i = 0; i < geometries.length; i++) {
    length += getLength(geometries[i], i);
  }

  const merged = new Constructor(length);

  let offset = 0;
  for (let i = 0; i < geometries.length; i++) {
    offset = write(merged, geometries[i], offset, i);
  }

  return merged;
};

const mergeCells = (geometries, CellsConstructor, meta, areAllCellsFlatArray) =>
  preallocateAndFill(
    CellsConstructor,
    geometries,
    // Flat cells get chunked if any geometry has chunked cells
    ({ cells }, i) =>
      !areAllCellsFlatArray && meta[i].isCellsFlatArray
        ? Math.ceil(cells.length / 3)
        : cells.length,
    (target, { cells }, offset, i) => {
      const { vertexOffset, isCellsFlatArray } = meta[i];

      if (areAllCellsFlatArray) {
        // CellsConstructor is sized from the merged position count so offset indices fit
        for (let j = 0; j < cells.length; j++) {
          target[offset++] = cells[j] + vertexOffset;
        }
      } else if (isCellsFlatArray) {
        offset = writeChunked(target, cells, offset, 3, vertexOffset);
      } else {
        for (let j = 0; j < cells.length; j++) {
          target[offset++] = cells[j].map((n) => vertexOffset + n);
        }
      }
      return offset;
    },
  );

const mergeAttribute = (geometries, AttributeConstructor, attribute) =>
  preallocateAndFill(
    AttributeConstructor,
    geometries,
    (geometry) => getFlatLength(geometry[attribute]),
    (target, geometry, offset) => {
      const values = geometry[attribute];

      if (isAttributeTypedArray(target) && isAttributeFlat(values)) {
        target.set(values, offset);
        return offset + values.length;
      }
      return writeFlat(target, values, offset);
    },
  );

function merge(geometries) {
  let mergedPositionCount = 0;
  let areAllCellsFlatArray = true;
  let areAllCellsTypedArray = true;
  const meta = Array.from({ length: geometries.length });

  // Set mergeable attributes from first geometry
  const initialAttributes = getGeometryAttributes(geometries[0]);
  let mergeableAttributes = [...initialAttributes];

  // Collect cells type, position count and filter mergeable attributes
  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];

    if (i > 0) {
      const attributes = getGeometryAttributes(geometry);

      // Check if geometry has all the first geometry attributes
      for (let j = 0; j < initialAttributes.length; j++) {
        const initialAttribute = initialAttributes[j];

        if (!attributes.includes(initialAttribute)) {
          console.warn(
            `geom-merge: geometry "${geometry.name || i}" is missing attribute ${initialAttribute}.`,
          );

          // Remove the attribute from the list of mergeable attributes
          mergeableAttributes = mergeableAttributes.filter(
            (attribute) => attribute !== initialAttribute,
          );
        }
      }

      // Check if geometry has all the previous geometry attributes
      const extraAttributes = attributes.filter(
        (attribute) => !mergeableAttributes.includes(attribute),
      );
      if (extraAttributes.length) {
        console.warn(
          `geom-merge: geometry "${geometry.name || i}" has extra attributes: ${extraAttributes.join(", ")}.`,
        );
      }
    }

    const positionCount =
      geometry.positions.length / (isAttributeFlat(geometry.positions) ? 3 : 1);

    const isCellsFlatArray = isAttributeFlat(geometry.cells);

    // Store attribute properties reused when merging cells
    meta[i] = { vertexOffset: mergedPositionCount, isCellsFlatArray };

    // Increment/update properties used to determine cells type
    mergedPositionCount += positionCount;
    areAllCellsFlatArray &&= isCellsFlatArray;
    areAllCellsTypedArray &&= isAttributeTypedArray(geometry.cells);
  }

  // Check if first geometry has extra attributes
  const extraAttributes = initialAttributes.filter(
    (initialAttribute) => !mergeableAttributes.includes(initialAttribute),
  );
  if (extraAttributes.length) {
    console.warn(
      `geom-merge: geometry "${geometries[0].name || "0"}" has extra attributes: ${extraAttributes.join(", ")}.`,
    );
  }

  const CellsConstructor = areAllCellsTypedArray
    ? typedArrayConstructor(mergedPositionCount)
    : Array;

  const mergedGeometry = {};

  for (let i = 0; i < mergeableAttributes.length; i++) {
    const attribute = mergeableAttributes[i];

    mergedGeometry[attribute] =
      attribute === "cells"
        ? mergeCells(geometries, CellsConstructor, meta, areAllCellsFlatArray)
        : mergeAttribute(
            geometries,
            geometries[0][attribute].constructor,
            attribute,
          );
  }

  return mergedGeometry;
}

export default merge;

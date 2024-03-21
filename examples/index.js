import merge from "../index.js";

import createContext from "pex-context";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import { cube, sphere } from "primitive-geometry";
import oldCube from "primitive-cube";
import oldSphere from "primitive-sphere";

const ctx = createContext({
  element: document.querySelector("main"),
  pixelRatio: devicePixelRatio,
});
const camera = createCamera({
  fov: Math.PI / 3,
  aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight,
  near: 0.1,
  far: 100,
  position: [3, 3, -3],
});
const orbiter = createOrbiter({ camera });

const propertiesArrayFrom = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value !== "string" ? Array.from(value) : value,
    ]),
  );

// Geometries
const sphereGeometry = sphere();
sphereGeometry.name = `sphereGeometry`;
const cubeGeometry = cube({ sx: 2, sy: 0.5, sz: 0.5 });
cubeGeometry.name = `cubeGeometry`;
const oldSphereGeometry = oldSphere(0.5);
oldSphereGeometry.name = `oldSphereGeometry`;
const oldCubeGeometry = oldCube(2, 0.5, 0.5);
oldCubeGeometry.name = `oldCubeGeometry`;

sphereGeometry.sphereExtra = [];
cubeGeometry.cubeExtra = [];
oldSphereGeometry.oldSphereExtra = [];
oldCubeGeometry.oldCubeExtra = [];

let geometry;
// Single geometry
geometry = merge([{ ...sphereGeometry }]);
geometry = merge([{ ...oldSphereGeometry }]);

// Flat typed array geometries
geometry = merge([
  { ...sphereGeometry },
  { ...cubeGeometry },
  // cube({ sx: 2, sy: 0.5, sz: 0.5, nx: 200, ny: 200, nz: 200 }), // Testing cells Uint16/32 scaling
]);

// Flat array geometries
geometry = merge([
  propertiesArrayFrom({ ...sphereGeometry }),
  // sphere()
  propertiesArrayFrom({ ...cubeGeometry }),
]);

// Chunked array geometries
geometry = merge([{ ...oldSphereGeometry }, { ...oldCubeGeometry }]);

// Mixed flat geometries
geometry = merge([
  { ...oldSphereGeometry },
  propertiesArrayFrom({ ...cubeGeometry }),
]);
// Mixed flat and chunked geometries: not supported
// geometry = merge([{ ...oldSphereGeometry }, { ...cubeGeometry }]);

console.log(geometry);

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawGeom = {
  pipeline: ctx.pipeline({
    vert: /* glsl */ `#version 300 es
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;

void main () {
  vNormal = aNormal;
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}`,
    frag: /* glsl */ `#version 300 es
precision highp float;

in vec3 vNormal;

out vec4 fragColor;

void main () {
  fragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}`,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
  attributes: {
    aPosition: ctx.vertexBuffer(geometry.positions),
    aNormal: ctx.vertexBuffer(geometry.normals),
  },
  indices: ctx.indexBuffer(geometry.cells),
};

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawGeom);
});

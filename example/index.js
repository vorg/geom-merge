const ctx = require('pex-context')()
const cube = require('primitive-cube')(2, 0.5, 0.5)
const sphere = require('primitive-sphere')(0.5)
const merge = require('../../geom-merge')

const camera = require('pex-cam/perspective')({
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  fov: Math.PI / 3,
  near: 0.1,
  far: 100,
  position: [3, 3, -3],
  target: [0, 0, 0]
})

require('pex-cam/orbiter')({ camera: camera })

const g = merge([cube, sphere])

const clearCmd = {
  pass: ctx.pass({
    clearColor: [1, 1, 1, 1],
    clearDepth: 1
  })
}

const drawGeom = {
  pipeline: ctx.pipeline({
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      varying vec3 vNormal;
      void main () {
        vNormal = aNormal;
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
      }
    `,
    frag: `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec3 vNormal;
    void main () {
      gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
    }
    `,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix
  },
  attributes: {
    aPosition: ctx.vertexBuffer(g.positions),
    aNormal: ctx.vertexBuffer(g.normals)
  },
  indices: ctx.indexBuffer(g.cells)
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawGeom)
})

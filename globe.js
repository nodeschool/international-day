const earth     = require('earth-triangulated')
const cartesian = require('./cartesian')
const Geom      = require('gl-geometry')
const icosphere = require('icosphere')
const Shader    = require('gl-shader')
const glBuffer  = require('gl-buffer')
const mat4      = require('gl-mat4')
const vec3      = require('gl-vec3')
const glslify   = require('glslify')
const VAO       = require('gl-vao')
const fit       = require('canvas-fit')
const canvas    = document.createElement('canvas')
const gl        = require('gl-context')(canvas, render)

document.body.appendChild(canvas)

const scratch = new Float32Array(16)
class Globe {
  constructor(gl) {
    this.gl   = gl
    this.view = new Float32Array(16)
    this.proj = new Float32Array(16)
    this.near = 0.01
    this.far  = 100
    this.fov  = Math.PI / 4

    this.shaders = {}
    this.shaders.surface = Shader(gl
      , glslify('./shaders/surface.vert')
      , glslify('./shaders/surface.frag')
    )

    this.shaders.points = Shader(gl
      , glslify('./shaders/points.vert')
      , glslify('./shaders/points.frag')
    )

    this.points = window.points
    this.pointCount  = 0
    this.pointData   = new Float32Array(0)
    this.pointBuffer = null
    this.pointVAO    = null
    this.distance    = 4
    this.target      = null
    this.targetIndex = 0

    this.geometry = Geom(gl)
    this.geometry.attr('position', earth.positions)
    this.geometry.attr('index'
      , expandRanges(earth.ranges, earth.index, earth.positions.length)
      , { size: 1 }
    )

    this.translate = new Float32Array([2, 0, 0])
    this.origin    = new Float32Array([0, 0, 0])
    this.eye       = new Float32Array([0, 0, 4])
    this.up        = new Float32Array([0, 0, 1])
    this.start     = Date.now()
  }

  tick() {
    const gl = this.gl

    this.width  = gl.drawingBufferWidth
    this.height = gl.drawingBufferHeight
    this.ratio  = this.width / this.height
    this.time   = (Date.now() - this.start) / 1000

    if (this.target) {
      this.eye[0] += (this.target[0] - this.eye[0]) * 0.025
      this.eye[1] += (this.target[1] - this.eye[1]) * 0.025
      this.eye[2] += (this.target[2] - this.eye[2]) * 0.025
    } else {
      this.eye[0] = Math.sin(this.time * 0.5) * this.distance
      this.eye[1] = Math.cos(this.time * 0.5) * this.distance
      this.eye[2] = 1
    }

    mat4.lookAt(this.view, this.eye, this.origin, this.up)
    mat4.identity(scratch)

    mat4.translate(scratch, scratch, this.translate)
    mat4.multiply(this.view, scratch, this.view)

    mat4.perspective(this.proj
      , this.fov
      , this.ratio
      , this.near
      , this.far
    )

    if (this.pointCount !== this.points.length) {
      this.rebuildPoints()
    }
  }

  rebuildPoints() {
    const gl = this.gl

    this.pointCount = this.points.length
    this.pointData  = new Float32Array(this.pointCount * 4)

    for (var i = 0, j = 0; i < this.points.length; i++) {
      var point = this.points[i]
      var coord = point.coord = cartesian(point.lat, point.lon)

      this.pointData[j++] = coord[0]
      this.pointData[j++] = coord[1]
      this.pointData[j++] = coord[2]
      this.pointData[j++] = i
    }

    if (this.pointVAO) this.pointVAO.dispose()
    if (this.pointBuffer) this.pointBuffer.dispose()

    this.pointBuffer = glBuffer(gl, this.pointData)
    this.pointVAO    = VAO(gl, [{
      buffer: this.pointBuffer
      , size: 4
    }])

    this.pointTo(0)
  }

  draw() {
    const gl   = this.gl
    var shader = this.shaders.surface

    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)

    this.geometry.bind(shader)
    shader.uniforms.view = this.view
    shader.uniforms.proj = this.proj
    shader.uniforms.time = this.time
    shader.uniforms.eye  = this.eye
    this.geometry.draw()

    if (!this.pointBuffer) return

    shader = this.shaders.points
    shader.bind()
    shader.uniforms.index = this.targetIndex
    shader.uniforms.view  = this.view
    shader.uniforms.proj  = this.proj
    shader.uniforms.time  = this.time
    shader.uniforms.eye   = this.eye

    this.pointVAO.bind()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
    gl.depthMask(true)
    gl.disable(gl.BLEND)
  }

  pointTo(n) {
    var meta = this.points[n]

    this.target = meta.coord.slice()
    this.targetIndex = n

    vec3.normalize(this.target, this.target)
    this.target[0] *= this.distance
    this.target[1] *= this.distance
    this.target[2] *= this.distance
  }
}

function expandRanges(ranges, index, size) {
  var output = new Float32Array(size)
  var j      = 1000

  Object.keys(ranges).forEach(function(name) {
    var start = ranges[name][0] / 3
    var end   = ranges[name][1] / 3
    var id    = index[name] || (index[name] = j++)

    for (var i = start; i < end; i++) {
      output[i] = id
    }
  })

  return output
}

function render() {
  globe.translate[0] = 1.5 * globe.width / 1440
  globe.translate[1] = 0
  globe.tick()

  gl.viewport(0, 0, globe.width, globe.height)
  globe.draw()
}

window.globe = new Globe(gl);
window.addEventListener('resize', fit(canvas), false)
canvas.style.position = 'fixed'
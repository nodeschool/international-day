const canvas    = document.body.appendChild(document.createElement('canvas'))
const gl        = require('gl-context')(canvas, render)
const cartesian = require('./cartesian')
const fit       = require('canvas-fit')
const tabletop  = require('./tabletop')
const globe     = require('./')(gl)

tabletop.init({
  key: 'https://docs.google.com/spreadsheets/d/1swvC909BzbpToZLePM6whDvmXavaxEG6eT257dVf-bY/pubhtml',
  callback: gotData
})

function gotData(data) {
  var events    = data[Object.keys(data)[0]].elements
  var locations = new Float32Array(events.length * 3)

  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    var date  = new Date(event.startdate)

    if (date.getMonth() !== 4) continue
    if (date.getDate() < 21 || date.getDate() > 25) continue

    globe.points.push({
      lat: (events[i].latitude  = Number(events[i].latitude)),
      lon: (events[i].longitude = Number(events[i].longitude)),
      name: events[i].name,
      href: events[i].website
    })
  }
}

function render() {
  globe.tick()

  gl.viewport(0, 0, globe.width, globe.height)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  globe.draw()
}

window.addEventListener('resize', fit(canvas), false)

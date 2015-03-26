const canvas    = document.body.appendChild(document.createElement('canvas'))
const gl        = require('gl-context')(canvas, render)
const escape    = require('escape-html')
const cartesian = require('./cartesian')
const fit       = require('canvas-fit')
const tabletop  = require('./tabletop')
const domify    = require('domify')
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

    // 21st-25th May, 2015
    // if (date.getMonth() !== 4) continue
    // if (date.getDate() < 21 || date.getDate() > 25) continue
    // if (date.getYear() !== 115) continue

    globe.points.push({
      lat: (events[i].latitude  = Number(events[i].latitude)),
      lon: (events[i].longitude = Number(events[i].longitude)),
      name: events[i].name,
      href: events[i].website
    })
  }

  globe.points.sort(function(a, b) {
    return (+new Date(a.startdate)) - (+new Date(b.startdate))
  })

  var list = globe.points.map(event => `
    <li>
      <a target="_blank" href="${escape(event.href)}">${escape(event.name)}</a>
    </li>
  `).join('')

  var events = domify(`<ul class="event-list">${list}</ul>`)

  document.body.appendChild(events)
}

function render() {
  globe.translate[0] = 1.5 * globe.width / 1440
  globe.translate[1] = 0
  globe.tick()

  gl.viewport(0, 0, globe.width, globe.height)
  globe.draw()
}

window.addEventListener('resize', fit(canvas), false)
canvas.style.position = 'fixed'

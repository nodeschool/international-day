const canvas    = document.body.appendChild(document.createElement('canvas'))
const gl        = require('gl-context')(canvas, render)
const findup    = require('findup-element')
const escape    = require('escape-html')
const cartesian = require('./cartesian')
const fit       = require('canvas-fit')
const slice     = require('sliced')
const domify    = require('domify')
const nets      = require('nets')
const csv       = require('csv-parser')
const concat    = require('concat-stream')
const globe     = require('./')(gl)

nets('./events.csv', function (err, resp, body) {
	if (err) throw err
	var parser = csv()
	parser.pipe(concat(gotData))
	parser.write(body)
	parser.end()
})

function gotData(events) {
  var locations = new Float32Array(events.length * 3)

  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    // var date  = new Date(event.startdate)

    // 21st-25th May, 2015
    // if (date.getMonth() !== 4) continue
    // if (date.getDate() < 21 || date.getDate() > 25) continue
    // if (date.getYear() !== 115) continue
		
		if (!events[i]['event-url']) continue // only allow events with signup page for now
		
    globe.points.push({
      lat: (events[i].lat  = Number(events[i].lat)),
      lon: (events[i].lon = Number(events[i].lon)),
      name: events[i].city,
      href: events[i]['event-url']
    })
  }

  var list = globe.points.map(event => `
    <li>
      ${escape(event.name)} <span class="event-link">(<a target="_blank" href="${escape(event.href)}">event page</a>)</span>
    </li>
  `).join('')

  document.body.appendChild(domify(`<ul class="event-list"><h1 style="margin-bottom: 30px; font-size: 20px;">Find an event near you</h1>${list}</ul>`))

  //
  // Selecting events on the globe on text hover
  //
  var events    = slice(document.querySelectorAll('.event-list li'))
  var eventList = events[0].parentNode
  var pEvent    = null
  var cycling   = true
  var cIndex    = 0

  eventList.addEventListener('mouseover', function(e) {
    var el = findup(e.target, el => events.indexOf(el) !== -1)
    if (!el) return

    var idx = events.indexOf(el)
    if (idx === -1) return

    selectPoint(idx)
    cycling = false
  }, false)

  eventList.addEventListener('mouseleave', function(e) {
    if (e.target !== eventList) return
    cycling = true
  }, false)

  setInterval(function() {
    if (cycling) {
      selectPoint((cIndex + 1 + globe.points.length) % globe.points.length)
    }
  }, 5000)

  function selectPoint(index) {
    cIndex = index
    globe.pointTo(cIndex)

    if (pEvent) pEvent.classList.remove('selected')
    pEvent = events[cIndex]
    pEvent.classList.add('selected')
  }
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

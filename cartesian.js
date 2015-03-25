const radians = Math.PI / 180
const sin = Math.sin
const cos = Math.cos

module.exports = toCartesian

// converts a latitude/longitude pair into cartesian
// (x/y/z) coordinates on the globe.
// source: http://stackoverflow.com/a/10475267/985958
function toCartesian(lat, lon, out) {
  if (!out) out = []

  lat -= 90
  lat *= radians
  lon *= radians

  out[0] = cos(lon) * sin(lat)
  out[1] = sin(lon) * sin(lat)
  out[2] = cos(lat)

  return out
}

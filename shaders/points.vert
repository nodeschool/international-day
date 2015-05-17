precision mediump float;

attribute vec4 position;
varying float selected;
uniform float index;
uniform float time;
uniform mat4 proj;
uniform mat4 view;

void main() {
  selected = 1.0 - min(1.0, abs(position.w - index));

  gl_PointSize = 5.0 + selected * 10.0 * (sin(time * 7.5) * 0.5 + 0.5);
  gl_Position = proj * view * vec4(position.xyz * 1.025, 1);
}

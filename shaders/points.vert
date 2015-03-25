precision mediump float;

attribute vec4 position;
uniform mat4 proj;
uniform mat4 view;

void main() {
  gl_PointSize = 8.0;
  gl_Position = proj * view * vec4(position.xyz * 1.025, 1);
}

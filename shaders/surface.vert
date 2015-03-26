precision mediump float;

attribute vec3  position;
attribute float index;

varying vec3  tone;
varying vec3  vpos;
uniform mat4  proj;
uniform mat4  view;
uniform float time;

#pragma glslify: noise = require('glsl-noise/simplex/2d')

#define GLOBE_COLOR_1 #FFDE16
#define GLOBE_COLOR_2 #F2F2F2

void main() {
  float n = noise(vec2(index * 239.32489032 + 5.0, time * 0.5));

  n = pow(n + 0.5 * 0.5, 2.5);

  tone = GLOBE_COLOR_1 + n * 0.06125;
  vpos = position;

  gl_Position = proj * view * vec4(position, 1.0);
}

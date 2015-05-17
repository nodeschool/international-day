precision mediump float;

#define GLOBE_COLOR #666
#define GLOBE_BACKGROUND #FFFFFF

#pragma glslify: gauss = require('glsl-specular-gaussian')

varying vec3 tone;
varying vec3 vpos;
uniform vec3 eye;

void main() {
  float diffuse = mix(0.95, 1.025, max(0.0, dot(normalize(vpos), vec3(0, 0, 1))));
  float rim     = mix(0.0, 0.1, max(0.0, dot(normalize(vpos - eye), normalize(vpos)) + 0.75));
  float spec    = gauss(normalize(vec3(0, 0, 1)), normalize(eye - vpos), normalize(vpos), 0.35) * 0.125;
  vec3  color   = tone;

  color *= clamp(diffuse + rim, 0.9, 1.1);
  color += spec;

  if (!gl_FrontFacing) {
    color = mix(color, GLOBE_BACKGROUND, 0.75);
  }

  // gamma correction
  color = pow(clamp(color, 0.0, 1.0), vec3(0.45));

  gl_FragColor = vec4(color, 1);
}

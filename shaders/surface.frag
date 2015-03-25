precision mediump float;

#define GLOBE_COLOR #FFDE16
#define GLOBE_BACKGROUND #FFFFFF

varying vec3 tone;
varying vec3 vpos;
uniform vec3 eye;

void main() {
  float diffuse = mix(0.9, 1.0, max(0.0, dot(normalize(vpos), vec3(0, 0, 1))));
  float rim     = mix(0.0, 0.1, max(0.0, dot(normalize(vpos - eye), normalize(vpos)) + 0.75));
  vec3  color   = tone;

  color *= clamp(diffuse + rim, 0.9, 1.1);

  if (!gl_FrontFacing) {
    color = mix(color, GLOBE_BACKGROUND, 0.75);
  }

  // gamma correction
  color = pow(clamp(color, 0.0, 1.0), vec3(0.4545));

  gl_FragColor = vec4(color, 1);
}

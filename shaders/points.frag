precision mediump float;

varying float selected;

void main() {
  vec2 p = (gl_PointCoord.xy-0.5)*2.0;
  float a = (1.0 - pow(dot(p, p), 5.0));

  gl_FragColor = vec4(mix(#FF5E4D, #78CDFF, selected), a);
}

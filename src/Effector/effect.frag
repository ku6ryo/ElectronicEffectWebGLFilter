precision mediump float;

uniform sampler2D u_imageMask;
uniform sampler2D u_noiseMask1;
uniform vec2 u_resolution;

varying vec2 v_texCoord;
float PI = 3.14159265358979323846264;
float E = 2.71828182845904523536028;

float alphaW = 0.5;

vec3 color1 = vec3(0.0667, 1.0, 0.7216);
vec3 white = vec3(1.0, 1.0, 1.0);

vec3 color2 = vec3(1.0, 0.0, 0.0);

vec3 thunder1(float d) {
  float r = 1. / (1. + pow(E, - (d * 12.0 - 6.0)));
  return white * r + color1 * (1. - r);
}

vec3 thunder2(float d) {
  float r = 1. / (1. + pow(E, - (d * 12.0 - 6.0)));
  return white * r + color2 * (1. - r);
}

void main() {
  vec4 noise1 = texture2D(u_noiseMask1, v_texCoord);
  float d1 = noise1.r;
  float theta1 = d1 * 2. * PI - PI;
  vec2 direction1 = vec2(cos(theta1), sin(theta1));
  vec2 displacementVector1 = direction1 * d1 * 0.07;
  vec4 effect1 = texture2D(u_imageMask, v_texCoord + displacementVector1);
  float e1 = effect1.a;
  vec3 thunder1 = thunder1(e1);

  vec2 direction2 = vec2(sin(theta1), cos(theta1));
  vec2 displacementVector2 = direction2 * d1 * 0.05;
  vec4 effect2 = texture2D(u_imageMask, v_texCoord + displacementVector2);
  float e2 = effect2.a;
  vec3 thunder2 = thunder2(e2);

  float alpha = pow(E, - pow(((e1 + e2) - 1.0) / alphaW, 2.0));

  gl_FragColor = vec4((thunder1 * e1 + thunder2 * e2) / (e1 + e2), alpha);
}
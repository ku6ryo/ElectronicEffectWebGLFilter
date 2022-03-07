precision mediump float;

uniform sampler2D u_imageTarget;
uniform sampler2D u_imageMask;
uniform sampler2D u_noiseMask1;
uniform sampler2D u_noiseMask2;
uniform float u_detected;
uniform vec2 u_resolution;

varying vec2 v_texCoord;
float PI = 3.14159265358979323846264;
float E = 2.71828182845904523536028;

float alphaW = 1.0;

vec3 blue = vec3(0.4353, 0.2784, 1.0);
vec3 white = vec3(1.0, 1.0, 1.0);

vec3 red = vec3(0.9765, 0.2667, 1.0);
vec3 white2 = vec3(1.0, 1.0, 1.0);

vec3 thunder1(float d) {
  float r = 1. / (1. + pow(E, - (d * 12.0 - 6.0)));
  return white * r + blue * (1. - r);
}

vec3 thunder2(float d) {
  float r = 1. / (1. + pow(E, - (d * 12.0 - 6.0)));
  return white2 * r + red * (1. - r);
}

void main() {
  vec4 noise1 = texture2D(u_noiseMask1, v_texCoord);
  float d1 = noise1.r;
  float theta1 = d1 * 2. * PI;
  vec2 direction1 = vec2(cos(theta1), sin(theta1));
  vec2 displacementVector1 = direction1 * d1 * 0.07;
  vec4 effect1 = texture2D(u_imageMask, v_texCoord + displacementVector1 * 1.5);
  float e1 = effect1.a;
  vec3 thunder1 = thunder1(e1);

  vec4 noise2 = texture2D(u_noiseMask2, v_texCoord);
  float d2 = noise2.r;
  float theta2 = d2 * 2. * PI;
  vec2 direction2 = vec2(cos(theta2), sin(theta2));
  vec2 displacementVector2 = direction2 * d2 * 0.05;
  vec4 effect2 = texture2D(u_imageMask, v_texCoord + displacementVector2 * 1.5);
  float e2 = effect2.a;
  vec3 thunder2 = thunder2(e2);


  float alpha = pow(E, - pow(((e1 + e2) - 1.0) / alphaW, 2.0));
  vec4 video = texture2D(u_imageTarget, v_texCoord);
  float g = (video.r + video.g + video.b) / 3.;
  vec3 gray = vec3(g, g, g) * (1. + 0.5 * u_detected);

  if ((e1 + e2) > 0.1) {
    gl_FragColor = vec4((thunder1 * e1 + thunder2 * e2) / (e1 + e2) * alpha + gray * (1. - alpha), 1.);
  } else {
    gl_FragColor = vec4(gray, 1.);
  }
}
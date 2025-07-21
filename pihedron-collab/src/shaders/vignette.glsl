#version 300 es
precision highp float;

in vec2 sourceUV;
out vec4 outColor;
uniform sampler2D sourceTexture;
uniform vec2 resolution;

uniform float radius;
uniform float falloff;

void main() {
  vec2 uv = sourceUV ;
  vec4 c = texture(sourceTexture, uv);
  
  // normalized coords from -1 to 1
  vec2 pos = uv * 2.0 - 1.0;
  float dist = length(pos);
  
  // adjust these for fade shape
  
  float alpha = smoothstep(radius, radius - falloff, dist);
  c.a *= alpha;
  
  outColor = c;
}

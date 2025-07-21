#version 300 es
precision highp float;

// https://www.shadertoy.com/view/3cdXDX. Credits here

in vec2 sourceUV;
out vec4 outColor;

uniform sampler2D sourceTexture;
uniform vec2 resolution;

// Optional tweakables
uniform float borderSoftness;
uniform float borderBrightness;
uniform float lensDistortion; // usually 1.0
uniform float blurSize;       // usually 0.5

void main() {
    vec2 uv = sourceUV;
    vec2 centered = uv - 0.5;

    // Rounded rectangle mask (with smooth edge falloff)
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 p = centered * aspect;
    float roundedBox = pow(abs(p.x), 8.0) + pow(abs(p.y), 8.0);

    float rb1 = clamp((1.0 - roundedBox * 10000.0) * 8.0, 0.0, 1.0);
    float rb2 = clamp((0.95 - roundedBox * 9500.0) * 16.0, 0.0, 1.0)
    - clamp(pow(0.9 - roundedBox * 9500.0, 1.0) * 16.0, 0.0, 1.0);
    float rb3 = clamp((1.5 - roundedBox * 11000.0) * 2.0, 0.0, 1.0)
    - clamp(pow(1.0 - roundedBox * 11000.0, 1.0) * 2.0, 0.0, 1.0);

    float transition = smoothstep(0.0, 1.0, rb1 + rb2);
    vec4 color = texture(sourceTexture, uv);

    if (transition > 0.0) {
        // Lens warp
        vec2 lensUV = (centered * (1.0 - roundedBox * 5000.0 * lensDistortion)) + 0.5;

        // Blur sampling (simple box blur)
        vec4 blur = vec4(0.0);
        float total = 0.0;
        for (float x = -4.0; x <= 4.0; x++) {
            for (float y = -4.0; y <= 4.0; y++) {
                vec2 offset = vec2(x, y) * blurSize / resolution;
                blur += texture(sourceTexture, lensUV + offset);
                total += 1.0;
            }
        }
        blur /= total;

        // Gradient lighting
        float gradient = clamp(clamp(p.y, 0.0, 0.2) + 0.1, 0.0, 1.0) / 2.0
        + clamp(clamp(-p.y, -1.0, 0.2) * rb3 + 0.1, 0.0, 1.0) / 2.0;

        vec4 lighting = clamp(blur + vec4(rb1) * gradient + vec4(rb2) * borderBrightness, 0.0, 1.0);
        outColor = mix(color, lighting, transition);
    } else {
        outColor = color;
    }
}

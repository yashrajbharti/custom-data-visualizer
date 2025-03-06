export const vertexShaderSource = `#version 300 es
layout(location = 0) in vec3 a_position;
uniform mat4 u_matrix;
void main() {
    gl_PointSize = 5.0;
    gl_Position = u_matrix * vec4(a_position, 1.0);
}`;

export const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 outColor;
uniform int u_focusedIndex;
uniform int u_index;

void main() {
    if (u_focusedIndex == u_index) {
        outColor = vec4(0.0, 0.5, 0.0, 1.0);
    } else {
        outColor = vec4(1.0, 1.0, 0.0, 1.0); 
    }
}`;

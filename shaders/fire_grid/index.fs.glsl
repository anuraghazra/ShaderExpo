precision mediump float;

uniform vec2 mouse;
uniform float uTime;
uniform vec2 resolution;

void main() {
	vec2 position = ( gl_FragCoord.yx / resolution.xy ) + vec2(100.0) / 100.0;

	float color = 1.0;
	color += sin( position.x * cos( uTime / 15.0 ) * 80.0 ) + cos( position.y * cos( uTime / 30.0 ) * 200.0 );
	color += sin( position.y * sin( uTime / 10.0 ) * 40.0 ) + cos( position.x * sin( uTime / 25.0 ) * 48.0 );
	color += sin( position.x * sin( uTime / 5.0 ) * 10.0 ) + sin( position.y * sin( uTime / 35.0 ) * 0.0 );
	color *= sin( uTime / 30.0 ) * 0.9;

	gl_FragColor = vec4( vec3( color, color * 0.389, sin( color + uTime / 234.0 ) * 0. ), 1.1111111111 );
}
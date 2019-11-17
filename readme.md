# Shader Expo
[![License: GPL v3](https://img.shields.io/github/license/anuraghazra/ShaderExpo.svg)](https://github.com/anuraghazra/ShaderExpo/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/anuraghazra/ShaderExpo.svg)
![Maintenance](https://img.shields.io/maintenance/yes/2019.svg)

:sunrise: :rainbow:

WebGL Shader Playground.

`ShaderExpo` is purely dependency free shader editor made in Raw WebGL API.
Experiment with basic webgl shaders on the fly.

Checkout [ShaderExpo Case Study](https://anuraghazra.github.io/case-studies/shader-expo)

## :file_folder: Features
- Rich CodeEditor
- Simple CodeEditor
- AutoCompletion
- Live Editing
- Basic Debugging

## Auto Completion
![AutoCompletion](./assets/screenshots/auto-completion.png)

## Inline Errors
![Inline-Errors](./assets/screenshots/inline-erros.png)

## Basic Meshes
![Basic-Meshes](./assets/screenshots/basic-meshes.png)

## Texture and Custom OBJ Model Loading
![Texture-Model-Loading](./assets/screenshots/texture-model-loading.png)

## Example Shaders
![Example-Shaders](./assets/screenshots/example-shaders.png)


-----------------

## :necktie: Avialable Uniforms

| **Name**      | **Type**   |    Description    |
| ------------- | ---------- | ----------------- |
| uWorldMatrix  | mat4       | I don't know |
| uViewMatrix   | mat4       | I don't know |
| uProjMatrix   | mat4       | I don't know |
| uTime         | float      | current frame time        |
| mouse         | vec2       | mouse postion |
| resolution    | vec2       | canvas width, height|
| viewPos       | vec3       | camera position|
| texture       | sampler2D  | default diffuse texture|


### :game_die: Third Party Libs
- Ace


### :memo: TODO
- [x] Add 3D Models
- [x] More Shader Variables
- [ ] Saving Shaders
- [ ] OOP
 

-----------------

Contributions are welcome.

Example Shaders are taken from https://glslsandbox.com

:star: Support the project by giving it a star :star:

## :octocat: Author
- hazru.anurag@gmail.com
- https://anuraghazra.github.io

Made with :heart: and JavaScript

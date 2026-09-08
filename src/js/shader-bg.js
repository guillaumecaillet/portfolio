// Full-page ambient background: Paper Shaders' Dithering shader (WebGL),
// self-hosted vanilla build under ./paper-shaders/. One GPU draw call,
// no DOM node explosion — replaces the old DOM-grid pixel skyline.
import { ShaderMount } from './paper-shaders/shader-mount.js';
import { ditheringFragmentShader, DitheringShapes, DitheringTypes } from './paper-shaders/shaders/dithering.js';
import { getShaderColorFromString } from './paper-shaders/get-shader-color-from-string.js';
import { ShaderFitOptions, defaultPatternSizing } from './paper-shaders/shader-sizing.js';

(function () {
    'use strict';
    const el = document.getElementById('shader-bg');
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function colorUniforms() {
        return {
            u_colorBack: getShaderColorFromString('#00000000'),
            u_colorFront: getShaderColorFromString(cssVar('--accent')),
        };
    }

    let mount;
    try {
        mount = new ShaderMount(
            el,
            ditheringFragmentShader,
            {
                ...colorUniforms(),
                u_shape: DitheringShapes.simplex,
                u_type: DitheringTypes['4x4'],
                u_pxSize: 2.5,
                u_fit: ShaderFitOptions[defaultPatternSizing.fit],
                u_scale: 5,
                u_rotation: defaultPatternSizing.rotation,
                u_offsetX: defaultPatternSizing.offsetX,
                u_offsetY: defaultPatternSizing.offsetY,
                u_originX: defaultPatternSizing.originX,
                u_originY: defaultPatternSizing.originY,
                u_worldWidth: defaultPatternSizing.worldWidth,
                u_worldHeight: defaultPatternSizing.worldHeight,
            },
            undefined,
            reduceMotion ? 0 : 0.25,
            0
        );
    } catch (err) {
        el.remove(); // no WebGL2 -> just skip the background, page still works
        return;
    }

    // Keep the ink color in sync with the light/dark theme toggle.
    new MutationObserver(() => mount.setUniforms(colorUniforms()))
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

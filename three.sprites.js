var old = false;
var orbit = true;

function toBinaryInt(num) {
    /**
     * @author fernandosavio
     * http://stackoverflow.com/a/16155417/1763602
     */

    "use strict";

    return (num >>> 0).toString(2);  // jshint ignore:line
}


function getNextPowerOfTwo(num) {
    /**
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  @date Feb 17, 2016
     */

    "use strict";

    if (num < 0) {
        throw new Error("Argument must be positive");
    }

    var bin_str = toBinaryInt(num - 1);

    if (bin_str.indexOf("0") < 0 || bin_str === "0") {
        return num;
    }
    else {
        return Math.pow(2, bin_str.length);
    }
}

function adaptCanvasToText(canvas, message, font_size, font_face) {
    /**
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  @date Feb 17, 2016
     */

    "use strict";

    var context = canvas.getContext('2d');

    if (canvas.height > canvas.width) {
        canvas.width = canvas.height;
    }


    while (true) {
        var side = getNextPowerOfTwo(canvas.width);

        if (side < 128) {
            side = 128;
        }

        canvas.width = canvas.height = side;

        context.font = "Bold " + font_size + "pt " + font_face;

        var metrics = context.measureText(message);
        var text_width = metrics.width;
        var text_side = getNextPowerOfTwo(Math.max(text_width, font_size));

        if (text_side >= 128) {
            if (side !== text_side) {
                canvas.width = text_side;
                continue;
            }
        }
        else if (side !== 128) {
            canvas.width = 128;
            continue;
        }

        break;
    }
}


function makeTextSprite(message, opts) {  // jshint ignore:line
    /**
     *  @author Lee Stemkoski
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *
     *  https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
     *
     */

    "use strict";

    if ( opts === undefined ) {
        opts = {};
    }

    var possible_opts = ["font_face", "font_size", "border_thickness",
                         "border_color", "background_color", "text_color"];

    for (var k in opts) {
        if (opts.hasOwnProperty(k)) {
            if (possible_opts.indexOf(k) < 0) {
                throw new Error("Unknown option '" + k.toString() + "'");
            }
        }
    }

    if (opts["font_face"] === undefined) {
        opts["font_face"] = "Arial";
    }

    if (opts["font_size"] === undefined) {
        opts["font_size"] = 100;
    }

    var font_size = opts["font_size"];

    if (font_size <= 0) {
        throw new Error("'font_size' must be a positive number");
    }

    if (opts["border_thickness"] === undefined) {
        opts["border_thickness"] = 0;
    }

    if (opts["border_thickness"] < 0) {
        throw new Error("'border_thickness' must be >= 0");
    }

    if (opts["border_color"] === undefined) {
        opts["border_color"] = { r:0, g:0, b:0, a:1.0 };
    }

    if (opts["background_color"] === undefined) {
        opts["background_color"] = { r:255, g:255, b:255, a:1.0 };
    }

    if (opts["text_color"] === undefined) {
        opts["text_color"] = { r: 0, g: 0, b: 0, a: 1 };
    }

    var border_color = opts["border_color"];
    var background_color = opts["background_color"];
    var text_color = opts["text_color"];

    var sprite_align;

    if (old) {
      sprite_align = THREE.SpriteAlignment.topLeft;
    }

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    adaptCanvasToText(canvas, message, font_size, opts["font_face"]);

    var scale;

    if (canvas.width > 128) {
        scale = canvas.width / 128;
    }

    // background color
    context.fillStyle   = ("rgba(" + background_color.r + "," +
                           background_color.g + "," + background_color.b + "," +
                           background_color.a + ")");
    // border color
    context.strokeStyle = ("rgba(" + border_color.r + "," + border_color.g +
                           "," + border_color.b + "," + border_color.a + ")");

    context.lineWidth = opts["border_thickness"];
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = ("rgba(" + text_color.r + "," + text_color.g +
                           "," + text_color.b + "," + text_color.a + ")");

    var metrics = context.measureText( message );
    var text_width = metrics.width;

    console.log(text_width);

    context.fillText( message, (canvas.width - text_width) / 2, canvas.height / 2 + font_size / 2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial;

    if (old) {
        spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false,
            alignment: sprite_align,
        });
    }
    else {
        spriteMaterial = new THREE.SpriteMaterial({map: texture});
    }

    var sprite = new THREE.Sprite(spriteMaterial);

    if (scale) {
        sprite.scale.set(scale, scale, 1);
    }

    return sprite;
}


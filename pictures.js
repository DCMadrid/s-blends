/* Blend Buddies – word pictures. Each picture is in images/ (real photographs, plus 5 AI-generated images for snap, splat, smudge, spin, scream), used offline via a relative path (no network fetch).
   API: window.BBPictures.has(word), .svg(word) -> inner SVG markup, .list() -> all words with a picture.
   Photo sources, authors and licenses are listed in PHOTO_CREDITS.md and images/manifest.json. */
(function () {
  'use strict';
  var WORDS = ["star", "stop", "step", "stick", "stamp", "stairs", "stove", "stool", "stack", "stem", "spoon", "spider", "spill", "spin", "spot", "sponge", "space", "spy", "spark", "spaghetti", "sky", "skate", "skip", "skunk", "skirt", "ski", "skateboard", "skeleton", "scooter", "scarf", "scar", "smile", "small", "smell", "smoke", "smash", "smooth", "smoothie", "smudge", "smart", "smock", "snow", "snake", "snack", "snail", "sneeze", "snap", "sniff", "snore", "snowman", "sneaker", "swing", "swim", "sweater", "swan", "sweep", "switch", "swirl", "swamp", "sweet", "swimsuit", "slide", "sled", "slime", "sleep", "slow", "slipper", "sloth", "slug", "slice", "slip", "straw", "string", "street", "stripe", "stroller", "strong", "strawberry", "stretch", "stream", "strap", "splash", "splat", "splatter", "split", "splinter", "splotch", "splendid", "splint", "scream", "scratch", "scrub", "screen", "screw", "scribble", "scrape", "scroll", "scrunch", "scramble", "top", "tick", "tool", "pot", "pill", "pin", "park", "pie", "car", "mile", "mall", "no", "nail", "nap", "knees", "wing", "witch", "lime", "low", "lip", "treat", "trap", "cream", "crunch"];
  var set = {};
  WORDS.forEach(function (w) { set[w] = true; });
  function key(w) { return String(w || '').toLowerCase(); }
  function has(w) { return Object.prototype.hasOwnProperty.call(set, key(w)); }
  window.BBPictures = {
    has: has,
    svg: function (w) {
      w = key(w);
      if (!has(w)) return '';
      return '<image href="images/' + w + '.webp?v=6" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>';
    },
    list: function () { return WORDS.slice(); }
  };
})();

# Blend Buddies – S Blends

A free, single-page practice tool for **initial S blends** (st, sp, sk, sm, sn, sw, sl, str, spl, scr). S is a friendly letter who wants to join the other letters. An adult slides the **S** character along its buddy's outstretched arm while the child holds "sssss". A stretchy "sssss" ribbon grows behind S. When S arrives, the two link arms, smile wider, the buddy gives a little tap-pop (the second sound), and the rest of the word slides in: **s + t + ar → star**.

Created for Daniela Madrid, MS, CCC-SLP.

Concept inspired by the idea of S as a friendly sound; all characters, art, sounds and code are original.

## How to use

- Open `https://dcmadrid.github.io/s-blends/` to get the word picker, grouped by blend.
- Link straight to a word with `?w=<word>`, for example `?w=star` or `?w=skateboard`. Links ignore capitals and spaces (`?w=Star`, `?w=skate%20board`). `?g=<group>` (for example `?g=sn`) opens the picker at one group.
- Add `&m=slider` to open in slider mode, and `&say=1` to turn the "Say it!" prompt on.
- **Drag mode:** drag S right along the buddy's arm. If you let go early, S stays where it is, so you can go as slowly as the child needs. Past about 93% it snaps in, the arms link and the word appears (blend letters in their colors, the rest in dark ink) with a star burst.
- **Slider mode:** drag the big purple handle under the picture. S rides along.
- **Leave S out?** (only on words where leaving S out makes another real word, such as stop → top, snow → no, smile → mile): shows the buddy alone and a bit sad with the S-less word. **Bring S back** slides S in and makes the S-blend word again. Words only, no pictures.
- The buttons are **Reset**, **Prev**, **Next**, **Words** (back to the picker), **Say it!** (a text prompt) and the **speaker** (sound on/off; always starts on and is not remembered). On a keyboard, the arrow keys move S, End finishes the word, and PageDown/PageUp go to the next and previous words.

## Sounds

All sounds are generated live in the browser with the Web Audio API. There are no audio files and no recorded or copyrighted audio: a soft whoosh while S moves (louder and brighter when moving faster), a pop when the arms link, a tap on the second sound and a chime when the word is complete. Sound starts on the first touch (an iPad requirement). On an iPhone or iPad, the ring/silent switch and the volume buttons can mute it.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styles and animations |
| `app.js` | All behavior and the sound generator. Plain JavaScript with no libraries and no build step |
| `words.json` | The word list and settings. This is the single source of truth |
| `Fredoka.woff2`, `Nunito.woff2` | Bundled fonts (no external font services) |
| `OFL.txt` | The font license |

Each word in `words.json` has `id`, `word`, `s` (the friendly letter), `partner` (the letter or letters on the buddy characters, such as `t` or `tr`), `rest`, `blend`, `group` and `without` (the real word you get without S, or empty to hide the Leave-S-out button). `word` must equal `s + partner + rest`. `letters` sets each letter character's color, `groups` sets the blend groups and their calm background colors, and `friend` sets which letter is the friendly mover and which side it starts on, so the same code can later run separate L-blend or R-blend pages.

## Privacy

There are no logins, cookies, local storage, analytics or tracking, and no third-party requests. The only file the page fetches is `words.json` from the same site. A Content-Security-Policy restricts everything to the page's own origin. Because the page loads `words.json`, it has to be opened from a web address (GitHub Pages or any web server), not as a file opened straight from a folder.

## Graphics, sounds and licensing

- **All characters and graphics are original**, drawn in code as SVG and CSS: round letter characters with eyes, smiles and noodle arms, the ribbon, hearts, stars and icons. **No third-party clip art, pictures or character designs are used.** There are no pictures of the words.
- **All sounds are original**, synthesized at run time (see Sounds).
- The word list is a set of common English words.
- The fonts are Fredoka (Copyright 2016 The Fredoka Project Authors) and Nunito (Copyright 2014 The Nunito Project Authors). Both are licensed under the SIL Open Font License 1.1, and the full text is in `OFL.txt`. They were subset to basic Latin and converted to WOFF2.
- Code © 2026 Daniela Madrid, MS, CCC-SLP. All rights reserved unless a license is added.

## Publish on GitHub Pages

1. Create a **public** repository named `s-blends`.
2. Upload all the files in this folder to the root of the repository, on the `main` branch.
3. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**.
4. After about 1 to 2 minutes, the page is live at `https://dcmadrid.github.io/s-blends/` (one word: `https://dcmadrid.github.io/s-blends/?w=star`).

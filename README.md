# Blend Buddies – S Blends

A free, single-page practice tool for **initial S blends** (st, sp, sk, sm, sn, sw, sl, str, spl, scr). S is a friendly letter who wants to join the other letters. An adult slides the **S** character along its buddy's outstretched arm while the child holds "sssss". A stretchy "sssss" ribbon grows behind S. The whole word (for example **star**) is on screen from the start, so the child knows what they are saying. When S arrives, the two link arms, smile wider, the buddy gives a little tap-pop (the second sound), the blend letters (**s** and **t**) light up in their buddies' colors, bounce together and get a joining bar, a star burst plays and the word is spoken aloud.

Created for Daniela Madrid, MS, CCC-SLP.

Concept inspired by the idea of S as a friendly sound; all characters, art, sounds and code are original.

## How to use

- Open `https://dcmadrid.github.io/s-blends/` to get the word picker, grouped by blend.
- Link straight to a word with `?w=<word>`, for example `?w=star` or `?w=skateboard`. Links ignore capitals and spaces (`?w=Star`, `?w=skate%20board`). `?g=<group>` (for example `?g=sn`) opens the picker at one group.
- **Minimal pairs:** the last group in the picker. Each round shows card A (the buddy alone with the no-S word, for example **top**) next to card B (S and its buddy with the S-blend word, **stop**). Tap card A, or the **Which one?** buttons, to hear either word; drag S along the arm on card B to link arms and hear the S word. Link one pair with `?mp=<word>` (for example `?mp=stop`; `?mp=top` and `?w=pair-stop` also work) and `?g=pairs` opens the picker there. Prev/Next step through the pairs. The 24 pairs are listed in `words.json` under `pairs`.
- Add `&m=slider` to open in slider mode, and `&say=1` to turn the "Say it!" prompt on.
- **Drag mode:** drag S right along the buddy's arm (the arm is the track; the dashed circle shows where S is going, and S gives a little "drag me" nudge until it is first moved). If you let go early, S stays where it is, so you can go as slowly as the child needs. Past about 93% it snaps in, the arms link, the blend letters light up with a star burst and the word is spoken. The word itself never moves, so nothing jumps.
- **Slider mode:** drag the big purple handle under the picture. S rides along.
- **Leave S out?** (available at any time, on words where leaving S out makes another real word, such as stop → top, snow → no, smile → mile): shows the buddy alone and a bit sad with the S-less word, and says it. **Bring S back** slides S in and makes the S-blend word again. Words only, no pictures. (Hidden in the Minimal pairs round, which already shows both words.)
- The buttons are **Reset**, **Prev**, **Next**, **Words** (back to the picker), **Say it!** (a text prompt that also says the word), the round **Hear it again** speaker on the stage after linking (tapping the word does the same) and the **speaker** in the top bar (all sound and speech on/off; always starts on and is not remembered). Reset, Prev and Next stop any speech. On a keyboard, the arrow keys move S, End finishes the word, and PageDown/PageUp go to the next and previous words.

## Sounds

All sounds are generated live in the browser with the Web Audio API. There are no audio files and no recorded or copyrighted audio: a soft whoosh while S moves (louder and brighter when moving faster), a pop when the arms link, a tap on the second sound and a chime when the word is complete. Sound starts on the first touch (an iPad requirement). On an iPhone or iPad, the ring/silent switch and the volume buttons can mute it.

**Spoken word:** the word is read aloud with the browser's built-in speech (Web Speech API, `speechSynthesis`) using an English voice from the device (US English preferred), slightly slow (rate 0.85) and a little bright (pitch 1.1). It is spoken just after the pop and chime when the arms link, by **Say it!**, by **Hear it again**, and by the minimal-pair cards and buttons. Speech is primed with a silent utterance on the first touch (iOS rule), respects the sound toggle, and is simply skipped if the browser has no speech support. No audio files are involved. The page prefers on-device voices (iPad and Mac voices are on-device); on some desktop browsers with only online voices, the browser itself may use its own speech service. The page also honors the device's Reduce Motion setting.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styles and animations |
| `app.js` | All behavior and the sound generator. Plain JavaScript with no libraries and no build step |
| `words.json` | The word list and settings. This is the single source of truth |
| `Fredoka.woff2`, `Nunito.woff2` | Bundled fonts (no external font services) |
| `OFL.txt` | The font license |

`pairs` lists the word ids used in the Minimal pairs round. Each word in `words.json` has `id`, `word`, `s` (the friendly letter), `partner` (the letter or letters on the buddy characters, such as `t` or `tr`), `rest`, `blend`, `group` and `without` (the real word you get without S, or empty to hide the Leave-S-out button). `word` must equal `s + partner + rest`. `letters` sets each letter character's color, `groups` sets the blend groups and their calm background colors, and `friend` sets which letter is the friendly mover and which side it starts on, so the same code can later run separate L-blend or R-blend pages.

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

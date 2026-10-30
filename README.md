# Blend Buddies – S Blends

A free, single-page practice tool for **initial S blends** (st, sp, sk, sm, sn, sw, sl, str, spl, scr). S is a friendly letter who wants to join the other letters. An adult slides the **S** character along its buddy's outstretched arm while the child holds "sssss". A stretchy "sssss" ribbon grows behind S. Every word has its own original picture beside the stage. When S arrives, the two link arms, smile wider, the buddy gives a little tap-pop (the second sound), the blend letters (**s** and **t**) light up in their buddies' colors, bounce together and get a joining bar, a star burst plays and the word is spoken aloud.

On the 24 **pair words** (where leaving S out still makes a real word, such as pin → spin), the round itself is the minimal pair: it opens on the word without S (**pin**, with a picture of a pin, "Can S make a new word?"). When S links arms, **pin** turns into **spin**, the picture changes to something spinning, and two chips, **pin · spin**, let you hear and compare both words. At the end of each blend section there are **listen slides** (which one did you hear?) for that section's pairs.

Created for Daniela Madrid, MS, CCC-SLP.

Concept inspired by the idea of S as a friendly sound; all characters, art, sounds and code are original.

## How to use

- Open `https://dcmadrid.github.io/s-blends/` to get the word picker, grouped by blend.
- Link straight to a word with `?w=<word>`, for example `?w=star` or `?w=skateboard`. Links ignore capitals and spaces (`?w=Star`, `?w=skate%20board`). `?g=<group>` (for example `?g=sn`) opens the picker at one group.
- **Pair words in the round:** stop/top, stick/tick, stool/tool, spot/pot, spill/pill, spin/pin, spark/park, spy/pie, scar/car, smile/mile, small/mall, snow/no, snail/nail, snap/nap, sneeze/knees, swing/wing, switch/witch, slime/lime, slow/low, slip/lip, street/treat, strap/trap, scream/cream, scrunch/crunch (real words only). The round starts on the S-less word with its picture and its buddy alone. Tap the word, the picture or the speaker to hear it. After S links, the word changes and the **compare chips** (for example **pin · spin**) appear. Each chip says its word and shows its picture.
- **Listen slides** (auditory discrimination, teacher-led): the **Listen** group at the end of the picker holds one set per blend section, with that section's pairs (st 3, sp 5, sk 1, sm 2, sn 4, sw 2, sl 3, str 2, scr 2). Each slide shows both pictures. Daniela says one of the words, or taps **Play a word** to have the page say one, and the child taps the picture they heard: a green ring when right, a gentle shake when wrong, with the right card highlighted. With nothing asked yet, tapping a picture just says its word. Prev/Next step through the slides. Link one with `?mp=<word>` (for example `?mp=spin`; `?mp=pin` and `?w=pair-spin` also work), and `?g=pairs` opens the picker at Listen.
- Add `&m=slider` to open in slider mode, and `&say=1` to turn the "Say it!" prompt on.
- **Drag mode:** drag S right along the buddy's arm (the arm is the track; the dashed circle shows where S is going, and S gives a little "drag me" nudge until it is first moved). If you let go early, S stays where it is, so you can go as slowly as the child needs. Past about 93% it snaps in, the arms link, the blend letters light up with a star burst and the word is spoken. The word itself never moves, so nothing jumps.
- **Slider mode:** drag the big purple handle under the picture. S rides along.
- The buttons are **Reset**, **Prev**, **Next**, **Words** (back to the picker), **Say it!** (a text prompt that also says the word), the round **Hear it again** speaker on the stage (tapping the word or the picture does the same), the **pause** button in the top bar (motion on/off, see below) and the **speaker** in the top bar (all sound and speech on/off; always starts on and is not remembered). Reset, Prev and Next stop any speech. On a keyboard, the arrow keys move S, End finishes the word, and PageDown/PageUp go to the next and previous words.

## Pictures and motion

Each of the 99 words, and each of the 24 S-less pair words, has an original flat picture with thick rounded outlines in a calm palette, drawn in code as inline SVG (`pictures.js`). Some pictures move gently (spin spins, snow falls, a swing swings), and the buddies breathe and blink now and then. Pictures pop in softly when a word loads. The word and characters never jump.

- **Pause motion:** the **pause** button (two bars) next to the speaker stops all picture and idle animations. Pictures stay visible as still images. This helps children who are distracted by motion (for example CVI). It shows a play triangle while paused; tap it again to resume. It is kept only in the link (`&motion=off`), so you can bookmark a paused link. Nothing is stored.
- The page also honors the device's Reduce Motion setting: it starts paused, and transitions are minimal.

## Data tally (trial, optional)

A small, optional tally for the listen slides. It is **off by default**: a small **Tally** switch sits under the cards, and `&tally=on` in the link turns it on.

- When it is on, each answer is logged as { pair, word said, word tapped, correct }. The word said comes from **Play a word**, or Daniela marks what she said with the small **I said: pin | spin** chips (tap a chip again to unmark it). With no word said, nothing is logged.
- A running "N tried · N correct" count shows under the cards. After the last slide of a section, **Next** shows a summary card: "N tried · N correct · N missed", a collapsed **Misses** list (pair, word said, word tapped), **Clear tally** and **Keep going**.
- **Privacy:** everything stays in memory, for the current page only. There are no cookies, no localStorage, sessionStorage or IndexedDB, nothing is sent over the network, and there are no names or identifying fields. Reloading or closing the page clears it, so write the numbers down before closing. The summary card says so.
- **To remove it completely:** delete `tally.js`, delete its `<script src="tally.js"></script>` line in `index.html`, and delete the block between `/* ===== TALLY` and `/* ===== /TALLY ===== */` at the end of `style.css`. `app.js` has a single `hook()` connection point that does nothing when `tally.js` is absent, so nothing else needs to change.

## Sounds

All sounds are generated live in the browser with the Web Audio API. There are no audio files and no recorded or copyrighted audio: a soft whoosh while S moves (louder and brighter when moving faster), a pop when the arms link, a tap on the second sound and a chime when the word is complete. Sound starts on the first touch (an iPad requirement). On an iPhone or iPad, the ring/silent switch and the volume buttons can mute it.

**Spoken word:** the word is read aloud with the browser's built-in speech (Web Speech API, `speechSynthesis`) using an English voice from the device (US English preferred), slightly slow (rate 0.85) and a little bright (pitch 1.1). It is spoken just after the pop and chime when the arms link, by **Say it!**, by **Hear it again**, by the picture, the compare chips, and the listen-slide cards and **Play a word**. Speech is primed with a silent utterance on the first touch (iOS rule), respects the sound toggle, and is simply skipped if the browser has no speech support. No audio files are involved. The page prefers on-device voices (iPad and Mac voices are on-device); on some desktop browsers with only online voices, the browser itself may use its own speech service.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styles and animations |
| `app.js` | All behavior and the sound generator. Plain JavaScript with no libraries and no build step |
| `pictures.js` | The word pictures: original inline SVG drawn in code |
| `tally.js` | The optional data tally (trial; removable, see above) |
| `words.json` | The word list and settings. This is the single source of truth |
| `Fredoka.woff2`, `Nunito.woff2` | Bundled fonts (no external font services) |
| `OFL.txt` | The font license |

`pairs` lists the word ids used on the listen slides. Each word in `words.json` has `id`, `word`, `s` (the friendly letter), `partner` (the letter or letters on the buddy characters, such as `t` or `tr`), `rest`, `blend`, `group` and `without` (the real word you get without S, or empty if it is not a pair word). `word` must equal `s + partner + rest`. `letters` sets each letter character's color, `groups` sets the blend groups and their calm background colors, and `friend` sets which letter is the friendly mover and which side it starts on, so the same code can later run separate L-blend or R-blend pages.

## Privacy

There are no logins, cookies, local or session storage, analytics or tracking, and no third-party requests. The optional tally keeps its numbers only in memory (see Data tally). The only file the page fetches is `words.json` from the same site. A Content-Security-Policy restricts everything to the page's own origin. Because the page loads `words.json`, it has to be opened from a web address (GitHub Pages or any web server), not as a file opened straight from a folder.

## Graphics, sounds and licensing

- **All characters and graphics are original**, drawn in code as SVG and CSS: round letter characters with eyes, smiles and noodle arms, the ribbon, hearts, stars, icons and every word picture. **No clip art, stock images, emoji, icon sets or third-party pictures or character designs are used**, and there are no image or video files.
- **All sounds are original**, synthesized at run time (see Sounds).
- The word list is a set of common English words.
- The fonts are Fredoka (Copyright 2016 The Fredoka Project Authors) and Nunito (Copyright 2014 The Nunito Project Authors). Both are licensed under the SIL Open Font License 1.1, and the full text is in `OFL.txt`. They were subset to basic Latin and converted to WOFF2.
- Code © 2026 Daniela Madrid, MS, CCC-SLP. All rights reserved unless a license is added.

## Publish on GitHub Pages

1. Create a **public** repository named `s-blends`.
2. Upload all the files in this folder to the root of the repository, on the `main` branch.
3. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**.
4. After about 1 to 2 minutes, the page is live at `https://dcmadrid.github.io/s-blends/` (one word: `https://dcmadrid.github.io/s-blends/?w=star`).

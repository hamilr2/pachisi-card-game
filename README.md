# Pachisi Card Game

An implementation of a [Cross-and-Circle](https://en.wikipedia.org/wiki/Cross_and_circle_game) game using cards for movement, which is similar to other games like [Sorry](https://en.wikipedia.org/wiki/Sorry!_(game)), [Trouble](https://en.wikipedia.org/wiki/Trouble_(board_game)), [Mensch ärgere Dich nicht](https://en.wikipedia.org/wiki/Mensch_%C3%A4rgere_Dich_nicht), [Parcheesi](https://en.wikipedia.org/wiki/Parcheesi), but played with a hand of cards instead of dice. The cards and graphics of this implementation are based on the retail version of the popular Swiss card game Dog, as published by Schmidt Spiele. An English version of the rules of the game can be found [here](http://www.dogspiel.info/images/pdfs/regeln/rules.pdf). More information on the game, including its history and other variants, can be found [here](http://www.dogspiel.info/index.php).

This project offers solo play vs bots and online play with other humans and/or bots.

## Dependencies
* Node / NPM
* Firebase (optional)

## Basic Usage
* Run `npm install`
* Copy and rename `/src/environments/environment.prod.copy.ts` to remove `.copy`.
* Copy and rename _again_ to remove `.prod` (or run `ng build --prod`)
* Optionally, to play/host games online, create a new Firebase project, enable Real Time Database, and set the url in the environment to your project
* Start the app with `ng serve`
* Navigate to http://localhost:4200.

## Further Notes
* The online version of this game currently uses Firebase's Real-time Database. Permissions are not in place -- only input validation is performed. This means anyone can change anyone's game, or see other players cards while games are in progress. Eventually, this could/should be moved to either Firebase Custom Functions or a dedicated Node.js server.
* The game can be easily deployed to Firebase static hosting
* The core game logic is under test; component tests are stubbed out. Tests can be run with `ng test`.

## Todo List

**Bold** items are intended for release 0.1.

#### Cards
* ~~ Burning Seven ~~
* ~~ Swap ~~
* ~~ Joker -- selection of Burning Seven / Swap ~~

#### Game Logic
* ~~ No passing other home players ~~
* ~~ Send to Home (possibly even own piece) ~~
* ~~ In-goal movement (no -4?) ~~
* ~~ No jumping over pieces in home ~~
* ~~ Pre-round card swap ~~
* ~~ Victory condition detection ~~
* ~~ Rotate starting player clockwise each round ~~

#### Game Variants
* If cannot make move, sit out
* Play with teams -- play _as_ partner after one finishes
* 6 player board
* 2, 3, 5 player solo - show hand on discard

#### Bot AI
* Fix Burning implementation
* Better selection of Card
* Better selection of Piece
* Card Swap

#### Remote Logic
* **Select player when joining**
* Updating of online status in game and in lobbies
* Auto-bot
* Become Host

#### Interface
* **Edit player name**
* Game options on creation (deck, players, rules)
* Make player bot / take turn for player
* **Home screen game deletion**
* **Expandable Activity Log (and persistence)**

#### Graphics
* Card Button re-work
* Burning Seven special treatment
* Pre-animate own card plays/discards to eliminate lag
* Animate away cards from hand
* Animate dealing
* Animate piece movement animations (and game-sync)
* Animate swap
* 3D view
* More obvious piece/space selection
* Home screen re-style

#### Onboarding
* Tutorial

#### Development
* More Test Cases
* ~~ Clean up component test warnings ~~

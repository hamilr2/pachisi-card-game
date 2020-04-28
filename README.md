# Dog

An implementation of the popular Swiss card game Dog, which is similar to other [Cross-and-Circlce](https://en.wikipedia.org/wiki/Cross_and_circle_game) games like [Sorry](https://en.wikipedia.org/wiki/Sorry!_(game)), [Trouble](https://en.wikipedia.org/wiki/Trouble_(board_game)), [Mensch ärgere Dich nicht](https://en.wikipedia.org/wiki/Mensch_%C3%A4rgere_Dich_nicht), [Parcheesi](https://en.wikipedia.org/wiki/Parcheesi), or [Pachisi](https://en.wikipedia.org/wiki/Pachisi), but played with a hand of cards instead of dice. The cards and graphics of this implementation are based on the retail version released by Schmidt Spiele. An English version of the rules of the game can be found [here](http://www.dogspiel.info/images/pdfs/regeln/rules.pdf). More information on the game, including its history and other variants, can be found [here](http://www.dogspiel.info/index.php).

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
* The online version of this game makes use (abuses?) Firebase's Real-time Database. Because the game does not implement auth, it required full read/write access to a Firebase instance, which is a security issue. Online play therefore should not be enabled in a production enironment. Ideally / Eventually the server code will be moved to either a dedicated Node server, or Firebase functions.
* The game can be easily deployed to Firebase static hosting
* The core game logic is under test; component tests are stubbed out. Tests can be run with `ng test`.


## Todo List

#### Cards
* ~~ Burning Seven ~~
* ~~ Swap ~~
* ~~ Joker -- selection of Burning Seven / Swap ~~

#### Game Logic
* ~~ No passing other home players ~~
* ~~ Send to Home (possibly even own piece) ~~
* ~~ In-goal movement (no -4?) ~~
* No jumping over pieces in home
* Pre-round card swap
* Victory condition detection
* Rotate starting player clockwise each round

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
* Select player when joining
* Updating of online status in game and in lobbies
* Auto-bot
* Become Host

#### Interface
* Edit player name
* Game options on creation (deck, players, rules)
* Make player bot / take turn for player
* Home screen game deletion
* Expandable Activity Log (and persistence)

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

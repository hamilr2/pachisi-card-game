# Dog

An implementation of the popular Swiss card game Dog. The cards and graphics of this implementation are based on the retail version released by Schmidt Spiele. An English version of the rules of the game can be found [here](http://www.dogspiel.info/images/pdfs/regeln/rules.pdf). More information on the game, including its history and other variants, can be found [here](http://www.dogspiel.info/index.php).

The online version of this game makes use (abuses?) Firebase's Real-time Database until a Node back-end is written.

## Todo List

#### Cards
* Burning Seven
* Swap
* Joker -- selection of Burning Seven

#### Game Logic
* No passing other home players
* Send to Home (possibly even own piece)
* In-goal movement (no -4?)
* Pre-round card swap
* Victory condition detection
* Rotate starting player clockwise each round

#### Game Variants
* If cannot make move, sit out
* Play with teams -- play _as_ partner after one finishes
* 6 player board
* 2, 3, 5 player solo - show hand on discard

#### Bot AI
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
* Make player bot / take turn for player
* Home screen game deletion
* Expandable Activity Log (and persistence)

#### Graphics
* Piece movement animations (and game-sync)
* Swap animation
* Burning Seven special treatment
* Pre-animate own card plays/discards to eliminate lag
* 3D view
* More obvious piece/space selection
* Home screen re-style

#### Onboarding
* Tutorial

#### Development
* Tests

## Leftover Angular CLI auto-gen stuff

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

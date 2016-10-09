'use strict';

class Game extends React.Component {
    constructor(options) {
        super(options);
        let self = this;
        let widthGame = 10;
        let heightGame = 20;

        self._world = new World({
            width: widthGame,
            height: heightGame
        });

        self._pile = new Pile({
            sizeCompletedRow: widthGame
        });

        self._piece = new Piece({
            startingX: Math.floor(widthGame / 2)
        });

        self._score = 0;

        self._moveDown = 'MOVE_DOWN';
        self._moveRight = 'MOVE_RIGHT';
        self._moveLeft = 'MOVE_LEFT';
        self._rotate = 'ROTATE';

        self.state = {
            blocks: [],
            isGameOver: false
    }
        ;

        self._initializeEvent();
        self.startGame();
    }

    updateBlocks() {
        let self = this;
        let worldBlock = self._world.getBlocks();
        let pileBlock = self._pile.getBlocks();
        let pieceBlock = self._piece.getBlocks();

        let blocks = [...Game._renderSet(worldBlock),
            ...Game._renderSet(pileBlock),
            ...Game._renderPieceSet(pieceBlock)];

        if (blocks == null) {
            throw new Error('block is null');
        }

        self.setState({
            blocks: blocks
        });
    }

    startGame() {
        let self = this;
        let speed = 500;
        self._piece.generateNewPiece();
        setInterval(()=> {
            if (self.state.isGameOver === false) {
                self.executeNextGravityStep(self._moveDown);
                self.updateBlocks();
            }
        }, 200);
    }

    executeNextGravityStep(action) {
        let self = this;
        if (self._piece.isNextActionValid(action, self._world, self._pile) == true) {
            self._piece.applyAction(action);
        }
        else {
            if (action == 'MOVE_DOWN') {
                if (self._piece.isTouching(self._pile) === true &&
                    self._pile.isPileReachingTop(self._world) === false) {
                    self._pile.aggregatePiece(self._piece);
                    self._updateScore(self._pile.getCompletedRow());
                    self._piece.generateNewPiece();
                }
                else {
                    self.setState({
                        isGameOver: true
                    });
                    // throw 'The game over is over';
                }
            }
            else {
                //do nothing
            }
        }
    }

    _initializeEvent() {
        let self = this;
        document.addEventListener('keydown', function (event) {
            event.preventDefault();
            if (event.keyCode === 37) {
                self.executeNextGravityStep(self._moveLeft);
                self.updateBlocks();
            }
            if (event.keyCode === 39) {
                self.executeNextGravityStep(self._moveRight);
                self.updateBlocks();
            }
            if (event.keyCode === 32) {
                self.executeNextGravityStep(self._rotate);
                self.updateBlocks();
            }
        }, false);
    }

    _updateScore(nbCompletedRow) {
        let self = this;
        if(nbCompletedRow === 0){
            self._score = self._pile.getCompletedRow() * 10 ;
        }
        else {
            self._score = self._pile.getCompletedRow() * 10 + Math.floor(30 * Math.log(nbCompletedRow));
        }
    }

    static _renderSet(set) {
        if (set == null) {
            throw new Error('set is null');
        }
        return [...set].map(x => {
            return <rect id={'id_' + x.getY() +'_' + x.getX()} x={ x.getX() + 'em'}
                         y={ x.getY() + 'em'} width='1em' height='1em'
                         style={{fill: x.getColor(), stroke: 'black',strokeWidth: '0.01',rx: 0.1}}>1</rect>;
        });
    }

    static _renderPieceSet(set) {
        if (set == null) {
            throw new Error('set is null');
        }
        return [...set].map(x => {
            return <rect id={'id_' + x.getY() +'_' + x.getX()}
                         x={x.getX() + 'em'}
                         y={x.getY() + 'em'}
                         width='1em' height='1em'
                         style={{fill: x.getColor(), stroke: 'black',strokeWidth: '0.01',rx: 0.1}}>1</rect>;
        });
    }

    render() {
        let self = this;

        let blocks = self.state.blocks;
        let cssClassIsGameOver = 'itsOverClass';
        if (self.state.isGameOver == true) {
            cssClassIsGameOver = 'itsOverClass visible';
        }

        return <div>
            <h3>Your score : {self._score}</h3>
            <div className={cssClassIsGameOver}>
                <span className="title">Game over !!!</span>
            </div>
            <svg style={{border: '1px solid black', width: '160px', height: '320px'}}>
                {blocks}
            </svg>
        </div>;
    }
}

window.Game = Game;
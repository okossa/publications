'use strict';

class Piece {
    constructor(options) {
        let self = this;

        if (options.startingX != null) {
            self._startingPosition = options.startingX;
        }
        else {
            self._startingPosition = 0;
        }

        self._x = 0;
        self._y = 0;
        self._color = null;
        self._pieceMatrixShape = [];
    }

    generateNewPiece() {
        let self = this;
        self._pieceMatrixShape = Piece._generateRandomMatrix();
        self._color = Piece._generateRandomColor();
        self._x = self._startingPosition;
        self._y = 0;
    }

    applyAction(action) {
        if (action == null) {
            throw new Error('action is null');
        }
        let self = this;
        switch (action) {
            case 'MOVE_DOWN':
                self._moveDownPiece();
                break;

            case 'MOVE_LEFT':
                self._moveLeftPiece();
                break;

            case 'MOVE_RIGHT':
                self._moveRightPiece();
                break;

            case 'ROTATE':
                self._rotatePiece();
                break;
        }
    }

    //try move down, try move left , try move right, try rotate
    
    isNextActionValid(action, world, pile) {
        let self = this;
        let y = self._y;
        let x = self._x;
        let color = self._color;
        let shape = self._pieceMatrixShape;

        switch (action) {
            case 'MOVE_DOWN':
                y = y + 1;
                break;

            case 'MOVE_LEFT':
                x = x - 1;
                break;

            case 'MOVE_RIGHT':
                x = x + 1;
                break;

            case 'ROTATE':
                shape = Piece._rotateMatrix(shape);
                break;
        }

        let futurePieceBlocks = Piece._castToBlockSet(shape, x,y, color);
        let pileBlocks = pile.getBlocks();
        let worldBlocks = world.getBlocks();

        let isPileTouchingPiece = futurePieceBlocks.filter(pieceElem => {
                // is there a block inside piece and pile
                let intersectingElements = pileBlocks.filter(pileElem =>
                pileElem.getX() == pieceElem.getX() && pileElem.getY() == pieceElem.getY());

                return intersectingElements.length > 0;
            }).length > 0;


        let elementNotInPieceNotInWorld = futurePieceBlocks.filter(pieceElem => {
            let outsideElem = worldBlocks.filter(worldElem =>
            worldElem.getX() == pieceElem.getX() && worldElem.getY() == pieceElem.getY());
            return outsideElem.length == 0;
        });
        let isThePieceContainedInTheWorld = elementNotInPieceNotInWorld.length == 0;

        return !isPileTouchingPiece && isThePieceContainedInTheWorld;
    }

    isTouching(pile) {
        let self = this;
        return true;
        // return false;
    }

    getBlocks() {
        let self = this;
        let blocks = Piece._castToBlockSet(self._pieceMatrixShape, self._x, self._y, self._color);
        return blocks;
    }

    _rotatePiece() {
        let self = this;
        self._pieceMatrixShape = Piece._rotateMatrix(self._pieceMatrixShape);
    }

    _moveDownPiece() {
        let self = this;
        self._y = self._y + 1;
    }

    _moveRightPiece() {
        let self = this;
        self._x = self._x + 1;
    }

    _moveLeftPiece() {
        let self = this;
        self._x = self._x - 1;
    }

    static _castToBlockSet(shape, x, y, color) {
        let i, j;
        let blockSet = [];
        for (j = 0; j < shape.length; j++) {
            for (i = 0; i < shape[j].length; i++) {
                if (shape[j][i] == 1) {
                    blockSet.push(new Block({
                        color: color,
                        y: j + y,
                        x: i + x
                    }));
                }
            }
        }
        return blockSet;
    }

    static _rotateMatrix(matrix) {
        matrix = Piece._transpose(matrix);
        matrix = Piece._reverseRows(matrix);
        return matrix;
    }

    static _generateRnd(maxBoundLimit) {
        return Math.floor((Math.random() * maxBoundLimit) + 1) - 1;
    }

    static _transpose(matrix) {
        let result = new Array(matrix[0].length);
        let i;
        for (i = 0; i < matrix[0].length; i++) {
            result[i] = new Array(matrix.length - 1);
            let j;
            for (j = matrix.length - 1; j > -1; j--) {
                result[i][j] = matrix[j][i];
            }
        }
        return result;
    }

    static _reverseRows(matrix) {
        return matrix.reverse();
    }

    static _transposeRnd(m) {
        return Piece._generateRnd(2) == 1 ? Piece._transpose(m) : m;
    }

    static _generateRandomMatrix() {
        return (Piece._transposeRnd([
            [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]],  //bar
            [[1, 1], [1, 1]], //square
            [[1, 0, 0], [1, 1, 0], [1, 0, 0]], //T,
            [[1, 0, 0], [1, 0, 0], [1, 1, 0]], //L
            [[1, 1, 0], [0, 1, 1], [0, 0, 0]] //s
        ][Piece._generateRnd(5)]));
    }

    static _generateRandomColor() {
        return ["#181818", "#585858", "#D8D8D8", "#AB4642",
            "#DC9656", "#F7CA88", "#A1B56C", "#86C1B9",
            "#7CAFC2", "#BA8BAF", "#A16946"][Piece._generateRnd(10)];
    }

}

window.Piece = Piece;

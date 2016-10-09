'use strict';

class Pile {
    constructor(options) {
        let self = this;
        console.log(self);
        if (options.sizeCompletedRow == null) {
            throw new Error('sizeCompletedRow is required');
        }
        self._sizeCompletedRow = options.sizeCompletedRow;
        self._nbCompletedRow = 0;
        self._blockSet = [];
        self._empty = '_';
    }

    getBlocks() {
        let self = this;
        return self._blockSet;
    }

    aggregatePiece(piece) {
        if (piece == null) {
            throw new Error('piece is null');
        }
        let self = this;
        let pieceBlocks = piece.getBlocks();
        let pileBlocks = self._blockSet;
        self._blockSet = [...pileBlocks, ...pieceBlocks];
        let tempMatrix = Pile._castBlockSetToMatrix(self._blockSet, self._sizeCompletedRow, self._empty);
        let completedRow = Pile._countCompletedLine(tempMatrix, self._sizeCompletedRow, self._empty);
        let newMatrix = Pile._removeCompleteLine(tempMatrix, self._sizeCompletedRow, self._empty);
        newMatrix = Pile._translatePileToTheBack(newMatrix, self._sizeCompletedRow, self._empty, completedRow);
        self._blockSet = Pile._castMatrixToBlockSet(newMatrix, self._empty);
        self._nbCompletedRow = self._nbCompletedRow + completedRow;
    }

    isPileReachingTop(world) {
        let self = this;
        let blocksTouchingTheTop = self._blockSet.filter(b => b.getY() === 0);
        return blocksTouchingTheTop.length > 0;
    }

    getCompletedRow() {
        let self = this;
        return self._nbCompletedRow;
    }


    static _castBlockSetToMatrix(blockSet, _sizeCompletedRow, emptyElement) {
        let maxY = 0;
        blockSet.map(b => {
            if (b.getY() > maxY) {
                maxY = b.getY();
            }
        });

        let matrix = [];
        let i, j;
        for (j = 0; j < maxY + 1; j++) {
            let row = [];
            for (i = 0; i < _sizeCompletedRow + 1; i++) {
                row.push(emptyElement);
            }
            matrix.push(row);
        }
        blockSet.map(b => {
            matrix[b.getY()][b.getX()] = b.getColor();
        });
        return matrix;
    }

    static _castMatrixToBlockSet(matrix, emptyElement) {
        let i, j;
        let blockSet = [];
        for (j = 0; j < matrix.length; j++) {
            for (i = 0; i < matrix[j].length; i++) {
                if (matrix[j][i] != emptyElement) {
                    blockSet.push(new Block({
                        x: i,
                        y: j,
                        color: matrix[j][i]
                    }));
                }
            }
        }
        return blockSet;
    }

    static _countCompletedLine(matrix, widthCompleteLine, emptyElement) {
        let completedRow = matrix.filter(line => line.reduce((total, y) => {
            if (y != null && y != emptyElement) {
                total = total + 1;
            }
            return total;
        }, 0) == widthCompleteLine);
        return completedRow.length;
    }

    static _removeCompleteLine(matrix, widthCompleteLine, emptyElement) {
        let newMatrix = matrix.filter(line => line.reduce((total, y) => {
            if (y != null && y != emptyElement) {
                total = total + 1;
            }
            return total;
        }, 0) < widthCompleteLine);
        return newMatrix;
    };

    static _translatePileToTheBack(matrix, widthCompleteLine, emptyElement, nbCompletedLine) {
        let k, i;
        for (k = 0; k < nbCompletedLine; k++) {
            let row = [];
            for (i = 0; i <= widthCompleteLine; i++) {
                row.push(emptyElement);
            }
            matrix = [row, ...matrix];
        }
        return matrix;
    }
}

window.Pile = Pile;
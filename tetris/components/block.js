'use strict';

class Block{
    constructor(options){
        let self = this;
        if(options.x == null){
            throw new Error('x is null');
        }

        if(options.y == null){
            throw new Error('y is null');
        }

        if(options.color == null){
            throw new Error('color is null');
        }
        
        self._x = options.x;
        self._y = options.y;
        self._color = options.color;
    }

    getX(){
        let self = this;
        return self._x;
    }

    getY(){
        let self = this;
        return self._y;
    }

    getColor(){
        let self = this;
        return self._color;
    }
}

window.Block = Block;
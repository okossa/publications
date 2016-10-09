'use strict';

class World{
    constructor(options){
        let self = this;
        if(options.width == null){
            throw new Error('width is null');
        }
        if(options.height == null){
            throw new Error('height is null');
        }
        self._width = options.width;
        self._height = options.height;
        self._blocks = [];
        let _color = 'snow';

        let i,j;
        for(j = 0; j < self._height; j++){
            for(i = 0; i < self._width; i++){
               self._blocks.push(new Block({
                   color: _color,
                   y: j,
                   x: i
               }));
            }
        }
    }

    getBlocks() {
        let self = this;
        return self._blocks;
    }
}

window.World = World;
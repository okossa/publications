'use strict';

class LayoutManager{
    constructor(options){
       let self = this;
        if (options.widthSvgContainer == null) {
            throw new Error('options.widthSvgContainer is null');
        }

        if (options.heightSvgContainer == null) {
            throw new Error('options.heightSvgContainer  is null');
        }

        if (options.nodes == null) {
            throw new Error('options.nodes is null');
        }

        self._nodes = options.nodes;
        self._widthSvgContainer = options.widthSvgContainer;
        self._heightSvgContainer = options.heightSvgContainer;
        self._selectedLayout = null;
        self.selectLayout('CIRCULAR_LAYOUT')
    }

    selectLayout(layoutName){
       let self = this;

        switch (layoutName){
            case 'CIRCULAR_LAYOUT':
                self._selectedLayout = new CircularLayout({
                    widthSvgContainer: self._widthSvgContainer,
                    heightSvgContainer: self._heightSvgContainer,
                    nodes: self._nodes,
                    putSalesInside: true
                });
                break;
            
            case 'GROUP_LAYOUT':
                self._selectedLayout = new GroupLayout({
                    widthSvgContainer: self._widthSvgContainer,
                    heightSvgContainer: self._heightSvgContainer,
                    nodes: self._nodes
                });
                break;

            case 'CLUSTERED_LAYOUT':
                self._selectedLayout = new ClusteredLayout({
                    widthSvgContainer: self._widthSvgContainer,
                    heightSvgContainer: self._heightSvgContainer,
                    nodes: self._nodes
                });
                break;
            
            default:
                throw 'selectLayout: Invalid layout name ' + layoutName;
                break;
        }
    }

    getNodes() {
        let self = this;
        return self._selectedLayout.getNodes();
    }

    reorganizeNodePosition(){
       let self = this;
       self._selectedLayout.reorganizeNodePosition();
    }
}
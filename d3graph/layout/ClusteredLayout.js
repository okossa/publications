'use strict';

class ClusteredLayout {
    constructor(options) {
        let self = this;
        if (options.widthSvgContainer == null) {
            throw new Error('options.widthSvgContainer is null');
        }

        if (options.heightSvgContainer == null) {
            throw new Error('options.heightSvgContainer is null');
        }

        if (options.nodes == null) {
            throw new Error('options.nodes is null');
        }

        if (options.putSalesInside == true) {
            self._putSalesInside = true;
        }
        else {
            self._putSalesInside = false;
        }

        self._nodes = options.nodes;
        self._widthSvgContainer = options.widthSvgContainer;
        self._heightSvgContainer = options.heightSvgContainer;
    }

    reorganizeNodePosition() {
        let self = this;
        // clusterize nodes
    }

    getNodes() {
        let self = this;
        return self._nodes;
    }
}

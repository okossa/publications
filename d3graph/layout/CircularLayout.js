'use strict';

class CircularLayout {
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
        let centerWidth = self._widthSvgContainer / 2;
        let centerHeight = self._heightSvgContainer / 2;
        let innerNodeList = self._nodes.filter(node => node.getNode().team == 'A');
        let outerNodeList = self._nodes.filter(node => node.getNode().team != 'A');
        let innerRadius = 50;
        let outsideRadius = 300;

        if (self._putSalesInside == true) {
            CircularLayout._setCircularPositionForNodes(innerNodeList,
                innerRadius, true, centerWidth, centerHeight);

            CircularLayout._setCircularPositionForNodes(outerNodeList,
                outsideRadius, false, centerWidth, centerHeight);
        } else {
            CircularLayout._setCircularPositionForNodes(innerNodeList,
                outsideRadius, false, centerWidth, centerHeight);

            CircularLayout._setCircularPositionForNodes(outerNodeList,
                innerRadius, true, centerWidth, centerHeight);
        }
    }

    getNodes() {
        let self = this;
        return self._nodes;
    }

    static _setCircularPositionForNodes(nodesList, radius, isFixed, centerWidth, centerHeight) {
        nodesList.map(node => {
            let rndAngle = CircularLayout._getRndAngle();
            let position = CircularLayout._setCircularCoord(rndAngle, radius, centerWidth, centerHeight);
            node.setX(position.x);
            node.setY(position.y);
            node.setIsFixed(false);
        });
    }

    static _getRndAngle() {
        return Math.floor(Math.random() * 360);
    }

    static _setCircularCoord(angle, radius, centerX, centerY) {
        return {
            x: centerX + (radius * Math.cos(angle)),
            y: centerY + (radius * Math.sin(angle))
        }
    }
}

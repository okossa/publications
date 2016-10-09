'use strict';

class GroupLayout {
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

        self._nodes = options.nodes;
        self._widthSvgContainer = options.widthSvgContainer;
        self._heightSvgContainer = options.heightSvgContainer;
        self._team = [{x: 30, y: 50}, {x: 580, y: 450}, {x: 30, y: 450}, {x: 580, y: 50}];
    }

    reorganizeNodePosition() {
        let self = this;
        self._nodes.map(node => {
            let rndTeam = Math.floor(Math.random() * 4);
            GroupLayout._setNodesToZone(node, self._team[rndTeam]);
        });
    }

    getNodes() {
        let self = this;
        return self._nodes;
    }

    static _setNodesToZone(node, team) {
        node.setIsFixed(false);
        node.setX(team.x);
        node.setY(team.y);
    }
}
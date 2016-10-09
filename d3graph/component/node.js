'use strict';

class Node {
    constructor(options) {
        let self = this;
        if (options.nodeData == null) {
            throw 'Node: constructor nodeData is null';
        }
        self._node = options.nodeData;
        self._initialize(self._node.associatedLinks);

        if (options.onMouseOverCallback !== null) {
            self._onMouseOverCallback = options.onMouseOverCallback;
        }

        if (options.onMouseOutCallback !== null) {
            self._onMouseOutCallback = options.onMouseOutCallback;
        }
    }

    _initialize(_links) {
        let self = this;
        // initialize nodes
        let _nodes = [];
        _links.map(x => {
            if (_nodes.filter(y => y == x.source.id).length == 0 && self._node.id !== x.source.id) {
                _nodes.push(x.source.id);
            }
            if (_nodes.filter(y => y == x.target.id).length == 0 && self._node.id !== x.target.id) {
                _nodes.push(x.target.id);
            }
        });
        self._linkedNodes = _nodes;
        self._linkedLinks = _links.map(link => link.id);
    }

    _initializeEvents() {
        let self = this;
        let el = document.getElementById(self._node.id);

        el.addEventListener('mouseover', () => {
            [...document.querySelectorAll('.node, .link')]
                .map(x => {
                    x.classList.remove('highlight');
                    x.classList.add('fade-element');
                });
            el.classList.add('highlight');
            self._linkedNodes.map(n => (document.getElementById(n)).classList.add('highlight'));
            self._linkedLinks.map(n => (document.getElementById(n)).classList.add('highlight'));

            if (self._onMouseOverCallback !== null) {
                self._onMouseOverCallback(self.getNodeData());
            }

        }, false);

        el.addEventListener('mouseout', () => {
            [...document.querySelectorAll('.node, .link')].map(x => {
                x.classList.remove('highlight');
                x.classList.remove('fade-element');
            });

            if (self._onMouseOutCallback !== null) {
                self._onMouseOutCallback(self.getNodeData());
            }
        });
    }

    getId() {
        let self = this;
        return self._node.id;
    }

    getNode() {
        let self = this;
        return self._node;
    }

    getNodeData() {
        let self = this;
        let data = '<p> <span> Node <b>' + self._node.id + ' </b> </span> ' +
            '<span>connected with </span><ul>';
        self._linkedNodes.map(n => {
            data = data + '<li>' +n + '</li>'
        });
        data = data + '</ul> </p>';
        return data;
    }

    bind(attachedItem) {
        let self = this;
        Helper.throwErrorIfNull('Node bind', 'attachedItem', attachedItem);
        self._attachedItem = attachedItem;
        self._initializeEvents();
    }

    setIsFixed(isFixed) {
        let self = this;
        if (isFixed !== true && isFixed !== false) {
            throw 'node:setFixed: isFixed is null';
        }
        self._attachedItem.fixed = isFixed;
    }

    getX() {
        let self = this;
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        return self._attachedItem.targetX;
    }

    setX(xPosition) {
        let self = this;
        if (xPosition == null && xPosition != 0) {
            throw 'Node: setX xPosition is null';
        }
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        self._attachedItem.targetX = xPosition;
    }

    getY() {
        let self = this;
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        return self._attachedItem.targetY;
    }

    setY(yPosition) {
        let self = this;
        if (yPosition == null && yPosition != 0) {
            throw 'Node: setY yPosition is null';
        }
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        self._attachedItem.targetY = yPosition;
    }

    getFixedX() {
        let self = this;
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        return self._attachedItem.px;
    }

    getFixedY() {
        let self = this;
        if (self._attachedItem == null) {
            throw 'Node need to be bind first'
        }
        return self._attachedItem.py;
    }

    setFixedX(xPosition) {
        let self = this;
        if (xPosition == null && xPosition != 0) {
            throw 'Node: setFixedX xPosition is null';
        }
        self._attachedItem.px = xPosition;
    }

    setFixedY(yPosition) {
        let self = this;
        if (yPosition == null && yPosition != 0) {
            throw 'Node: setFixedY yPosition is null';
        }
        self._attachedItem.py = yPosition;
    }

}
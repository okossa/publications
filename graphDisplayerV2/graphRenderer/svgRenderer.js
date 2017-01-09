'use strict';

class SVGRenderer {
    constructor(options) {
        if(!options.renderId) throw 'render id is required';
        this._renderId = options.renderId;
        this._svg = document.getElementById(options.containerId);
        this._translationX = options.translationX || 0;
        this._translationY = options.translationY || 0;
        this._visibility = true;
        this._CENTER_WIDTH = 500;
        this._CENTER_HEIGHT = 500;
        this._htmlNodeElementHighlighted = [];
        this._htmlLinkElementHighlighted = [];

        this.activateCustomInfo = options.activateCustomInfo || false;

        this._renderedNodeToClean = [];

        if (options.defaultVisibility == false) {
            this.hide();
        }
        else {
            this.show();
        }

        if (options.onNodeClick) {
            this._onNodeClick = options.onNodeClick;
        }

        if (options.onNodeOver && options.onNodeOut) {
            this._onNodeOver = options.onNodeOver;
            this._onNodeOut = options.onNodeOut;
        }

    }

    show() {
        this._visibility = true;
        this._svg.classList.add('visible');
    }

    hide() {
        this._visibility = false;
        this._svg.classList.remove('visible');
    }

    findAssociatedRenderedLinks(nodeId) {
        let links = [...document.querySelectorAll('line')].filter(link => {
            return link.getAttribute('target_id') == nodeId || link.getAttribute('source_id') == nodeId;
        });
        return links
    }

    isVisible() {
        return this._visibility;
    }

    setNodes(nodes, links) {
        this._nodes = nodes;
        this._links = links;
    }

    setCentralNode(node) {
        if (node) {
            console.log('setting central node');
            this._centralNode = node;
            this._centralNode.isCentralNode = true;
            this._centralNode.fx = this._CENTER_WIDTH;
            this._centralNode.fy = this._CENTER_HEIGHT;
        }
    }

    unsetCentralNode() {
        if (this._centralNode) {
            console.log('unsetting central node');
            this._centralNode.isCentralNode = false;
            this._centralNode.fixed = false;
            this._centralNode.fx = null;
            this._centralNode.fy = null;
            this._centralNode = null;
        }
    }

    render() {
        console.log('rendering nodes: ' + this._nodes.length + ' links : ' + this._links.length);
        this._links.map(link => this._renderLink(link));
        this._nodes.map(node => this._renderNode(node));

        // if(this._renderedNodeToClean.length == 0){
        //     this._renderedNodeToClean = this._nodes;
        // }
    }

    clear() {
        this._svg.innerHTML = '';

        let fieldName = this._renderId + '_svgNode';
        this._renderedNodeToClean.map( x => {
            x[fieldName] = null;
        })
        this._renderedNodeToClean = [];
    }

    highlight(nodeList,linkList) {
        if (this._htmlNodeElementHighlighted.length == 0) {
            nodeList.map(element => {
                if (element._svgNode) {
                    element._svgNode.classList.add('highlight');
                    this._htmlNodeElementHighlighted.push(element._svgNode);
                }
            });
        }

        if (this._htmlLinkElementHighlighted.length == 0) {
            linkList.map(x => {
                x.classList.add('highlight')
                this._htmlLinkElementHighlighted.push(x);
            })
        }
    }

    unhighlight() {
        this._htmlNodeElementHighlighted.map(htmlNode => htmlNode.classList.remove('highlight'));
        this._htmlLinkElementHighlighted.map(x => x.classList.remove('highlight'));
        this._htmlNodeElementHighlighted.length = 0;
        this._htmlLinkElementHighlighted.length = 0;
    }

    _renderNode(node) {
        let fieldName = this._renderId + '_svgNode';
        let elem = node[fieldName];
        if (elem == null) {
            elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

            //saving node for later
            node[fieldName] = elem;

            //setting setting size
            if (node.size) {
                elem.setAttribute('r', 3 * Math.floor(node.size / 10));
            }
            else {
                elem.setAttribute('r', '1');
            }

            elem.setAttribute('stroke', 'black');

            //settings id
            elem.setAttribute('immersionId', node.id);

            //setting color
            if (node.team == 'teamB') {
                elem.setAttribute('fill', 'red');
            } else {
                elem.setAttribute('fill', 'blue');
            }

            elem.setAttribute('stroke-width', '1');
            this._svg.appendChild(elem);

            //setting events
            if (this._onNodeClick) {
                elem.addEventListener('click', () => {
                    this._onNodeClick(node);
                });
            }

            if (this._onNodeOver) {
                elem.addEventListener('mouseover', () => {
                    this._onNodeOver(node);
                });
                elem.addEventListener('mouseout', () => {
                    this._onNodeOut(node);
                });
            }
        }

        elem.setAttribute('cx', node.x + this._translationX);
        elem.setAttribute('cy', node.y + this._translationY);

        this._renderedNodeToClean.push(node);

    }

    _renderLink(link) {
        let fieldName = this._renderId + '_svgLink';
        let elem = link[fieldName];
        if (elem == null) {
            elem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            link[fieldName] = elem;

            elem.setAttribute('stroke', 'gray');
            elem.setAttribute('target_id', link.target.id);
            elem.setAttribute('source_id', link.source.id);
            elem.setAttribute('stroke-width', '1');
            this._svg.appendChild(elem);
        }

        elem.setAttribute('x1', link.source.x + this._translationX);
        elem.setAttribute('y1', link.source.y + this._translationY);
        elem.setAttribute('x2', link.target.x + this._translationX);
        elem.setAttribute('y2', link.target.y + this._translationY);
    }
}

window.SVGRenderer = SVGRenderer;

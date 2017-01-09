'use strict';

class Application {
    constructor(options) {
        if (options.immersionTree == null) {
            throw 'immersionTree is required';
        }
        this._immersionTree = options.immersionTree;

        if(options.progressContainerId){
            this._progressContainer = document.getElementById(options.progressContainerId);
        }
        this._svgRenderer = null;

        this._initialize();
    }

    //public
    
    getGroup(){
        return this._immersionTree.getGroups();
    }

    filterGroup(){

    }

    highlight(nodeId) {
        console.log('highlighting node ' + nodeId);
        let firstNodeWeFound = this._immersionTree.getNodes().filter(x => {
            return x.id.indexOf(nodeId) >= 0;
        })[0];
        console.log(firstNodeWeFound);
        this._onHighlightNode(firstNodeWeFound);

    }

    activateCluster(){
        let nodes = this._immersionTree.getNodes();
        let links = this._immersionTree.getLinks();
        this._activateCluster(nodes, links);
    }

    activateRadial(){
        let nodes = this._immersionTree.getNodes();
        let links = this._immersionTree.getLinks();
        this._activateRadial(nodes, links);
    }




    //private

    _initialize() {
        this._mainForceLayoutMgr = new ForceLayoutManagerV2();
        this._detailsForceLayoutMgr = new ForceLayoutManagerV2();

        this._svgRenderer = new SVGRenderer({
            renderId: 'mainRenderer',
            containerId: 'mainSVG',
            onNodeClick: (node) => {
                this._onHighlightNode(node);
            },

            onNodeOver: (node) => {
                let associatedNodes = this._immersionTree.findAssociatedNode(node);
                let allNodes = [...associatedNodes, node];  //add the node with the associated nodes
                let associatedLinks = this._svgRenderer.findAssociatedRenderedLinks(node.id);
                this._svgRenderer.highlight(allNodes, associatedLinks);
            },
            onNodeOut: () => {
                this._svgRenderer.unhighlight();
            }
        });

        this._detailSvgRenderer = new SVGRenderer({
            renderId: 'miniRenderer',
            containerId: 'mainMiniSVG',
            defaultVisibility: false,
            translationX: -200,
            translationY: -200,
            onNodeClick: (node) => {
                console.log('hiding mini svg...');
                this.currentMiniForce.stop();
                this._detailSvgRenderer.unsetCentralNode();
                this._detailSvgRenderer.hide();
                this._detailSvgRenderer.clear();
                this._svgRenderer.show();
            }
        });
    }

    _activateCluster(nodes, links) {
        this._svgRenderer.clear();
        if (this.currentMainForce != null) {
            this.currentMainForce.stop();
        }
        this.currentMainForce = this._mainForceLayoutMgr.activateCluster(nodes, links,
            (_forceNodes, _forceLinks, _progress) => {
                if(this._progressContainer){
                    this._progressContainer.innerText = _progress + ' %';
                }
                // console.log(_progress);
                // this._svgRenderer.setNodes(nodes, links);
                // this._svgRenderer.render();
            },
            () => {
                console.log('activating cluster layout');
                this._svgRenderer.setNodes(nodes, links);
                this._svgRenderer.render();
            }
        );
    }

    _activateRadial(nodes, links) {
        this._svgRenderer.clear();
        if (this.currentMainForce != null) {
            this.currentMainForce.stop();
        }
        this.currentMainForce = this._mainForceLayoutMgr.activateRadial(nodes, links,
            (_forceNodes, _forceLinks, _progress) => {
                if(this._progressContainer){
                    this._progressContainer.innerText = _progress + ' %';
                }
                // console.log(_progress);
                // this._svgRenderer.setNodes(nodes, links);
                // this._svgRenderer.render();
            },
            () => {
                this._svgRenderer.setNodes(nodes, links);
                this._svgRenderer.render();
            }
        );
    }

    _onHighlightNode(node) {
        // this._svgRenderer.hide();
        this.currentMainForce.stop();   //stop the force on the first svg, to start the new one on the over svg

        //setting central node
        this._detailSvgRenderer.setCentralNode(node);

        //get the nodes associated with the clicked node
        let associatedNodes = this._immersionTree.findAssociatedNode(node);

        //add the node with the associated nodes
        let allNodes = [...associatedNodes, node];

        // get only the links which involve the node clicked
        let associatedLinks =
            this._immersionTree._generateLinks(allNodes)
                .filter(l => l.target.id == node.id || l.source.id == node.id);

        //activate svg renderer
        this._detailSvgRenderer.show();
        this.currentMiniForce = this._detailsForceLayoutMgr.activateClusterCentralNode(allNodes, associatedLinks,
            ()=> {
                this._detailSvgRenderer.setNodes(allNodes, associatedLinks);
                this._detailSvgRenderer.render();
            },
            ()=> {
                this._detailSvgRenderer.setNodes(allNodes, associatedLinks);
                this._detailSvgRenderer.render();
            });
    }


}

window.Application = Application;
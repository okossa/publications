/**
 * Created by okossa on 2016-07-03.
 */

'use strict';

//angular stuff right

class Application{
    constructor(options){
        let self = this;
        Helper.throwErrorIfNull('Application constructor', 'options.width', options.width);
        Helper.throwErrorIfNull('Application constructor', 'options.height', options.height);
        self._width = options.width;
        self._height = options.height;
    }

    load(dataUrl){
        let self = this;
        Helper.throwErrorIfNull('Application Load', 'dataUrl', dataUrl);
        d3.json(dataUrl, function (error, graph) {
            let width = self._width;
            let height = self._height;

            let initializedData = Helper.initializeData(graph.nodes);
            let links = initializedData.links;
            let rawNodes = initializedData.nodes;

            let nodes = rawNodes.map(node => new Node({
                nodeData: node
            }));

            let layoutMgr = new LayoutManager({
                widthSvgContainer: width,
                heightSvgContainer: height,
                nodes: nodes
            });

            let d3Renderer = new D3ViewRenderer({
                svgId: 'mainContainer',
                width: width,
                height: height
            });

            d3Renderer.bind(layoutMgr.getNodes(), links);

            let salesIn = false;
            setInterval(()=> {
                if (salesIn == true) {
                    // layoutMgr.selectLayout('SALES_INSIDE_CLIENT_OUTSIDE');
                    layoutMgr.selectLayout('GROUP_NODE_BY_TEAM');
                }
                else {
                    layoutMgr.selectLayout('CLIENT_INSIDE_SALES_OUTSIDE');
                }
                salesIn = !salesIn;
                layoutMgr.reorganizeNodePosition();
                d3Renderer.render();
            }, 3000);

            layoutMgr.selectLayout('CLIENT_INSIDE_SALES_OUTSIDE');
            layoutMgr.reorganizeNodePosition();
            d3Renderer.render();

            window.nodes = nodes;
        });

    }

    onNodeMouseOver(){
        //highlight links
        //show tooltip
    }

    onNodeClick(){
        //show tooltip
    }

    onSearchInputChange(){
       //filter by search
    }

    onTimeFrameChange(){
       //filter by time
    }
}
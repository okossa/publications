'use strict';

let width = 960;
let height = 500;

// let initializedData = Helper.initializeData(Helper.generateRandomNode(100));

let initializedData = Helper.initializeData(Helper.generateRandomNodeTeamATeamB(100, 10));
let links = initializedData.links;
let rawNodes = initializedData.nodes;

// start tooltip handling
let mainTooltip = document.getElementById('maintooltip');
let mainTooltipVisibleClass = 'visible';

const displayToolTip = (data) => {
    mainTooltip.classList.add(mainTooltipVisibleClass);
    mainTooltip.innerHTML= data;
};

const hideToolTip = (data) => {
    mainTooltip.classList.remove(mainTooltipVisibleClass);
};

// end tooltip handling

let nodes = rawNodes.map(node => new Node({
    nodeData: node,
    onMouseOverCallback: displayToolTip,
    onMouseOutCallback: hideToolTip
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
let alternate = false;
setInterval(()=> {
    if (alternate == true) {
        layoutMgr.selectLayout('GROUP_LAYOUT');
    }
    else {
        layoutMgr.selectLayout('CIRCULAR_LAYOUT');
    }
    alternate = !alternate;
    layoutMgr.reorganizeNodePosition();
    d3Renderer.render();
}, 6000);


layoutMgr.reorganizeNodePosition();
d3Renderer.render();


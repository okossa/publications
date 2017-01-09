'use strict';

//prepare nodes
let arrayOfNodes = DataGenerator.generateXNodes(150);
// let arrayOfNodes = DataGenerator.generateXNodes(1000);
// let arrayOfNodes = DataGenerator.generateXNodes(3000);
// let arrayOfNodes = DataGenerator.generateXNodes(5000);

//create random links
let randomData = DataGenerator.createRandomLinks(arrayOfNodes);

//loading the data three
let immersionTree = new ImmersionTree();
immersionTree.loadRawData(randomData, 'country');

let app = new Application({immersionTree: immersionTree, progressContainerId: 'progress'});

window.activateRadial = () => {
    console.log('activatiing radial');
    app.activateRadial();
};

window.activateCluster = () => {
    console.log('activatiing cluster');
    app.activateCluster();
};

window.search = () => {
    let val = document.getElementById('searchednode').value;
    console.log('searching... ' + val);
    app.highlight(val);
    console.log(app.getGroup());
}



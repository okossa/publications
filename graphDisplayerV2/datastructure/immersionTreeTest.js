'use strict';

const assert = require('assert');
const ImmersionTree = require('./immersionTree.js');

let rawNodes = [
    {id: 1, country: 'FR', data: 'martine', linkedId: [1, 3]},
    {id: 2, country: 'US', data: 'ulysse', linkedId: [4, 1]},
    {id: 3, country: 'US', data: 'john', linkedId: [1, 2, 4, 16]},
    {id: 4, country: 'FR', data: 'bertran', linkedId: [20, 19, 17]},
    {id: 5, country: 'CA', data: 'jones', linkedId: [18, 11, 10, 9, 8, 5, 2]},
    {id: 6, country: 'CA', data: 'allistair', linkedId: [2, 3, 10]},
    {id: 7, country: 'CA', data: 'brock', linkedId: [1, 5, 7, 10, 17]},
    {id: 8, country: 'CA', data: 'michi', linkedId: [2, 3, 11, 6, 9]},
    {id: 9, country: 'GB', data: 'johnathan', linkedId: [12, 13]},
    {id: 10, country: 'FR', data: 'kobe', linkedId: [13, 14]},
    {id: 11, country: 'FR', data: 'lebron', linkedId: [12, 15]},
    {id: 12, country: 'IT', data: 'antanw', linkedId: [20, 21, 2]},
    {id: 13, country: 'IT', data: 'brian', linkedId: [18, 19, 17, 4]},
    {id: 14, country: 'FR', data: 'william', linkedId: [5]},
    {id: 15, country: 'GB', data: 'farid', linkedId: [6]},
    {id: 16, country: 'IT', data: 'mohamed', linkedId: [2]},
    {id: 17, country: 'IT', data: 'marianne', linkedId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]},
    {id: 18, country: 'JP', data: 'marine', linkedId: [14, 13, 10, 11, 12, 9, 8, 7, 6, 5, 4, 3, 2, 1]},
    {id: 19, country: 'AUS', data: 'karington', linkedId: [2, 3]},
    {id: 20, country: 'KR', data: 'christian', linkedId: [4, 7]},
    {id: 21, country: 'CO', data: 'romelo', linkedId: [8, 11]}
];

console.log('starting tests');

// instanciation tests
let imGraph = new ImmersionTree();
assert.ok(imGraph);
// instanciation tests

//node load tests
imGraph.loadRawData(rawNodes, 'country');
console.log('testing node load');
// console.log( imGraph.getNodes().length );

assert(imGraph.getNodes().length == 21);
// assert(imGraph.getNodes().length == 30);
//node load tests

//link load tests
console.log('testing link load');
assert(imGraph.getLinks().length > 70);
//link load tests

//node grouping tests : all
console.log('testing grouping');
// console.log(imGraph.getGroups());
assert.equal(imGraph.getGroups().length, 9);

console.log('testing grouping');

assert.equal(imGraph.getGroups().filter(x => x.id == 'CA')[0].children.length, 4);
// assert.equal(imGraph.getNodes().filter(x => x.id == 'CA')[0].children.length, 4);

//node grouping tests : individual
console.log('testing individual grouping');
assert.equal(imGraph.getGroups().filter(x => x.id == 'CA')[0].children.length, 4);
//node grouping tests

//collapse all
console.log('testing collapse all');
imGraph.collapseAll();
assert.equal(imGraph.getNodes().length, 9);
assert.equal(imGraph.getGroups().filter(x => x.id == 'CA')[0]._children.length, 4);

// collapse all

//expand all
console.log('testing expand all');
imGraph.expandAll();

// assert.equal(imGraph.getNodes().length, 30);
assert.equal(imGraph.getNodes().length, 21);

assert.equal(imGraph.getGroups().filter(x => x.id == 'CA')[0].children.length, 4);
//expand all

//collapse id
console.log('testing collapse id');
imGraph.collapse('US');

console.log(imGraph.getNodes().length);

assert.equal(imGraph.getNodes().length, 20);
// assert.equal(imGraph.getNodes().length, 28);
//collapse id

//expand id
console.log('testing expand id');
imGraph.expand('US');

assert.equal(imGraph.getNodes().length, 21);
// assert.equal(imGraph.getNodes().length, 30);
//expand id


//collapse link binding id
console.log('collapse testing link switch');
imGraph.collapse('US');
assert.equal(imGraph.getNodes().length, 20);
// assert.equal(imGraph.getNodes().length, 28);

//getting usNode
let linksSent = [ 4, 1, //pointed by 2
    1, 4, 16  //,2 //pointed by 3
];

let linksReceived = [ 5, 6, 8, 12, 16, 17, 18, 19, //,3 // targeting 2
    1, 6, 8, 17, 18, 19 // targeting 3
];

let expectedLinks = [...new Set([...linksSent, ...linksReceived])];

let sentFromUsNodeLink = imGraph.getLinks().filter(x => x.source.id == 'US').map(x=> x.target.id);
let receivedToUsNodeLink = imGraph.getLinks().filter(x => x.target.id == 'US').map(x => x.source.id);
let actualLinks = [...sentFromUsNodeLink, ...receivedToUsNodeLink];

assert.equal(actualLinks.filter(x => expectedLinks.indexOf(x) < 0).length, 0);
assert.equal(expectedLinks.filter(x => actualLinks.indexOf(x) < 0).length, 0);
//collapse link binding id


//expand link binding id
console.log('testing expand link switch');
imGraph.expand('US');

// assert.equal(imGraph.getNodes().length, 30);
assert.equal(imGraph.getNodes().length, 21);

let sentBy2 = imGraph.getLinks().filter(x => x.source.id == 2).map(x => x.target.id);
let receivedBy2 = imGraph.getLinks().filter(x => x.target.id == 2).map(x => x.source.id);


let expectedSentBy2 = [4, 1];
let expectedReceivedBy2 = [3, 5, 6, 8, 12, 16, 17, 18, 19];

assert.equal(sentBy2.filter(x => expectedSentBy2.indexOf(x) < 0).length, 0);
assert.equal(expectedSentBy2.filter(x => sentBy2.indexOf(x) < 0).length, 0);

assert.equal(receivedBy2.filter(x => expectedReceivedBy2.indexOf(x) < 0).length, 0);
assert.equal(expectedReceivedBy2.filter(x => receivedBy2.indexOf(x) < 0).length, 0);

let sentBy3 = imGraph.getLinks().filter(x => x.source.id == 3).map(x => x.target.id);
let receivedBy3 = imGraph.getLinks().filter(x => x.target.id == 3).map(x => x.source.id);

let expectedSentBy3 = [2, 4, 16]; //remove the 1
assert.equal(sentBy3.filter(x => expectedSentBy3.indexOf(x) < 0).length, 0);
assert.equal(expectedSentBy3.filter(x => sentBy3.indexOf(x) < 0).length, 0);

let expectedReceivedBy3 = [1, 6, 8, 17, 18, 19];
assert.equal(receivedBy3.filter(x => expectedReceivedBy3.indexOf(x) < 0).length, 0);
assert.equal(expectedReceivedBy3.filter(x => receivedBy3.indexOf(x) < 0).length, 0);
//expand link binding id


//collapse all again
console.log('link switching final collapse all test');
imGraph.collapseAll();

// console.log('groups : ' + imGraph.getGroups().length);
assert.equal(imGraph.getNodes().length, 9);

assert(imGraph.getLinks().length < 25);
console.log('all tests success');

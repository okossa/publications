'use strict';

const getRndAngle = () => Math.floor(Math.random() * 360);

const getCircularCoord = (angle, radius, centerX, centerY)=> {
    return {
        x: centerX + (radius * Math.cos(angle)),
        y: centerY + (radius * Math.sin(angle))
    }
}

const setRadialLayout = (centerX, centerY, teamARadius, teamBRadius, nodesList, isTeamAfn) => {
    let position;
    nodesList.map(n => {
        if(isTeamAfn(n)){
            position = getCircularCoord(getRndAngle(), teamARadius, centerX, centerY)
        }
        else{
            position = getCircularCoord(getRndAngle(), teamBRadius, centerX, centerY)
        }
        n.targetX = position.x;
        n.targetY = position.y;
    })
}

class ForceLayoutManager {
    constructor() {}

    activateCluster(nodes, links, onTickCallback, onForceEndCallback) {
        if (!nodes) throw console.log('nodes are null');
        if (!links) throw console.log('links are null');
        if (!onTickCallback) throw console.log('ontickcallback is null');
        if (!onForceEndCallback) throw console.log('onForceEndCallback is null');

        console.log('Activating cluster for ' + nodes.length + ' nodes and ' + links.length + ' links' );

        let force = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id))
            .force("collision", d3.forceCollide().radius(d => 10))
            .force("center", d3.forceCenter(480, 480));

        force.nodes(nodes);
        force.force("link").links(links);

        force.on("tick", e => {
            let k = .1 * force.alpha();
            this.updateNodePosition(nodes, k);
            onTickCallback(nodes, links, 100 - force.alpha() * 100);
        });

        force.on("end", e => {
            onForceEndCallback(nodes, links);
        });

        return force;
    }

    activateClusterCentralNode(nodes, links, onTickCallback, onForceEndCallback) {
        if (!nodes) throw console.log('nodes are null');
        if (!links) throw console.log('links are null');
        if (!onTickCallback) throw console.log('ontickcallback is null');
        if (!onForceEndCallback) throw console.log('onForceEndCallback is null');

        console.log('Activating cluster for ' + nodes.length + ' nodes and ' + links.length + ' links' );

        let force = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance( d => 250))
            .force("collision", d3.forceCollide().radius(d => 10))
            .force("center", d3.forceCenter(480, 480));

        force.nodes(nodes);
        force.force("link").links(links);

        force.on("tick", e => {
            let k = .1 * force.alpha();
            this.updateNodePosition(nodes, k);
            onTickCallback(nodes, links);
        });

        force.on("end", e => {
            onForceEndCallback(nodes, links);
        });

        return force;
    }

    activateRadial(nodes, links, onTickCallback, onForceEndCallback) {
        if (!nodes) throw console.log('nodes are null');
        if (!links) throw console.log('links are null');
        if (!onTickCallback) throw console.log('ontickcallback is null');
        if (!onForceEndCallback) throw console.log('onForceEndCallback is null');

        console.log('Activating radial for ' + nodes.length + ' nodes and ' + links.length + ' links' );

        let force = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id))
            .force("collision", d3.forceCollide().radius(d => 10))
            .force("center", d3.forceCenter(480, 480));

        force.nodes(nodes);
        force.force("link").links([]);  //links are not used here

        //position first group node
       // let groupsNodes = nodes.filter(node => (node.children && node.children.length) > 0
       //          || (node._children && node._children.length >0));
       //
       //  setRadialLayout(300, 300, 50, 150, groupsNodes,
       //      (node) => {
       //          if(node.team == 'teamA'){
       //              return true;
       //          }
       //          return false;
       //      })
       //
       //
       //  //then position children node close the group node
       // let childrenNode = nodes.filter(node => !((node.children && node.children.length) > 0
       //     || (node._children && node._children.length >0)));
       //
       //  childrenNode.map(node => {
       //      node.targetX = node.parentNode.targetX;
       //      node.targetY = node.parentNode.targetY;
       //  });

        setRadialLayout(300, 300, 50, 150, nodes,
            (node) => {
                if(node.team == 'teamA'){
                    return true;
                }
                return false;
            })

        force.on("tick", e => {
            let k = .1 * force.alpha();
            this.updateNodePosition(nodes, k);
            onTickCallback(nodes, links, 100 - force.alpha() * 100);
        });

        force.on("end", e => {
            onForceEndCallback(nodes, links);
        });

        return force;
    }


    updateNodePosition(nodeList, k) {
        nodeList.forEach((o, i) => {
            if (o.targetY) {
                o.y += (o.targetY - o.y) * k;
            }
            if (o.targetX) {
                o.x += (o.targetX - o.x) * k;
            }
        });
    };
}

window.ForceLayoutManagerV2 = ForceLayoutManager;
'use strict';

class Helper {
    static throwErrorIfNull(memberName, memberParamName, value) {
        if (value == null) {
            throw ' ' + memberName + ' : ' + memberParamName + ' is null ';
        }
    }

    static initializeData(nodes) {
        Helper.throwErrorIfNull('initializeData', 'nodes', nodes);
        const generateLink = (id, linkedIds) => linkedIds.map(x => ({id: id + '_' + x, source: id, target: x}));
        const prepareLinks = nodes => nodes.reduce((acc, curr) => acc.concat(generateLink(curr.id, curr.linkedId)), []);
        const prepareData = (nodeList, linkList) => {
            var nodeById = d3.map();
            nodeList.forEach(function (node) {
                nodeById.set(node.id, node);
            });
            linkList.forEach(function (link) {
                link.source = nodeById.get(link.source);
                link.target = nodeById.get(link.target);
            });
        };

        // todo start okossa refactor this
        let links = prepareLinks(nodes);
        nodes.map(x => x.associatedLinks = links.filter(y => y.source == x.id || y.target == x.id));
        prepareData(nodes, links);
        // todo end okossa refactor this

        return {
            links,
            nodes
        };
    };


    static generateRandomValue(maxLimit) {
        if (maxLimit == null) {
            throw new Error('maxLimit is null');
        }
        return Math.floor(Math.random() * maxLimit);
    }

    static generateRandomColor() {
        const availableColors = ["red", "orange", "yellow", "green", "blue", "violet",
            "Brown", "coral", "cyan", "coral", "BurlyWood", "deeppink", "greenyellow", "lightsalmon", "navy",
            "springgreen", "powderblue"];

        let rndValue = Helper.generateRandomValue(availableColors.length - 1);
        return availableColors[rndValue];
    }


    static generateRandomNodeTeamATeamB(nbNodes, nbTeamMemberA) {
        if (nbNodes == null) {
            throw new Error('nbNodes is null');
        }

        if(nbTeamMemberA == null){
            throw new Error('nbTeamMemberA is null');
        }

        let nodes = [];
        let i;
        let currentMemberTeamA = 0;
        for (i = 0; i < nbNodes; i++) {
            let rndId = Helper.generateRandomValue(100000);
            let rndColor = Helper.generateRandomColor();
            let team = 'B';
            let color = 'blue';
            if(currentMemberTeamA < nbTeamMemberA){
                currentMemberTeamA = currentMemberTeamA + 1;
                team = 'A';
                color = 'red';
            }
            nodes.push({
                "id": rndId,
                "description": "description " + rndId,
                "linkedId": [],
                "color": color,
                "team": team
                // "color": rndColor
            });
        }

        Helper.mapRandomlyNodes(nodes, nbTeamMemberA);
        return nodes;
    }


    static generateRandomNode(nbNodes) {
        if (nbNodes == null) {
            throw new Error('nbNodes is null');
        }
        let nodes = [];
        let i;
        for (i = 0; i < nbNodes; i++) {
            let rndId = Helper.generateRandomValue(100000);
            let rndColor = Helper.generateRandomColor();
            nodes.push({
                "id": rndId,
                "description": "description " + rndId,
                "linkedId": [],
                "color": rndColor
            });
        }

        Helper.mapRandomlyNodes(nodes, 10);
        return nodes;
    }

    static pickRandomlyIn(list) {
        if (list.length == null) {
            throw new Error('list is null');
        }
        let size = list.length - 1;
        return list[Helper.generateRandomValue(size)];
    }

    static mapRandomlyNodes(nodes, nbNodesToMap) {
        let nbNodes = nodes.length;
        let j;
        for (j = 0; j < nbNodesToMap; j++) {
            let n = nodes[j];
            let nbRndLinks = Helper.generateRandomValue(Math.floor(nbNodes / 2));
            let i;
            for (i = 0; i < nbRndLinks; i++) {
                let randomPick = Helper.pickRandomlyIn(nodes);
                if (n.id != randomPick.id) {
                    n.linkedId = [...n.linkedId.filter(x => x != randomPick.id), randomPick.id];
                }
            }

        }
        return nodes;
    }
}
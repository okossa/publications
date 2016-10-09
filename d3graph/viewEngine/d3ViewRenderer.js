'use strict';

class D3ViewRenderer {
    constructor(options) {
        let self = this;
        Helper.throwErrorIfNull('D3Engine constructor', 'width', options.width);
        Helper.throwErrorIfNull('D3Engine constructor', 'height', options.height);
        Helper.throwErrorIfNull('D3Engine constructor', 'svgId', options.svgId);
        self._force = d3.layout.force().size([options.width, options.height]);

        self._nodesData = [];
        self._linksData = [];
        self._svgNodes = [];
        self._svgLinks = [];

        self._svg = d3.select('#' + options.svgId)
            .append("svg")
            .attr("width", options.width)
            .attr("height", options.height);
    }

    bind(nodes, links) {
        let self = this;
        Helper.throwErrorIfNull('D3Engine render', 'nodesData', nodes);
        Helper.throwErrorIfNull('D3Engine render', 'linksData', links);

        self._linksData = links;
        self._nodesData = nodes.map(node => {
            let bindNode = node.getNode();
            return bindNode;
        });

        self._svgLinks = self._svg.selectAll(".link")
            .data(self._linksData)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('id', d => d.id)
            .attr('sourceid', d => d.source.id)
            .attr('targetId', d => d.target.id)
            .style("stroke-width", d => 1);

        self._svgNodes = self._svg.selectAll(".node")
            .data(self._nodesData)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("team", d => d.team)
            .attr('angle', d => d.angle)
            .attr("r", d => Helper.generateRandomValue(4) * 3 + 5)
            .attr('id', (d) => d.id)
            .attr('linkedIds', (d) => d.linkedId.reduce((acc, curr) => acc + ';' + curr, []))
            .style("fill", d => d.color)
            // .style("fill", d => d.id)
            .call(self._force.drag);

        //binding...
        nodes.map(node => {
            let bindNode = node.getNode();
            node.bind(bindNode);
            return bindNode;
        });

    }

    getForce() {
        let self = this;
        return self._force;
    }

    render() {
        let self = this;

        const addClassToAllLinks = className => {
            [...document.querySelectorAll('.link')].map(x=> x.classList.add(className))
        };

        const removeClassToAllLinks = className => {
            [...document.querySelectorAll('.link')].map(x=> x.classList.remove(className))
        };

        self._force.on("tick", function (e) {
            let k = .1 * e.alpha;

            self._nodesData.forEach(function (o, i) {
                if (o.targetY) {
                    o.y += (o.targetY - o.y) * k;
                }
                if (o.targetX) {
                    o.x += (o.targetX - o.x) * k;
                }
            });
            
            self._svgNodes.transition().ease('linear').duration(100)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            if (e.alpha < 0.03) {
                self._svgLinks.transition().ease('linear').duration(100)
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y)
                    .attr("y2", d => d.target.y);
                addClassToAllLinks('link-visible');
            } else {
                removeClassToAllLinks('link-visible');
            }

        });

        self._force
            .nodes(self._nodesData)
            .charge(-30)
            .start();
    }
}
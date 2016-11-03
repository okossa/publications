'use strict';

class ImmersionTree {
    constructor() {
        //basic test to see if caps lock is not working
        let self = this;
        self._root = null;
        self._initialNodes = [];
        self._links = [];
        self._groupNodes = [];
        self._filteredNodes = [];
        self._filteredLinks = [];
    }

    loadRawData(nodes, groupByField) {
        let self = this;
        self._initialNodes = nodes;
        self.initialize(nodes, groupByField);
    }

    collapseAll() {
        let self = this;
        self._groupNodes.map(groupNode => self._collapseGroupNode(groupNode));
    }

    expandAll() {
        let self = this;
        self._groupNodes.map(groupNode => self._expandGroupNode(groupNode));
    }

    collapse(id) {
        let self = this;
        let selectedGroupNode = self._groupNodes.filter(groupNode => groupNode.id == id);
        if (selectedGroupNode.length == 0) {
            throw 'collapse: unknown id : ' + id;
        }
        selectedGroupNode.map(selectedGroupNode => self._collapseGroupNode(selectedGroupNode));
    }

    expand(id) {
        let self = this;
        let selectedGroupNode = self._groupNodes.filter(groupNode => groupNode.id == id);
        if (selectedGroupNode.length == 0) {
            throw 'expand: unknown id : ' + id;
        }
        selectedGroupNode.map(selectedGroupNode => self._expandGroupNode(selectedGroupNode));
    }

    getNodes() {
        let self = this;
        let nodes = self._groupNodes.reduce((acc, curr) => {
            //if the curr is opened then add its children
            //else if curr is collapsed add itself to the list
            if(curr.children){
                return [...acc, ...curr.children];
            }
            else{
                return [...acc, curr];
            }
        } , []);

        return nodes;
    }

    getLinks() {
        let self = this;
        let nodes = self.getNodes();
        let links = self._generateLinks(nodes);
        return links;
    }

    getGroups() {
        let self = this;
        return self._groupNodes;
    }

    filterBy(fnPredicate) {
        let self = this;
        let nodes = self.getNodes();
        self._filteredNodes = nodes.filter(node => fnPredicate(node));
        self._filteredLinks = self._generateLinks(self._filteredNodes);
    }

    getFilteredNodes() {
        let self = this;
        return self._filteredNodes;
    }

    getFilteredLinks() {
        let self = this;
        return self._filteredLinks;
    }

    initialize(nodes, groupByField) {
        let self = this;
        const findReplace = (id, itemStores) => itemStores.filter(x => x.id == id)[0];

        const replaceIdByNode = items => items.map(x =>
            x.linkedId = x.linkedId.map(y => findReplace(y, items)));

        const groupBy = (nodeList, field) => {
            let groups = new Map();
            let i = 0;
            nodeList.map(node => {
                i++;
                let propertyNameValue = node[field];
                groups.set(propertyNameValue,
                    groups.get(propertyNameValue) || []);
                groups.get(propertyNameValue)
                    .push(Object.assign(node, {children: []}));
            });

            return [...groups].map(group => {
                let newGroup = {
                    id: group[0].split(' ').join('_'),
                    group: field,
                    name: group[0],
                    linkedId: []
                };
                newGroup.children = group[1].map(sn => {
                    sn.parentNode = newGroup;
                    return sn;
                });
                return newGroup;
            });
        };

        replaceIdByNode(nodes);
        self._groupNodes = groupBy(nodes, groupByField);
    }

    _generateLinks(nodes) {
        let linkStore = [];

        const extractAssociatedNode = node => {
            let associatedNode = [];

            // collapsed
            if (node._children) {
                associatedNode = [...associatedNode, ...node._children];
                //get nodes associated with _children
                node._children.map(x => associatedNode = [...associatedNode, ...x.linkedId]);
            }

            if (node.linkedId) {
                associatedNode = [...associatedNode, ...node.linkedId];
            }

            return {
                node: node,
                associatedNodes: associatedNode
            };
        };

        const createLink = (node, associatedNodes, linkStore) => {
            associatedNodes.map(linkedNode => {
                if (linkStore.filter(link => //if the link is not already in the link store
                    link.target.id == node.id && link.source.id == linkedNode.id ||
                    link.target.id == linkedNode.id && link.source.id == node.id).length == 0) {
                    linkStore.push({
                        source: node,
                        target: linkedNode
                    });
                }
            });
        };

        const redirectLinks = links => {
            return links.reduce((acc,link) => {
                if (link.source.parentNode && link.source.parentNode.children == null) {
                    link.source = link.source.parentNode;
                }

                if (link.target.parentNode && link.target.parentNode.children == null) {
                    link.target = link.target.parentNode;
                }

                if(link.target.id != link.source.id ){ //to prevent link pointing to another link when grouping
                    if (acc.filter(x => x.target.id == link.target.id && x.source.id == link.source.id ||
                        x.target.id == link.source.id && x.source.id == link.target.id).length == 0) {
                        acc.push(link);
                    }
                }
              return acc;
            },[]);
        };

        nodes.reduce((acc, curr) => [...acc, extractAssociatedNode(curr)], [])
            .map(x => createLink(x.node, x.associatedNodes, linkStore));

        linkStore = redirectLinks(linkStore);

        return linkStore;
    }

    _collapseGroupNode(node) {
        //collapse the selected groupNode
        if (node.children != null) {
            node._children = node.children;
            node.children = null;
        }
        else {
            console.log('group ' + node.id + ' already collapsed');
        }
    }

    _expandGroupNode(node) {
        //expand the selected groupNode
        if (node._children != null) {
            node.children = node._children;
            node._children = null;
        }
        else {
            console.log('group ' + node.id + ' already expanded');
        }
    }

    findAssociatedNode(searchedNode){
       let associatedNode = this._initialNodes.filter(node => node.linkedId.some(x => x.id == searchedNode.id));
        associatedNode = [...associatedNode, ...searchedNode.linkedId.filter(x => !associatedNode.some(y => y.id == x.id) )];
        return associatedNode;
    }
    
    // findAssociatedLinks(associatedNodes){
    //    let associatedLinks = [];
    //     associatedNodes.map(node =>  )
    // }
}

if (typeof module !== 'undefined') {
    module.exports = ImmersionTree;
}

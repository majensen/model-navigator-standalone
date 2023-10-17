
/**
 * This method will execture only once during data initiallization
 * @param {*} distionary 
 * 12/20/2022 - AR
 * Simple Breath First Search to assign node to a tree
 * prerequisite - {dictionary} node hierarchy order
 * optimized for icdc_data_model
 * The level value initially assigned to each node is used for 
 * calculating the position of the node during search filter
 * 
 */
export const generateNodeTree = (dictionary, nextLevel = 2, intervel = 2) => {
    const nodes = Object.keys(dictionary);
    /**
     * initialize level to zero for all the nodes
     */
    const node2Level = nodes.reduce((acc, node) => {acc[node] = 0; return acc}, {});
    /**
     * check only distinct links are processed
     * edge1 = node1 -> node2, edge/link with be included on both nodes
     * edge1 of hierarchy node is selected 
     * 
     * CAUTION
     * Dst - node/point where edge originates (source)
     * Src - node/point where edge ends (target)
     */
    const distinctLinks = {};
    const exploredSoureNodes = {};
    let maxLevel = 0;
    nodes.forEach((node, index) => {
        const links = dictionary[node].links.filter((item) => item.Src !== undefined);
        links.forEach((link, linkIndex) => {
            const source = link.Dst;
            const target = link.Src;
            if (target && source){
                // check for circular relation (adverse_event/case)
                if (distinctLinks[source] === target) {
                    node2Level[source] -= nextLevel;
                    node2Level[target] += nextLevel/intervel;
                    // const level = node2Level[target] + nextLevel/intervel;
                    // maxLevel = Math.max(maxLevel, level);
                } else {
                    // assign order based on the level of hierarchy node
                    distinctLinks[target] = source;
                    const levels = [node2Level[target], node2Level[source] + nextLevel];
                    let max = Math.max(...levels);
                    /**
                     * IF - hierarchy is other than root node (program)
                     * off_treatment, off_study, canine_ind to case
                     * should be above case in the tree
                     * 
                     * ELSE - will assign level to node 
                     * pushes node to bottom of the tree
                     */
                    if (index > 0 && node2Level[source] === 0) {
                        if (node2Level[target] === 0) {
                            const level = node2Level[target] + nextLevel/2;
                            node2Level[target] = level;
                            max = Math.max(max, level);
                        } else {
                            // node2Level[source] = node2Level[target] - nextLevel/2;
                            /***
                             * assign level to unexplored parent nodes
                             */
                            if (!exploredSoureNodes[source]) {
                              node2Level[source] = node2Level[target] - nextLevel/2;
                            }
                            // node2Level[source] = node2Level[target];
                            const minLevel = node2Level[target];
                            nodes.forEach((node) => {
                              if (minLevel <= node2Level[node]) {
                                const level = node2Level[node] + nextLevel + 1;
                                max = Math.max(max, level)
                                node2Level[node] = level;
                              }
                            });
                        }
                    } else {
                        node2Level[target] = max;
                    }
                    maxLevel = Math.max(max, maxLevel);
                }
                exploredSoureNodes[source] = true;
            }
        });
    });

    /**
    * assign max level to node with no edges
    * move to bottom of the tree
    */
    const nodeWithoutEdges = _.cloneDeep(nodes).filter((node) => dictionary[node].links
        && dictionary[node].links.length == 0);
    nodeWithoutEdges.forEach((node) => {
        node2Level[node] = maxLevel;
    });

    /**
    * create a complete node tree
    * calculate subtree and assign position to node
    */
    const nodeTree = {}
    for (const [key, value] of Object.entries(node2Level)) {
        if (nodeTree[value] === undefined) {
            nodeTree[value] = []
        }
        nodeTree[value].push(key);
    }
    return nodeTree;
}

/**
* generate sub tree based on filter dictionary
* use case - calculate position of the each filtered node
* @param {*} distionary
* @param {*} nodeTree
*/
export const generateSubTree = (dictionary, nodeTree) => {
    const nodes = Object.keys(dictionary);
    const subtree = {};
    let nextLevel = 0;
    for (const [key, value] of Object.entries(nodeTree)) {
       const existingNodes = value.filter((item) => nodes.includes(item));
       if (existingNodes.length > 0){
         subtree[nextLevel] = existingNodes;
         nextLevel += 1;
       }
    }
    return subtree;
}

/**
 * Calculates the node position based on node level
 * 
 * @param {*} dictionary - filtered dictionary
 * @param {*} nodeTree - complete tree
 * @param {*} tabViewWidth - calculate the position
 * @returns postion of the nodes
 * 
 */
export const getNodePosition = ({
    dictionary,
    nodeTree,
    tabViewWidth,
    xInterval = 250,
    yInterval = 90,
}) => {
    const subtree = generateSubTree(dictionary, nodeTree);
    const position = {};
    let x = tabViewWidth/2;
    for (const [level, nodes] of Object.entries(subtree)) {
        const { length } = nodes;
        /**
         * single node in a level
         * assign position to the middle of the graph horizontally (x)
         * set vertical position based on tree level
         * yIntervel to adjust the distance between each level
         */
        const y  = (Number(level)) * yInterval;
        if (length === 1){
            position[nodes[0]] = [x, y];
        } else {
            
            let xMin = x - (xInterval * length)/2;
            let interval = xInterval;
            /**
             * adjusted for icdc data model
             */
            if (length < 3) {
                xMin = x - (xInterval * (length + 1))
                interval = 2 * xInterval
            }
            if (length >= 8) {
              nodes.forEach((node, index) => {
                let xMin = x - (xInterval * length)/3;
                const adjustedX = xMin + 2 * (interval/3 * index);
                const yPos = index % 2 === 0 ? y - Number(yInterval) / 5 : y + Number(yInterval) / 5; 
                position[node] = [adjustedX, yPos];
              });
            } else {
              nodes.forEach((node, index) => {
                const adjustedX = xMin + interval * (index + 1);
                position[node] = [adjustedX, y];
              });
            }
        }
    }

    return position;
}


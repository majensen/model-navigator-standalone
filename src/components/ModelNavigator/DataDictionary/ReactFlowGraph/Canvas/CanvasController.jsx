/* eslint no-unused-vars: 0 */
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceX, forceY } from 'd3-force';
import { connect } from 'react-redux';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
} from 'reactflow';
import CircularProgress from '@material-ui/core/CircularProgress';
import _ from 'lodash';
import { collide } from './collide.js';
import CanvasView from './CanvasView';
import { createNodesAndEdges } from '../GraphUtils/MDFutils';
import { getDistinctCategoryItems, setMatchingNodeTitle, getCategoryIconUrl } from './util';
import {
  onNodeDragStart, onPanelViewClick, onViewChange, setReactFlowGraphData,
} from '../../Store/actions/graph';
// import { getNodePosition } from './CanvasHelper';
import defaultIcon from './assets/graph_icon/study.svg';

const simulation = forceSimulation()
  .force('charge', forceManyBody().strength(-1000))
  .force('x', forceX().x(0).strength(0.05))
  .force('y', forceY().y(0).strength(0.05))
  .force('collide', collide())
  .alphaTarget(0.05)
  .stop();

const numTicks = 20;

const getLayoutedElements = (
  nodes, edges, isSearchMode,
  defaultIcon, searchResults,
  currentSearchKeyword) => {
    nodes.forEach(
      (node) => {
        if (!node.data.icon) {
          node.data.icon = defaultIcon;
        }
      });
    if (isSearchMode) {
      const matchingNodeTitle = setMatchingNodeTitle(searchResults);
      nodes.forEach(
        (node) => {
          if(matchingNodeTitle[node.id]) {
            node.data.matchedNodeNameQuery = currentSearchKeyword;
          }
        });
    }
    // must clone edges, since simulation
    // replaces source and target with
    // actual node objects, and we need
    // the simple handles for rendering
    // in flowgraph
    let sim_edges = _.cloneDeep(edges);
    simulation.nodes(nodes).force(
      'link',
      forceLink(sim_edges)
        .id((d) => d.id)
        .strength(0.1)
        .distance(100)
    );
    simulation.tick(numTicks);
    nodes.forEach(
      (node) => {
        node.position.x = node.x;
        node.position.y = node.y;
      });
    return {nodes, edges};
  };


const CanvasController = ({
//   flowData,
  ddgraph,
  currentSearchKeyword,
  tabViewWidth,
  model,
  searchResults,
  isSearchMode,
  onClearSearchResult,
  setGraphData,
  // nodeTree,
  unfilteredDictionary,
  highlightedNodes,
  graphViewConfig,
  onGraphPanelClick,
  assetConfig,
}) => {
  if (tabViewWidth === 0 || !graphViewConfig || !model) {
    return <CircularProgress />;
  }

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [categories, setCategories] = useState([]);
  const [iconsURL, setIconsURL] = useState({});

  /**
     * initalize category item for Legend
     */
  useEffect(() => {
    const cats = _.uniq(model.tag_kvs('Category').map(([,val]) => val));
    setCategories(cats);
    const urls = getCategoryIconUrl(cats, `${assetConfig?.iconUrl}`);
    setIconsURL(urls);
  }, []);

  /** node
    * 1. position (x, y)
    * 2. title
    * 3. highlight node based on matching search query to desc, properties and title
    */
  /**
     * update states
     * 1. nodes and edges
     * 2. toggle between on/off for search mode
     */

  useEffect(() => {
    const flowData = createNodesAndEdges({ model }, true, []);
    const {nodes: layoutNodes, edges: layoutEdges} = getLayoutedElements(
      flowData.nodes, flowData.edges, isSearchMode,
      defaultIcon, searchResults, currentSearchKeyword);
    setGraphData(flowData);
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [model, currentSearchKeyword]);


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(
      { ...params, type: 'smoothstep', animated: true }, eds,
    )),
    [],
  );

  if (nodes.length === 0 && edges.length === 0) {
    return <CircularProgress />;
  }

  return (
    <CanvasView
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      categories={categories}
      onClearSearchResult={onClearSearchResult}
      highlightedNodes={highlightedNodes}
      graphViewConfig={graphViewConfig}
      canvasWidth={tabViewWidth}
      onGraphPanelClick={onGraphPanelClick}
    />
  );
};

const mapStateToProps = (state) => ({
  ddgraph: state.ddgraph,
  isSearchMode: state.ddgraph.isSearchMode,
  currentSearchKeyword: state.ddgraph.currentSearchKeyword,
  searchResults: state.ddgraph.searchResult,
  // nodeTree: state.submission.node2Level,
  highlightedNodes: state.ddgraph.highlightedNodes,
  unfilteredDictionary: state.submission.unfilteredDictionary,
  graphViewConfig: state.ddgraph.graphViewConfig,
  assetConfig: state.ddgraph.assetConfig,
});

const mapDispatchToProps = (dispatch) => ({
  setGraphData: (graphData) => { dispatch(setReactFlowGraphData(graphData)); },
  onGraphPanelClick: () => { dispatch(onPanelViewClick()); },
});

export default connect(mapStateToProps, mapDispatchToProps)(CanvasController);

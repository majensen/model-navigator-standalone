import React, { memo, useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Handle, useReactFlow, useStoreApi } from "reactflow";
import clsx from "clsx";
import Styles from "./NodeStyle";
import { highlightMatchingTitle, setMatchingNodeClasses } from "./util";
import {
  reactFlowPanelClicked,
  reactFlowNodeClicked,
  reactFlowNodeFocused,
  reactFlowNodeDisplayChanged,
  changedVisOverlayPropTable,
  selectFocusedNodeID,
  selectHighlightingNodeID,
  selectNodeDisplayed,
  selectNodeIsExpanded,
  selectNodeIsForegrounded,
} from '../../../../../features/graph/graphSlice';
import {
  selectIsSearchMode,
  selectCurrentSearchKeyword,
  selectMatchedNodes,
} from '../../../../../features/search/searchSlice';

const NodeView = ({
  classes,
  id,
  handleId,
  data, //must be named 'data' per ReactFlow
}) => {

  const dispatch = useDispatch();
  
  const isSearchMode = useSelector( selectIsSearchMode );
  const expand = useSelector( state => selectNodeIsExpanded(state, id) );
  const foreground = useSelector( state => selectNodeIsForegrounded(state, id) );
  const currentSearchKeyword = useSelector( selectCurrentSearchKeyword );
  const highlightingNodeID = useSelector( selectHighlightingNodeID );
  const focusedNodeID = useSelector( selectFocusedNodeID );
  const matchedNodesInfo = useSelector( selectMatchedNodes );
  /**
   * expand node in normal mode (when search mode is false)
   * use view option to adjust the fontSize on property dialog
   */
  const expandNode = () => {
    // const view = localStorage.getItem("reactflowGraphView"); ???
    dispatch(reactFlowNodeClicked({id, isSearchMode}));
    // dispatch(reactFlowNodeDisplayChanged(!display));
    // if (display) { // ??
    //   dispatch(reactFlowPanelClicked());
    // }
  };
  const {
    label,
    icon,
    iconColor,
    category,
    matchedNodeNameQuery,
    nodeAssignment,
    nodeClass,
    reqPropsCount,
    prefPropsCount,
    optPropsCount,
  } = data;

  //dispatch event - on table view
  const displayOverlayTable = () => {
    // dispatch(reactFlowNodeClicked(id));
    dispatch(changedVisOverlayPropTable('show'));
  };

  /**
   * light node based on result of search query
   */

  useEffect(() => {
    if (`${label}`.toLowerCase() !== focusedNodeID) {
      dispatch(reactFlowNodeDisplayChanged(false));
    }
  }, [focusedNodeID]);

  /**
   * highlight nodes based on search query
   */
  const nodeClasses = setMatchingNodeClasses(matchedNodesInfo, label, classes, category);
  /**
   * button on focus
   */
  const nodeFocusEvent = () => {
    dispatch(reactFlowNodeFocused(id));
  };

  return (
    <>
      <div className={clsx({ [classes.propDialog]: expand })}>
        <div
          className={
            expand ? classes.customNodeExpand : classes.customNodeCollapse
          }
        >
          {expand && (
            <div className={classes.iconBar}>
              <CloseIcon className={classes.closeIcon} onClick={expandNode} aria-label="Close" />
            </div>
          )}
          <div className={classes.contentWrapper}>
            <div
              className={clsx(classes.nodeTitle, {
                [classes.btnPadding]: expand,
              })}
            >
              <div
                className={
                  isSearchMode ? nodeClasses : classes.nodeButtonOuterWrapper
                }
                style={{
                  border: expand && "2px solid white",
                }}
                onClick={isSearchMode ? displayOverlayTable : expandNode}
              >
                <div className={classes.nodeButtonInnerWrapper}>
                  <div
                    style={{
                      borderRadius: "11px",
                      backgroundColor: iconColor,
                    }}
                  >
                    <div
                      className={classes.iconWrapper}
                      style={{ backgroundColor: iconColor }}
                    >
                      <img
                        className={classes.icon}
                        src={icon}
                        alt="category icon"
                      />
                    </div>
                  </div>

                  <div className={classes.labelWrapper}>
                    {isSearchMode && matchedNodeNameQuery ? (
                      <>
                        {highlightMatchingTitle(
                          label,
                          matchedNodeNameQuery,
                          classes
                        )}
                      </>
                    ) : (
                      <>
                        {`${label}`.toLowerCase()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={expand ? classes.viewSection : classes.hideSection}
            >
              <ul className={classes.list}>
                <li className={classes.listItem}>
                  <span className={classes.listItemLabel}>{"Assignment:"}</span>
                  <span className={classes.listItemValue}>
                    {nodeAssignment}
                  </span>
                </li>
                <hr className={classes.divider} />
                <li className={classes.listItem}>
                  <span className={classes.listItemLabel}>{"Class: "}</span>
                  <span className={classes.listItemValue}>{nodeClass}</span>
                </li>
                <hr className={classes.divider} />
                <li className={classes.listItem}>
                  <span className={classes.listItemLabel}>
                    {"Required Properties: "}
                  </span>
                  <span className={classes.listItemValue}>{reqPropsCount}</span>
                </li>
                <hr className={classes.divider} />
                <li className={classes.listItem}>
                  <span className={classes.listItemLabel}>
                    {"Preferred Properties: "}
                  </span>
                  <span className={classes.listItemValue}>
                    {prefPropsCount}
                  </span>
                </li>
                <hr className={classes.divider} />
                <li className={classes.listItem}>
                  <span className={classes.listItemLabel}>
                    {"Optional Properties: "}
                  </span>
                  <span className={classes.listItemValue}>{optPropsCount}</span>
                </li>
              </ul>
            </div>
            <Handle type="target" position="top" style={{ top: "12px" }} />
            <Handle
              type="source"
              position="bottom"
              id={handleId}
              style={{
                background: "transparent",
                border: "none",
                top: "37px",
              }}
            />
          </div>
        </div>
        {expand && (
          <button
            className={classes.viewPropBtn}
            onClick={displayOverlayTable}
          >
            View Properties
          </button>
        )}
      </div>
    </>
  );
};

export default withStyles(Styles)(memo(NodeView));
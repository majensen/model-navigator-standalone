import React, { memo, useState, useEffect } from "react";
import { withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Handle, useReactFlow, useStoreApi } from "reactflow";
import clsx from "clsx";
import Styles from "./NodeStyle";
import { highlightMatchingTitle, setMatchingNodeClasses } from "./util";

const NodeView = ({
  classes,
  id,
  handleId,
  data,
  onViewTable,
  isSearchMode,
  ddgraph,
  currentSearchKeyword,
  onClickNode,
  expandNodeView,
  onCollapseNodeView,
  highlightingNode,
  onNodeFocus,
  focusedNodeId,
}) => {
  const [display, setDisplay] = useState(false);
  /**
   * expand node in normal mode (when search mode is false)
   * use view option to adjust the fontSize on property dialog
   */
  const expandNode = () => {
    const view = localStorage.getItem("reactflowGraphView");
    onClickNode(id);
    setDisplay(!display);
    if (display) {
      onCollapseNodeView();
    }
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
  const displayOverviewTable = () => {
    onClickNode(id);
    onViewTable(false);
  };

  /**
   * light node based on reasult of search query
   */
  useEffect(() => {
    if (!expandNodeView) {
      setDisplay(false);
    } else {
      if (`${label}`.toLowerCase() === highlightingNode?.id) {
        setDisplay(true);
      } else {
        setDisplay(false);
      }
    }
  }, [expandNodeView, highlightingNode]);

  useEffect(() => {
    if (`${label}`.toLowerCase() !== focusedNodeId?.id) {
      setDisplay(false);
    }
  }, [focusedNodeId]);

  /**
   * highlight nodes based on search query
   */
  const nodeClasses = setMatchingNodeClasses(ddgraph, label, classes, category);
  /**
   * button on focus
   */
  const nodeFocusEvent = () => {
    onNodeFocus(id);
  };

  return (
    <>
      <div className={clsx({ [classes.propDialog]: display })}>
        <div
          className={
            clsx({
              [classes.customNodeExpand]: display,
              [classes.customNodeCollapse]: !display,
              "customNodeExpand": display,
              "customNodeCollapse": !display,
            })
          }
        >
          {display && (
            <div className={classes.iconBar}>
              <CloseIcon className={classes.closeIcon} onClick={expandNode} />
            </div>
          )}
          <div className={classes.contentWrapper}>
            <div
              className={clsx(classes.nodeTitle, {
                [classes.btnPadding]: display,
              })}
            >
              <div
                className={classes.nodeButtonOuterWrapper}
                style={{ border: display ? "2px solid white" : "0px" }}
                onClick={isSearchMode ? displayOverviewTable : expandNode}
              >
                <div className={classes.nodeButtonInnerWrapper}>
                  <div
                    className={clsx(classes.iconWrapper, `${label}_iconWrapper`)}
                    style={{ backgroundColor: iconColor }}
                  >
                    <img
                      className={classes.icon}
                      src={icon}
                      alt="category icon"
                    />
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
                      `${label}`.toLowerCase()
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={display ? classes.viewSection : classes.hideSection}
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
                  <span className={clsx(classes.listItemLabel, `${label}_listItemLabel`)}>
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
        {display && (
          <button
            className={classes.viewPropBtn}
            onClick={displayOverviewTable}
          >
            View Properties
          </button>
        )}
      </div>
    </>
  );
};

export default withStyles(Styles)(memo(NodeView));

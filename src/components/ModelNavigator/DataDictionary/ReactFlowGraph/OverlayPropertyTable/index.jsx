/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import withStyles from '@mui/styles/withStyles';
import _ from 'lodash';

import {
  getNodeDescriptionFragment,
  getNodeTitleFragment,
} from '../../Utils/highlightHelper';

import {
  selectIsSearchMode,
  selectMatchedResult,
} from '../../../../../features/search/searchSlice';
import {
  changedVisOverlayPropTable,
  selectHighlightingMatchedNodeID,
} from '../../../../../features/graph/graphSlice';
import {defaultStyleAttributes} from '../../../Config/nav.config';
import { ConfigContext } from '../../../Config/ConfigContext';
import { ModelContext } from '../../../Model/ModelContext';

import DataDictionaryPropertyTable from "../../Table/DataDictionaryPropertyTable";
import styles from "./OverlayPropertyTable.style";
import NodeViewComponent from "../../Table/DataDictionaryNode/components/NodeViewComponent";

const OverlayPropertyTable = ({
  classes,
  nodeID,
  hidden,
}) =>  {
  const dispatch = useDispatch();
  const config = useContext( ConfigContext );
  const model =  useContext( ModelContext );
  const isSearchMode = useSelector(selectIsSearchMode);
  const node = nodeID ? model.nodes( nodeID ) : null; // eslint-disable-line no-undef
  const matchedNodeID = useSelector( selectHighlightingMatchedNodeID );
  const matchedResult = useSelector(
    state => selectMatchedResult(state, matchedNodeID)
  );
  
  const getTitle = () => {
    if (isSearchMode) {
      if (matchedResult) {
        return getNodeTitleFragment(matchedResult.matches,
                                    _.capitalize(node.handle),
                                    "overlay-property-table__span");
      }
    }
    return _.capitalize(node.handle);
  };

  const getDescription = () => {
    if (isSearchMode) {
      if (matchedResult) {
        return getNodeDescriptionFragment(matchedResult.matches,
                                          node.description,
                                          "overlay-property-table__span");
      }
    }
    return node.description;
  };

  /**
   * Toggle the property table to display all properties
   */
  const handleOpenAllProperties = () => {
    // this.props.onOpenMatchedProperties();
  };

  /**
   * Toggle the property table to display matched properties only
   */
  const handleDisplayOnlyMatchedProperties = () => {
    // this.props.onCloseMatchedProperties();
  };

  const needHighlightSearchResult = isSearchMode;
  if (!node || hidden ) { // !node || hidden) {
    return (
      <></>
    );
  }
  const category = node.tags('Category') ? node.tags('Category') : null;
  const catConfig =  category ? config.tagAttribute('Category', category) : null;
  const borderLeftColor = category 
        ? catConfig?.table?.color
        : defaultStyleAttributes.node.color;
  const backgroundColor = category
        ? catConfig?.node?.background
        : defaultStyleAttributes.node.background;
  const tableIcon = category
        ? (catConfig?.table?.icon
           ? catConfig?.table?.icon
           : defaultStyleAttributes.table.icon)
        : defaultStyleAttributes.table.icon;
  return (
    <div className={classes.table}>
      <div className={classes.background} />
      <div className={classes.fixedContainer}>
        <div className={classes.content}>
          <div className={classes.header}>
            <div
              className={classes.category}
              style={{
                borderLeftColor,
                backgroundColor
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  paddingLeft: '4px'
                }}
              >
                <img
                  src={tableIcon}
                  alt="icon"
                  className={classes.categoryIcon}
                />
                { category ? (
                  <h4
                    style={{ color: "#FFF" }}
                    className={classes.categoryText}
                  >
                    {_.capitalize(category)}
                  </h4>
                ) : (
                  <>
                  </>
                )}
              </div>
              <div>
                <IconButton
                  className={classes.iconCloseRounded}
                  onClick={() => dispatch(changedVisOverlayPropTable("hide"))}
                  size="large">
                  <CloseRoundedIcon
                    style={{ color: "#FFF", fontSize: "20px" }}
                  />
                </IconButton>
              </div>
            </div>
          </div>
          <div
            className={classes.categoryDivider}
            style={{ borderLeftColor }}
          />
          <div
            className={classes.node}
            style={{
              borderLeftColor,
              marginBottom: "0px",
              borderRight: "1px solid #ADBEC4",
              backgroundColor: "white",
            }}
          >
            <NodeViewComponent
              node={node}
              description={node.desc}
              matchedResult={matchedResult}
              propertyCount={node.props().length}
              isOverlay={true}
            />
          </div>
          
          <div
            className={classes.propertyTable}
            style={{ borderLeftColor }}
          >
            <div className={classes.property}>
              <DataDictionaryPropertyTable
                title={getTitle()}
                node={node}
                onlyShowMatchedProperties={false}
                needHighlightSearchResult={needHighlightSearchResult}
                hideIsRequired={false}
                matchedResult={matchedResult}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(OverlayPropertyTable);

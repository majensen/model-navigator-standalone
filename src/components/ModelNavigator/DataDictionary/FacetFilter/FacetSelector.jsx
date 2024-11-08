import React, { Fragment, useState, useContext } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { List, Accordion, AccordionDetails, AccordionSummary, Icon } from "@mui/material";
import withStyles from '@mui/styles/withStyles';
import _ from "lodash";
import {
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { ConfigContext } from "../../Config/ConfigContext";
import CheckBoxView from "./CheckBoxView";
import styles from "./FacetFilters.style";
import {
  sortLabels,
  resetIcon,
  defaultFacetSectionProps,
} from "../../Config/nav.config";
import { filterGroupCleared } from '../../../../features/filter/filterSlice';

const CustomAccordionSummary = withStyles({
  root: {
    marginBottom: -1,
    padding: "0 39px",
    minHeight: 48,
    // marginLeft: 35,
    "&.Mui-expanded": {
      minHeight: 48,
    },
  },
  content: {
    "&.Mui-expanded": {
      margin: "16px 0",
    },
  },
  expanded: {},
})(AccordionSummary);

const FacetSelector = ({
  classes,
  facetItem,
  section,
}) => {

  const dispatch = useDispatch();
  const config = useContext( ConfigContext );
  const [groupsExpanded, setGroupsExpanded] = useState([]);
  
  const handleGroupsChange = (panel) => (event, isExpanded) => {
    const groups = _.cloneDeep(groupsExpanded);
    if (isExpanded) {
      groups.push(panel);
    } else {
      const index = groups.indexOf(panel);
      if (index > -1) {
        groups.splice(index, 1);
      }
    }
    setGroupsExpanded(groups);
  };

  function getSortButtonColor(facetItem, sortType) {
    return sortByForGroups[facetItem.datafield] === sortType
      ? "#B2C6D6"
      : "#4A4A4A";
  }

  const sortByForGroups = useSelector((state) =>
    state.submission && state.submission.sortByList
      ? state.submission.sortByList
      : {}
  );


  const getGroupNameColor = (facetItem, currentSection) => {
    let groupNameColor = "black";
    facetItem.checkboxItems.map((item) => {
      if (item.isChecked) {
        groupNameColor = config.facetSection(currentSection.sectionName)
          ? config.facetSection(currentSection.sectionName).color
            ? config.facetSection(currentSection.sectionName).color
            : ""
          : defaultFacetSectionProps.color;
      }
      return "";
    });
    return groupNameColor;
  };

  const checkBoxes = (facetItem, section) => {
    const showItems = facetItem.checkboxItems.filter(
      (item) => item !== undefined
    );
    return showItems.map((item, index) => (
      <CheckBoxView
        key={index}
        checkboxItem={item}
        facetItem={facetItem}
        defaultFacetSectionProps={defaultFacetSectionProps}
      />
    ));
  };


  return (
    <Fragment key={facetItem?.groupName}>
      <Accordion
        square
        expanded={groupsExpanded.includes(
          facetItem.groupName
          )}
        onChange={handleGroupsChange(facetItem.groupName)}
        classes={{
          root: classes.expansionPanelfacetItem,
        }}
      >
        <CustomAccordionSummary
          expandIcon={
            <ExpandMoreIcon
              classes={{
                root: classes.dropDownIconSubSection,
              }}
              style={{ fontSize: 26 }}
            />
          }
          className={classes.customExpansionPanelSummaryRoot}
        >
          <div
            id={`filterGroup_${facetItem.datafield}`}
            style={{
              color: getGroupNameColor(
                facetItem,
                section
              ),
            }}
            className={classes.subSectionSummaryText}
          >
            {facetItem.groupName}
          </div>
        </CustomAccordionSummary>
        <AccordionDetails
          classes={{
            root: classes.expansionPanelDetailsRoot,
          }}
        >
          <List component="div" disablePadding dense>
            <div className={classes.sortGroup}>
              <span className={classes.sortGroupIcon}>
                <Icon
                  style={{ fontSize: 10 }}
                  onClick={() => {
                    dispatch(filterGroupCleared({facetItem}));
                  }}
                >
                  <img
                    src={resetIcon.src}
                    height={resetIcon.size}
                    width={resetIcon.size}
                    alt={resetIcon.alt}
                  />
                </Icon>
              </span>
              <span
                className={classes.sortGroupItem}
                style={{
                  color: getSortButtonColor(
                    facetItem,
                    "alphabet"
                  ),
                }}
                onClick={() => {
                  // onSortSection(
                  // facetItem.datafield,
                  // "alphabet"
                  // );
                  }}
              >
                {sortLabels.sortAlphabetically}
              </span>
              <span
                className={classes.sortGroupItemCounts}
                style={{
                  color: getSortButtonColor(
                    facetItem,
                    "count"
                  ),
                }}
                onClick={() => {
                  // onSortSection(
                  //  facetItem.datafield,
                  //   "count"
                  // );
                }}
              >
                {sortLabels.sortByCount}
              </span>
            </div>
            { checkBoxes(facetItem, section) }
            </List> 
        </AccordionDetails>
      </Accordion>
    </Fragment>
  );
};

export default withStyles(styles)(FacetSelector);

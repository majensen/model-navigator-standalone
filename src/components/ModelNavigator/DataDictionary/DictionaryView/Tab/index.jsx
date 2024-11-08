import React from 'react';
import { Tabs, Tab } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import TabLabel from './TabLabel';

const TabItems = ({
  tabItems,
  styleClasses,
  handleTabChange,
  currentTab,
  orientation,
}) => {
  function getTabLabel(title, image, index) {
    return (
      <TabLabel
        title={title}
        icon={image}
        primaryColorClass={(currentTab === index)
          ? styleClasses.tabHighlightColor : styleClasses.tabPrimaryColor}
      />
    );
  }

  const TABs = tabItems.map((tab, index) => (
    <Tab
      index={tab.index}
      label={
        getTabLabel(tab.label, tab.icon, tab.index)
      }
      key={index}
      disableRipple
    />
  ));

  return (
    <>
      <Tabs
        onChange={(event, value) => handleTabChange(event, value)}
        value={currentTab}
        TabIndicatorProps={{ style: { background: 'none' } }}
        orientation={orientation}
        className={styleClasses.tabs}
      >
        {TABs}
      </Tabs>
      {/* <hr className={styleClasses.hrLine} /> */}
    </>
  );
};

const styles = () => ({
  defaultStyle: {
    fontFamily: 'Open Sans',
    textTransform: 'none',
    fontSize: '17px',
  },
  flexContainer: {
    flexDirection: 'column',
  },
  indicator: {
    display: 'none',
  },
  tabHighlightColor: {
    color: '#6d9eba',
  },
  tabs: {
    paddingLeft: '10px',
  }
});

export default withStyles(styles)(TabItems);

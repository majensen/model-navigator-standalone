import _ from 'lodash';
import {
  facetSearchData,
  filterOptions,
} from '../bento/dataDictionaryData'
import { clearAllFilters } from '../store/actions/actions';
/**
 * Helper function to query and get an object from the redux store
 * @param {string} storeKey name of store property to access
 * @param {obj} store the application redux store
 * @return {obj}
 */
export const getState = (storeKey, store) => store.getState()[storeKey];
  
/**
 * Helper function to return an object of all selectable filters
 * @param {object} data custodian data containing filter value information
 * @return {obj}
 */
export const getAllFilters = (data) => {
  const emptyFilters = data.reduce((acc, facet) => (
    { ...acc, [facet.datafield]: [] }
  ), {});
  return emptyFilters;
};

export function allFilters() {
  const emptyFilters = facetSearchData.reduce((acc, facet) => (
    { ...acc, [facet.datafield]: [] }
  ), {});
  return emptyFilters;
}
  
/**
 * Returns filter variable for graphql query using the all filters.
 *
 * @param {object} data
 * @return {json}
 */
export const createFilterVariables = (data, currentAllActiveFilters) => {
  const filter = Object.entries(currentAllActiveFilters).reduce((acc, [key]) => {
    if (data.datafield === key) {
      return data.isChecked
        ? { ...acc, [key]: [...currentAllActiveFilters[key], ...[data.name]] }
        : { ...acc, [key]: currentAllActiveFilters[key].filter((item) => item !== data.name) };
    }
    return { ...acc, [key]: currentAllActiveFilters[key] };
  }, {});
  return filter;
};
  
export const hashMapHelper = (groupName, [key, value], hashMap) => {
  switch (groupName) {
    case 'category':
    case 'assignment':
    case 'class':
      hashMap.set(value[groupName], [...hashMap.get(value[groupName]), ...[[key, value]]]);
      break;
    case 'uiDisplay':
    case 'inclusion': {
      const inclusionObj = value[groupName];
      if (inclusionObj) {
        Object.keys(inclusionObj)
          .forEach((element) => {
            if (inclusionObj[element].length > 0) {
              hashMap.set(
                element,
                [
                  ...hashMap.get(element),
                  ...[[key, value]],
                ],
              );
            }
          });
      }
      break;
    }
    default:
      break;
  }
};

const includeMultiFilterValue = (filteredDict, filters) => {
  const filterValue = filteredDict.filter(([, thisValue]) => {
    let returnItem = false;
    filters.forEach((filterValue) => {
      if (thisValue[filterValue.toLowerCase()]
        && thisValue[filterValue.toLowerCase()].length > 0) {
        returnItem = true;
      };
    });
    return returnItem;
  });
  return filterValue;
}

export const inclusionFilterHandler = (selectedFilters, filterHashMap) => {
  let filteredDict = [];
  selectedFilters.forEach(([key, value], index) => {
    value.forEach((filterValue) => {
      filteredDict.push(...filterHashMap.get(filterValue.toLowerCase()));
    });
  });
  return Object.fromEntries(filteredDict);
}

const filterNodesByProperty = (property = [], inclusionFilter, dictionary) => {
  let filterProps = [];
  if (property.length == 0) {
    Object.keys(dictionary).forEach((elem) => { 
      const items = dictionary[elem].properties;
      Object.keys(items).forEach((key) => {
        property.push(items[key]);
      });
    });
  }
  
  inclusionFilter.forEach(([key, items]) => {
    const toLowerCase = items.map(e => e.toLowerCase());
    if (key === 'inclusion') {
      filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.propertyType) !== -1);
    } else {
      filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.display) !== -1);
      
    }
  });
  const filterDictionary = {};
  property.forEach(item => {
    if (!filterDictionary[item.category]){
      filterDictionary[item.category] = dictionary[item.category];
    }
  });
  return filterDictionary;
}

const getPropertySubjectCountAndFilterDictionary = (dictionary, inclusionFilter) => {
  const nodeProperies = [];
  const subjectCount = {};
  console.log(inclusionFilter);
  // get properties from node present on dictionary
 if (dictionary) {
  Object.keys(dictionary).forEach((elem) => { 
    const items = dictionary[elem].properties;
    Object.keys(items).forEach((key) => {
      nodeProperies.push(items[key]);
    });
  });
 }

 let filterProps = nodeProperies;
 if (inclusionFilter.length > 1) {
   inclusionFilter.forEach(([key, items]) => {
      const toLowerCase = items.map(e => e.toLowerCase());
      if (key === 'inclusion') {
        filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.propertyType) !== -1);
      } else {
        filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.display) !== -1);
      }
   });
   filterProps.forEach((item) => {
      if(!subjectCount[item.display]) {
        subjectCount[item.display] = 0;
      };
      subjectCount[item.display] += 1;
      if(!subjectCount[item.propertyType]) {
        subjectCount[item.propertyType] = 0;
      };
      subjectCount[item.propertyType] += 1;
   });
   const filterDictionary = filterNodesByProperty(filterProps, inclusionFilter, dictionary);

   return {count: subjectCount, dictionary: filterDictionary};
 }

 inclusionFilter.forEach(([, items]) => {
    const toLowerCase = items.map(e => e.toLowerCase());
    filterProps.forEach(prop => {
      toLowerCase.forEach(item => {
        if(`${prop.display}`.toLowerCase() == item
          || `${prop.propertyType}`.toLowerCase() == item) {
          if(!subjectCount[prop.display]){
            subjectCount[prop.display] = 0;
          } 
          subjectCount[prop.display] += 1;
          if(!subjectCount[prop.propertyType]){
            subjectCount[prop.propertyType] = 0;
          } 
          subjectCount[prop.propertyType] += 1;
        }
      })
    })
  });
  const filterDictionary = filterNodesByProperty(filterProps, inclusionFilter, dictionary);
  return {count: subjectCount, dictionary: filterDictionary};
}

export const newHandleExplorerFilter = (selectedFilters, filterHashMap) => {
  let filteredDict = [];
  let alternateFilteredDict = [];
  selectedFilters.forEach(([key, value], index) => {
    switch (index) {
      case 0: {
        value.forEach((filterValue) => {
          filteredDict = [
            ...filteredDict,
            ...filterHashMap.get(filterValue.toLowerCase()),
          ];
        });
        break;
      }
      case 1: {
        if (key === 'inclusion' || key === 'uiDisplay') {
          if (value.length > 1) {
            filteredDict = includeMultiFilterValue(filteredDict, value);
          } else {
            value.forEach((filterValue) => {
              alternateFilteredDict = [
                ...filteredDict.filter(([, thisValue]) => (thisValue[key]
                  && thisValue[key][filterValue.toLowerCase()]
                  ? thisValue[key][filterValue.toLowerCase()].length > 0
                  : false)),
              ];
            });
            filteredDict = alternateFilteredDict;
          }
          break;
        }
        value.forEach((filterValue) => {
          const valueFilteredDict = filteredDict.filter(([, thisValue]) => thisValue[key] === filterValue.toLowerCase());
          const updateValueFilteredDict = (valueFilteredDict.length > 0)
            ? valueFilteredDict : [ ...filteredDict, ...filterHashMap.get(filterValue.toLowerCase())];
          alternateFilteredDict = [
            ...alternateFilteredDict,
            ...updateValueFilteredDict,
          ];
        });
        filteredDict = alternateFilteredDict;
        break;
      }

      default: {
        if (key === 'inclusion' || key === 'uiDisplay') {
          if (value.length > 1) {
            filteredDict = includeMultiFilterValue(filteredDict, value);
          } else {
            value.forEach((filterValue) => {
              alternateFilteredDict = [
                ...filteredDict.filter(([, thisValue]) => (thisValue[key]
                  && thisValue[key][filterValue.toLowerCase()]
                  ? thisValue[key][filterValue.toLowerCase()].length > 0
                  : false)),
              ];
            });
            filteredDict = alternateFilteredDict;
          }
          break;
        }
        const inclusoinFilter = [];
        value.forEach((filterValue) => {
          const valueFilteredDict = filteredDict.filter(([, thisValue]) => thisValue[key] === filterValue.toLowerCase());
          inclusoinFilter.push(...valueFilteredDict);
        });
        filteredDict = inclusoinFilter;
        break;
      }
    }
  });

  return Object.fromEntries(filteredDict);
};
  
export const initializeFilterHashMap = (dictionary, filterSections) => {
  const map = new Map();
  filterOptions.forEach((option) => map.set(option, []));
  Object.entries(dictionary)
    .forEach(([key, value]) => {
      let index = 0;
      while (index < filterSections.length) {
        hashMapHelper(filterSections[index], [key, value], map);
        index += 1;
      }
    });
  return map;
};
  
export const setCheckboxItems = (checkboxItems, subjectCountObj) => checkboxItems.map((elem) => ({
  ...elem,
  subjects: subjectCountObj[elem.name.toLowerCase()],
}));
  
export const setSubjectCount = (checkboxData, subjectCountObj) => checkboxData.map((elem) => ({
  ...elem,
  checkboxItems: setCheckboxItems(elem.checkboxItems, subjectCountObj),
}));
  
export const getFileNodes = (dictionary) => Object.keys(dictionary).filter((node) => dictionary[node].category === 'data_file');
export const getNodeTypes = (dictionary) => Object.keys(dictionary).filter((node) => node.charAt(0) !== '_');

export const getDictionaryWithExcludeSystemProperties = (dictionary) => {
  const ret = Object.keys(dictionary)
    .map((nodeID) => {
      const node = dictionary[nodeID];
      if (!node.properties) return node;
      return {
        ...node,
        properties: excludeSystemProperties(node),
      };
    })
    .reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  return ret;
};

export const getSubjectItemCount = (dictionary, filterBy = facetSearchData, activeFilters) => {
  const subjectCountItems = {};
  filterBy.forEach((section) => {
    section.checkboxItems.forEach((item) => {
      const key = String(item.name).toLowerCase();
      subjectCountItems[key] = 0;
      Object.keys(dictionary).forEach((elem) => {
        const property = dictionary[elem][item.group];
        if (Array.isArray(property)) {
          subjectCountItems[key] += property.length;
        } else {
          if (property === key) {
          subjectCountItems[key] += 1;
        }}
      });
    });
  });
  return subjectCountItems;
}

//** filter subject count and filter dictionary*/
//** uses case base appraoch for subject count and dictionary filter */
export const generateSubjectCountsAndFilterData = (data, allActiveFilters = allFilters({}), currentFilter) => {
  const processedFilters = Object.entries(allActiveFilters)
    .filter(([, value]) => value.length > 0);
  //** initial state when there is no active filters */
  const { unfilteredDictionary, filterHashMap, facetfilterConfig, properties } = data;
  if (processedFilters.length == 0) {
    const dictionary = (!unfilteredDictionary) ? data : unfilteredDictionary;
    return { subjectCounts: getSubjectItemCount(dictionary), dictionary: dictionary}
  }

  //** check active filters */
  const filterSections = processedFilters.map((item) => item[0]);
  const selectedSections = facetfilterConfig.facetSearchData.filter(section => filterSections
      .indexOf(section.datafield) !== -1);

  let filteredDictionary = newHandleExplorerFilter(processedFilters, filterHashMap);
  const filteredDictCounts = getSubjectItemCount(filteredDictionary);
  
  //** if any inclusion filter is active - inclusion behavior for both filter by inclusion and nodes */
  const { inclusion, uiDisplay } = allActiveFilters;
  if (inclusion.length > 0 || uiDisplay.length > 0) {
    // create new dictionary to track properties count only
    
    const inclusionItem = 'inclusion';
    const uiDisplayItem = 'uiDisplay';

    const activeInclusionFilter = (currentFilter.datafield === inclusionItem || currentFilter.datafield === uiDisplayItem);

    const inclusionSections = facetfilterConfig.facetSearchData.filter(section => (section.datafield
      === inclusionItem || section.datafield === uiDisplayItem));
    const filterByInclusion = processedFilters.filter(item => (item[0] === inclusionItem || item[0] === uiDisplayItem));
    const filterWithoutInclusion = processedFilters.filter(item => (item[0] !== inclusionItem && item[0] !== uiDisplayItem));

    //** generate inclusion filtered dictionary */
    const inclusionDictionary = newHandleExplorerFilter(filterByInclusion, filterHashMap);
    const noneInclusionDictionary = newHandleExplorerFilter(filterWithoutInclusion, filterHashMap);
    //** select exclusion filter dictionary filteredDictionary if filter item is more than 2 */
    const selectDictionary = (processedFilters.length < 4) ? inclusionDictionary : filteredDictionary;
    
    const selectedSectionCounts = getSubjectItemCount(selectDictionary, selectedSections, currentFilter);
    const inclusionFilterItems = facetfilterConfig.facetSearchData.filter(item => item.datafield === inclusionItem)[0];
    const uiDisplayFilterItems = facetfilterConfig.facetSearchData.filter(item => item.datafield === uiDisplayItem)[0];
    
    let facetSectionCount = filteredDictCounts;
    let propsFilter = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, filterByInclusion);
    let inclusionSubjectCount = propsFilter.count;
    
    //** When all inclusion facet search filter are active*/
    
    
    if (filterByInclusion.length === 2 && filterWithoutInclusion.length == 0) {
      const filter = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, filterByInclusion);
      inclusionSubjectCount = filter.count;
      filteredDictionary = filter.dictionary;
      const otherFilterItem = (currentFilter.datafield !== inclusionItem)
      ? inclusionFilterItems : uiDisplayFilterItems;
      otherFilterItem.checkboxItems.forEach(item => {
        filteredDictCounts[item.group] = inclusionSubjectCount[item.group]
          ? inclusionSubjectCount[item.group] : 0;
      });
      const currentrFilter = filterByInclusion.filter(item => (item[0] !== currentFilter.datafield));
      const currentPropsFilter = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, currentrFilter);
      const currentPropsFilterCount = currentPropsFilter.count;
      facetSectionCount = getSubjectItemCount(filter.dictionary);
      inclusionFilterItems.checkboxItems.forEach(item => {
        facetSectionCount[item.group] = currentPropsFilterCount[item.group] ? currentPropsFilterCount[item.group] : 0;
      });
      uiDisplayFilterItems.checkboxItems.forEach(item => {
        facetSectionCount[item.group] = currentPropsFilterCount[item.group] ? currentPropsFilterCount[item.group] : 0;
      });
      const combinedSubjectCounts = Object.assign({}, facetSectionCount, inclusionSubjectCount);
      return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
    }

    //** when inclusion by filter is two and node facet section is one */
    if (filterByInclusion.length === 2 && filterWithoutInclusion.length === 1) {
      console.log(filteredDictCounts);
      if (activeInclusionFilter) {
        /** when  */
        

      }

      //** when node filter facet is current selection */
      if (!activeInclusionFilter) {
        //** if the filter section facet is not inclusion */
        const filter = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, filterByInclusion);
        facetSectionCount = getSubjectItemCount(filter.dictionary);
        const filterByNodeInclusion = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByInclusion);
        let subjectCount = getSubjectItemCount(filterByNodeInclusion.dictionary);
        // ** adjust inclusion subject count with node filter */
        const allInclusionFilterItem = [["inclusion", ["Preferred", "Required", "Optional"]],
        ["uiDisplay", ["yes", "no"]]];

        //** get count for all the inclusion subject */
        const allInclusionFilters = getPropertySubjectCountAndFilterDictionary(filteredDictionary, allInclusionFilterItem);
        const allInclusionSubjectCount = allInclusionFilters.count;

        //**  get count for only active inclusion fiters*/
        const activeInclusionFilters = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
        const activeInclusionSubjectCount = activeInclusionFilters.count;

        //** update the inclusion subject count base on active or all inclusion filter */
        inclusionFilterItems.checkboxItems.forEach(item => {
          subjectCount[item.group] = activeInclusionSubjectCount[item.group] ? activeInclusionSubjectCount[item.group] : allInclusionSubjectCount[item.group];
        });
        uiDisplayFilterItems.checkboxItems.forEach(item => {
          subjectCount[item.group] = activeInclusionSubjectCount[item.group] ? activeInclusionSubjectCount[item.group] : allInclusionSubjectCount[item.group];
        });

        //** update the subject count for the current section */
        const currentSelection = selectedSections.filter(item => item.datafield === currentFilter.datafield)[0];
        if (currentSelection) {
            currentSelection.checkboxItems.forEach(item => {
            const key = item.name.toLowerCase();
            subjectCount[key] = facetSectionCount[key];
          });
        }

        //return filtered dictionary and subject count
        return { subjectCounts: subjectCount, dictionary: filteredDictionary};
      }
    }

    if ((currentFilter.datafield === inclusionItem || currentFilter.datafield === uiDisplayItem )
      && filterWithoutInclusion.length === 0) {
      const unfilteredDictionaryCount = getSubjectItemCount(unfilteredDictionary, selectedSections, currentFilter);
      facetSectionCount = unfilteredDictionaryCount;
      facetSectionCount = Object.assign({}, facetSectionCount, inclusionSubjectCount);
    }

    if (filterWithoutInclusion.length === 1) {
      const nonInclusionSectionCounts = getSubjectItemCount(noneInclusionDictionary, selectedSections, currentFilter);
      propsFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
      inclusionSubjectCount = propsFilter.count;

      if (filterByInclusion.length === 2 && activeInclusionFilter) {
        const selectedFilter = filterByInclusion.filter((item) => item[0] !== currentFilter.datafield);
        propsFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, selectedFilter);
        let inclusionFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
        
        const selectedFilterCount = propsFilter.count;
        const allInclusionFilterCount = inclusionFilter.count;
        if (currentFilter.datafield === inclusionItem) {
          uiDisplayFilterItems.checkboxItems.forEach(item => {
            nonInclusionSectionCounts[item.group] = allInclusionFilterCount[item.group] ? allInclusionFilterCount[item.group] : 0;
          });
          inclusionFilterItems.checkboxItems.forEach(item => {
            nonInclusionSectionCounts[item.group] = selectedFilterCount[item.group] ? selectedFilterCount[item.group] : 0;
          });
        } else {
          inclusionFilterItems.checkboxItems.forEach(item => {
            nonInclusionSectionCounts[item.group] = allInclusionFilterCount[item.group] ? allInclusionFilterCount[item.group] : 0;
          });
          uiDisplayFilterItems.checkboxItems.forEach(item => {
            nonInclusionSectionCounts[item.group] = selectedFilterCount[item.group] ? selectedFilterCount[item.group] : 0;
          });
        }
        facetSectionCount = Object.assign({}, filteredDictCounts, nonInclusionSectionCounts);
      } else {
        if (filterByInclusion.length == 1) {
          //filter dictionary by inclusion
          console.log("test filter by INASACAODCIADFALDFK lasjdfkasldkfl ever export")
          const filter = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByInclusion);
          inclusionSubjectCount = filter.count;
          if ((inclusion.length > 0 && uiDisplay.length === 0)) {
            uiDisplayFilterItems.checkboxItems.forEach(item => {
              filteredDictCounts[item.group] = inclusionSubjectCount[item.group]
                ? inclusionSubjectCount[item.group] : 0;
            });
          }
    
          if (uiDisplay.length > 0 && inclusion.length === 0) {
            inclusionFilterItems.checkboxItems.forEach(item => {
              filteredDictCounts[item.group] = inclusionSubjectCount[item.group]
                ? inclusionSubjectCount[item.group] : 0;
            });
          }
          facetSectionCount = Object.assign({}, filteredDictCounts, nonInclusionSectionCounts);
        } 
        if (filterByInclusion.length === 2 && !activeInclusionFilter) {
        const filter = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, filterByInclusion);
        facetSectionCount = getSubjectItemCount(filter.dictionary);
        propsFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
        inclusionSubjectCount = propsFilter.count;
        const filterByNodeInclusion = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByInclusion);
        filteredDictionary = filterByNodeInclusion.dictionary;
        const overideSubjectCount = {};
        inclusionFilterItems.checkboxItems.forEach(item => {
          overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : facetSectionCount[item.group];
        });
        uiDisplayFilterItems.checkboxItems.forEach(item => {
          overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : facetSectionCount[item.group];
        });
        const currentSelection = selectedSections.filter(item => item.datafield === currentFilter.datafield)[0];
        if (currentSelection) {
            currentSelection.checkboxItems.forEach(item => {
            const key = item.name.toLowerCase();
            overideSubjectCount[key] = facetSectionCount[key];
          });
        }
        const categorySubjectCount = getPropertySubjectCountAndFilterDictionary(unfilteredDictionary, filterByInclusion);
        const nodeFilterCount = getSubjectItemCount(categorySubjectCount.dictionary);
        // const categorySection = facetfilterConfig.facetSearchData.filter(item => item.datafield === "category")[0];
        // console.log(categorySubjectCount);
        // categorySection.checkboxItems.forEach(item => {
        //   const key = item.name.toLowerCase();
        //   overideSubjectCount[key] = categorySubjectCount['count'][key];
        // });
        const combinedSubjectCounts = Object.assign({}, nodeFilterCount, overideSubjectCount);
        return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
        }
      }

    }
    //** set the subject count of inclusion filter based on the selected dictionary */
    inclusionFilterItems.checkboxItems.forEach(item => {
      selectedSectionCounts[item.group] = facetSectionCount[item.group];
    });

    uiDisplayFilterItems.checkboxItems.forEach(item => {
      selectedSectionCounts[item.group] = facetSectionCount[item.group];
    });

    if (filterWithoutInclusion.length === 2) {
      const nonInclusionSectionCounts = getSubjectItemCount(noneInclusionDictionary, selectedSections, currentFilter);
      propsFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
      inclusionSubjectCount = propsFilter.count;
      const currentSelection = selectedSections.filter(item => item.datafield === currentFilter.datafield)[0];
      const otherFilters = processedFilters.filter(item => item[0] !== currentFilter.datafield);
      const otherInclusionDictionary = newHandleExplorerFilter(otherFilters, filterHashMap);
      const otherSelectionCounts = getSubjectItemCount(otherInclusionDictionary, selectedSections, currentFilter);
      if (filterByInclusion.length > 0) {
        if (currentSelection) {
          const overideSubjectCount = {};
          uiDisplayFilterItems.checkboxItems.forEach(item => {
            overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
          });
          inclusionFilterItems.checkboxItems.forEach(item => {
            overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
          });
          currentSelection.checkboxItems.forEach(item => {
            const key = item.name.toLowerCase();
            overideSubjectCount[key] = otherSelectionCounts[key];
            });
          if (currentSelection && filterByInclusion.length === 2) {
            if (currentFilter.datafield === inclusionItem) {
              const filterByDisplay = processedFilters.filter(item => (item[0] === uiDisplayItem));
              const filter = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByDisplay);
              const filterCount = filter.count;
              inclusionFilterItems.checkboxItems.forEach(item => {
                overideSubjectCount[item.group] = filterCount[item.group] ? filterCount[item.group] : 0
              });
            } else {
              const filterByPropType = processedFilters.filter(item => (item[0] === inclusionItem));
              const filter = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByPropType);
              const filterCount = filter.count;
              uiDisplayFilterItems.checkboxItems.forEach(item => {
                overideSubjectCount[item.group] = filterCount[item.group] ? filterCount[item.group] : 0;
              });
            }
          }
          if (currentSelection && filterByInclusion.length === 1) { 
            if (currentFilter.datafield === inclusionItem) {
              inclusionFilterItems.checkboxItems.forEach(item => {
                overideSubjectCount[item.group] = nonInclusionSectionCounts[item.group] ? nonInclusionSectionCounts[item.group] : 0;
              });
            } 
            if (currentFilter.datafield === uiDisplayItem) { {
              uiDisplayFilterItems.checkboxItems.forEach(item => {
                overideSubjectCount[item.group] = nonInclusionSectionCounts[item.group] ? nonInclusionSectionCounts[item.group] : 0;
              });
            }
          } 
        if (currentFilter.datafield === 'category') {
          currentSelection.checkboxItems.forEach(item => {
            const key = item.name.toLowerCase();
            overideSubjectCount[key] = otherSelectionCounts[key];
          });
          } 
        }
        const combinedSubjectCounts = Object.assign({}, filteredDictCounts, overideSubjectCount);
        return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
        } else {
          const overideSubjectCount = {};
          const uncheckedSection = facetfilterConfig.facetSearchData.filter(item => item.datafield === currentFilter.datafield)[0];
          inclusionFilterItems.checkboxItems.forEach(item => {
            overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
          });
          uiDisplayFilterItems.checkboxItems.forEach(item => {
            overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
          });
          if(activeInclusionFilter && filterByInclusion.length === 1 && currentFilter.datafield === inclusionItem) {
            const inclusionCount = getSubjectItemCount(noneInclusionDictionary);
            uiDisplayFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = inclusionCount[item.group] ? inclusionCount[item.group] : 0;
            });
          }
          if(activeInclusionFilter && filterByInclusion.length === 1 && currentFilter.datafield === uiDisplayItem) {
            const inclusionCount = getSubjectItemCount(noneInclusionDictionary);
            inclusionFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = inclusionCount[item.group] ? inclusionCount[item.group] : 0
            });
          }

          const inclusionFilterCounts = getSubjectItemCount(inclusionDictionary);
            const categorySection = facetfilterConfig.facetSearchData.filter(item => item.datafield === "category")[0];
            categorySection.checkboxItems.forEach(item => {
              const key = item.name.toLowerCase();
              overideSubjectCount[key] = inclusionFilterCounts[key];
            });
            if (!activeInclusionFilter) {
              if (uncheckedSection) {
                uncheckedSection.checkboxItems.forEach(item => {
                  const key = item.name.toLowerCase();
                  overideSubjectCount[key] = filteredDictCounts[key];
                });
              }
            }
            
          const combinedSubjectCounts = Object.assign({}, filteredDictCounts, overideSubjectCount);
          return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
        }
      }
    }

    if (filterWithoutInclusion.length > 2) {
      const nonInclusionSectionCounts = getSubjectItemCount(noneInclusionDictionary, selectedSections, currentFilter);
      propsFilter = getPropertySubjectCountAndFilterDictionary(filteredDictionary, filterByInclusion);
      inclusionSubjectCount = propsFilter.count;
      const currentSelection = selectedSections.filter(item => item.datafield === currentFilter.datafield)[0];
      const otherFilters = processedFilters.filter(item => item[0] !== currentFilter.datafield);
      const otherInclusionDictionary = newHandleExplorerFilter(otherFilters, filterHashMap);
      const otherSelectionCounts = getSubjectItemCount(otherInclusionDictionary, selectedSections, currentFilter);
      if (currentSelection) {
        const overideSubjectCount = {};
        uiDisplayFilterItems.checkboxItems.forEach(item => {
          overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
        });
        inclusionFilterItems.checkboxItems.forEach(item => {
          overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
        });
        currentSelection.checkboxItems.forEach(item => {
          const key = item.name.toLowerCase();
          overideSubjectCount[key] = otherSelectionCounts[key];
          });
        if (currentSelection && filterByInclusion.length === 2) {
          if (currentFilter.datafield === inclusionItem) {
            const filterByDisplay = processedFilters.filter(item => (item[0] === uiDisplayItem));
            const filter = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByDisplay);
            const filterCount = filter.count;
            inclusionFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = filterCount[item.group] ? filterCount[item.group] : 0
            });
          } else {
            const filterByPropType = processedFilters.filter(item => (item[0] === inclusionItem));
            const filter = getPropertySubjectCountAndFilterDictionary(noneInclusionDictionary, filterByPropType);
            const filterCount = filter.count;
            uiDisplayFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = filterCount[item.group] ? filterCount[item.group] : 0;
            });
          }
        }
        if (currentSelection && filterByInclusion.length === 1) { 
          if (currentFilter.datafield === inclusionItem) {
            inclusionFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = nonInclusionSectionCounts[item.group] ? nonInclusionSectionCounts[item.group] : 0;
            });
          } else {
            uiDisplayFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = nonInclusionSectionCounts[item.group] ? nonInclusionSectionCounts[item.group] : 0;
            });
          }
        } 
      if (currentFilter.datafield === 'category') {
        currentSelection.checkboxItems.forEach(item => {
          const key = item.name.toLowerCase();
          overideSubjectCount[key] = otherSelectionCounts[key];
        });
      }
      const combinedSubjectCounts = Object.assign({}, filteredDictCounts, overideSubjectCount);
      return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
      } else {
        const overideSubjectCount = {};
        if(activeInclusionFilter) {
          if (currentFilter.datafield === inclusionItem) {
            inclusionFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
            });
          } else {
            uiDisplayFilterItems.checkboxItems.forEach(item => {
              overideSubjectCount[item.group] = inclusionSubjectCount[item.group] ? inclusionSubjectCount[item.group] : 0;
            });
          }
        }
        if (currentFilter.datafield === 'category') {
          const categorySection = facetfilterConfig.facetSearchData.filter(item => item.datafield === "category")[0];
          categorySection.checkboxItems.forEach(item => {
            const key = item.name.toLowerCase();
            overideSubjectCount[key] = filteredDictCounts[key];
          });
        }
        const combinedSubjectCounts = Object.assign({}, nonInclusionSectionCounts, overideSubjectCount);
        return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
      }
    }
    
    const combinedSubjectCounts = Object.assign({}, filteredDictCounts, selectedSectionCounts);
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
  }

  //** filter by only nodes - any search filter item that filters the node (this excludes inclusion) */
  //** filter by only one subject or one section */
  if (processedFilters.length == 1) {
    const selectedSectionCounts = getSubjectItemCount(unfilteredDictionary, selectedSections);
    const combinedSubjectCounts = Object.assign({}, filteredDictCounts, selectedSectionCounts);
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
  } else {
    //** multiple filter - apply case based inclusion and exclusion filter mehtod for subject count */
    const subjectCount = subjectCountBaseOnExclusionAndIncusionFilter(processedFilters,
      filterHashMap, selectedSections, filteredDictionary, allActiveFilters, currentFilter);
    if (subjectCount) return subjectCount;
  }

  const selectedSectionCounts = getSubjectItemCount(filteredDictionary, selectedSections);
  const combinedSubjectCounts = Object.assign({}, filteredDictCounts, selectedSectionCounts);
  //** filter by multiple sections */
  return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
}

const subjectCountBaseOnExclusionAndIncusionFilter = (
  processedFilters,
  filterHashMap,
  selectedSections,
  filteredDictionary,
  allActiveFilters,
  currentFilter,
) => {
  const inclusionDictionary = inclusionFilterHandler(processedFilters, filterHashMap);
  const inclusionSectionCounts = getSubjectItemCount(inclusionDictionary, selectedSections);
  const selectedSectionCounts = getSubjectItemCount(filteredDictionary, selectedSections);
  const filteredDictCounts = getSubjectItemCount(filteredDictionary);
  
  // display all unselected filter items for category inclusive of the class or assignment filter.
  if (processedFilters.length === 2) {
    for (const [key, value] of Object.entries(selectedSectionCounts)) {
      const categoryItem = allActiveFilters.category.filter(item => item.toLowerCase() === key);
      if (value === 0 && categoryItem.length === 0) {
        selectedSectionCounts[key] = inclusionSectionCounts[key];
      }
    }
    const combinedSubjectCounts = Object.assign({}, filteredDictCounts, selectedSectionCounts);
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
  }

  if (processedFilters.length > 2) {
    const currentSelection = selectedSections.filter(item => item.datafield === currentFilter.datafield)[0];
    const otherFilters = processedFilters.filter(item => item[0] !== currentFilter.datafield);
    const otherInclusionDictionary = newHandleExplorerFilter(otherFilters, filterHashMap);
    const otherSelectionCounts = getSubjectItemCount(otherInclusionDictionary, selectedSections);
    if (currentSelection) {
      currentSelection.checkboxItems.forEach(item => {
        const key = item.name.toLowerCase();
        if (selectedSectionCounts[key] == 0) {
          selectedSectionCounts[key] = otherSelectionCounts[key];
        }
      })
    }
    
    const combinedSubjectCounts = Object.assign({}, filteredDictCounts, selectedSectionCounts);
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary};
  }
  return null;
}

export const excludeSystemProperties = (node) => {
  const properties = node.properties && Object.keys(node.properties)
    .filter((key) => (node.systemProperties ? !node.systemProperties.includes(key) : true))
    .reduce((acc, key) => {
      acc[key] = node.properties[key];
      return acc;
    }, {});
  return properties;
};

/*** toggle check box action */
export const toggleCheckBoxAction = (payload, state) => {
  const currentAllFilterVariables = payload === {} ? allFilters()
    : createFilterVariables(payload, state.allActiveFilters);
  if (_.isEqual(currentAllFilterVariables, allFilters())) {
    clearAllFilters();
  }
  return currentAllFilterVariables;
}

import _ from 'lodash';
import {
  facetSearchData,
  filterOptions,
} from '../../bento/dataDictionaryData';
import { clearAllFilters } from '../Store/actions/filter';
import { inclusionFilterHelper } from './inclusionFilterHelper';
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

export const hashMapHelper = (groupName, [key, value], hashMap = Set()) => {
  switch (groupName) {
    case 'category':
    case 'assignment':
    case 'class':
      if (hashMap && hashMap.get(value[groupName])) {
        hashMap.set(value[groupName], [...hashMap.get(value[groupName]), ...[[key, value]]]);
      }
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
      }
    });
    return returnItem;
  });
  return filterValue;
};

export const inclusionFilterHandler = (selectedFilters, filterHashMap) => {
  const filteredDict = [];
  selectedFilters.forEach(([key, value], index) => {
    value.forEach((filterValue) => {
      filteredDict.push(...filterHashMap.get(filterValue.toLowerCase()));
    });
  });
  return Object.fromEntries(filteredDict);
};

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
    const toLowerCase = items.map((e) => e.toLowerCase());
    if (key === 'inclusion') {
      filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.propertyType) !== -1);
    } else {
      filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.display) !== -1);
    }
  });
  const filterDictionary = {};
  property.forEach((item) => {
    if (!filterDictionary[item.category]) {
      filterDictionary[item.category] = dictionary[item.category];
    }
  });
  return filterDictionary;
};

const getPropertySubjectCountAndFilterDictionary = (dictionary, inclusionFilter) => {
  const nodeProperies = [];
  const subjectCount = {};
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
      const toLowerCase = items.map((e) => e.toLowerCase());
      if (key === 'inclusion') {
        filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.propertyType) !== -1);
      } else {
        filterProps = filterProps.filter((item) => toLowerCase.indexOf(item.display) !== -1);
      }
    });
    filterProps.forEach((item) => {
      if (!subjectCount[item.display]) {
        subjectCount[item.display] = 0;
      }
      subjectCount[item.display] += 1;
      if (!subjectCount[item.propertyType]) {
        subjectCount[item.propertyType] = 0;
      }
      subjectCount[item.propertyType] += 1;
    });
    const filterDictionary = filterNodesByProperty(filterProps, inclusionFilter, dictionary);

    return { count: subjectCount, dictionary: filterDictionary };
  }

  inclusionFilter.forEach(([, items]) => {
    const toLowerCase = items.map((e) => e.toLowerCase());
    filterProps.forEach((prop) => {
      toLowerCase.forEach((item) => {
        if (`${prop.display}`.toLowerCase() == item
          || `${prop.propertyType}`.toLowerCase() == item) {
          if (!subjectCount[prop.display]) {
            subjectCount[prop.display] = 0;
          }
          subjectCount[prop.display] += 1;
          if (!subjectCount[prop.propertyType]) {
            subjectCount[prop.propertyType] = 0;
          }
          subjectCount[prop.propertyType] += 1;
        }
      });
    });
  });
  const filterDictionary = filterNodesByProperty(filterProps, inclusionFilter, dictionary);
  return { count: subjectCount, dictionary: filterDictionary };
};

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
            ? valueFilteredDict : [...filteredDict, ...filterHashMap.get(filterValue.toLowerCase())];
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
        } else if (property === key) {
          subjectCountItems[key] += 1;
        }
      });
    });
  });
  return subjectCountItems;
};

//* * filter subject count and filter dictionary*/
//* * uses case base appraoch for subject count and dictionary filter */
export const generateSubjectCountsAndFilterData = (data, allActiveFilters = allFilters({}), currentFilter) => {
  const processedFilters = Object.entries(allActiveFilters)
    .filter(([, value]) => value.length > 0);
  //* * initial state when there is no active filters */
  const {
    unfilteredDictionary, filterHashMap, facetfilterConfig, properties,
  } = data;
  if (processedFilters.length == 0) {
    const dictionary = (!unfilteredDictionary) ? data : unfilteredDictionary;
    return { subjectCounts: getSubjectItemCount(dictionary), dictionary };
  }

  //* * check active filters */
  const filterSections = processedFilters.map((item) => item[0]);
  const selectedSections = facetfilterConfig.facetSearchData.filter((section) => filterSections
    .indexOf(section.datafield) !== -1);

  const filteredDictionary = newHandleExplorerFilter(processedFilters, filterHashMap);
  const filteredDictCounts = getSubjectItemCount(filteredDictionary);

  const { inclusion, uiDisplay } = allActiveFilters;
  //* * if any inclusion filter is active - inclusion behavior for both filter by inclusion and nodes */
  if (inclusion?.length > 0 || uiDisplay?.length > 0) {
    return inclusionFilterHelper(data, allActiveFilters, currentFilter);
  }
  //* * filter by only nodes - any search filter item that filters the node (this excludes inclusion) */
  //* * filter by only one subject or one section */
  if (processedFilters.length == 1) {
    const selectedSectionCounts = getSubjectItemCount(unfilteredDictionary, selectedSections);
    const combinedSubjectCounts = { ...filteredDictCounts, ...selectedSectionCounts };
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary };
  }
  //* * multiple filter - apply case based inclusion and exclusion filter mehtod for subject count */
  const subjectCount = subjectCountBaseOnExclusionAndIncusionFilter(processedFilters,
    filterHashMap, selectedSections, filteredDictionary, allActiveFilters, currentFilter);
  if (subjectCount) return subjectCount;

  const selectedSectionCounts = getSubjectItemCount(filteredDictionary, selectedSections);
  const combinedSubjectCounts = { ...filteredDictCounts, ...selectedSectionCounts };
  //* * filter by multiple sections */
  return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary };
};

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
      const categoryItem = allActiveFilters.category.filter((item) => item.toLowerCase() === key);
      if (value === 0 && categoryItem.length === 0) {
        selectedSectionCounts[key] = inclusionSectionCounts[key];
      }
    }
    const combinedSubjectCounts = { ...filteredDictCounts, ...selectedSectionCounts };
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary };
  }

  if (processedFilters.length > 2) {
    const currentSelection = selectedSections.filter((item) => item.datafield === currentFilter.datafield)[0];
    const otherFilters = processedFilters.filter((item) => item[0] !== currentFilter.datafield);
    const otherInclusionDictionary = newHandleExplorerFilter(otherFilters, filterHashMap);
    const otherSelectionCounts = getSubjectItemCount(otherInclusionDictionary, selectedSections);
    if (currentSelection) {
      currentSelection.checkboxItems.forEach((item) => {
        const key = item.name.toLowerCase();
        if (selectedSectionCounts[key] == 0) {
          selectedSectionCounts[key] = otherSelectionCounts[key];
        }
      });
    }

    const combinedSubjectCounts = { ...filteredDictCounts, ...selectedSectionCounts };
    return { subjectCounts: combinedSubjectCounts, dictionary: filteredDictionary };
  }
  return null;
};

export const excludeSystemProperties = (node) => {
  const properties = node.properties && Object.keys(node.properties)
    .filter((key) => (node.systemProperties ? !node.systemProperties.includes(key) : true))
    .reduce((acc, key) => {
      acc[key] = node.properties[key];
      return acc;
    }, {});
  return properties;
};

/** * toggle check box action */
export const toggleCheckBoxAction = (payload, state) => {
  const currentAllFilterVariables = payload === {} ? allFilters()
    : createFilterVariables(payload, state.allActiveFilters);
  if (_.isEqual(currentAllFilterVariables, allFilters())) {
    clearAllFilters();
  }
  return currentAllFilterVariables;
};

/**
 * sort hierarchy order of filter nodes
 */
export const setNodeHierarchy = (dictionary, nodeHierarchy) => {
  const nodes = nodeHierarchy.reduce((result, key) => {
    if (dictionary[key]) {
      result[key] = _.cloneDeep(dictionary[key]);
    }
    return result;
  }, {});
  return nodes;
}

/**
 * Sets the active filters  group checkboxes  isChecked to true.
 */
export function setSelectedVlauesToTrue(checkboxItems, filters) {
  const result = checkboxItems.map((checkboxItem) => {
    if (filters.includes(checkboxItem.name)) return { ...checkboxItem, isChecked: true };
    return checkboxItem;
  });
  return result;
}

/**
 * Sets the active filters checkboxes isChecked to true.
 */
export function setSelectedFilterValues(checkboxData, Filters) {
  const result = checkboxData.map((filterGroup) => {
    if (Array.isArray(Filters[filterGroup.datafield])
     && Filters[filterGroup.datafield].length !== 0) {
      return {
        groupName: filterGroup.groupName,
        checkboxItems: setSelectedVlauesToTrue(
          filterGroup.checkboxItems,
          Filters[filterGroup.datafield],
        ),
        datafield: filterGroup.datafield,
        show: filterGroup.show,
        section: filterGroup.section,
        tooltip: filterGroup.tooltip,
      };
    }
    return filterGroup;
  });
  return result;
}

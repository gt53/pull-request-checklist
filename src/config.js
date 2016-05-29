'use strict';

// TODO: This module and particularly the handling of custom config is messy

let repoSpecificItems = [];
let defaultChecklistItems = [
  {
    key: 'tests',
    label: 'Add or update unit and integration tests'
  },
  {
    key: 'security',
    label: 'Verify no security issues are being introduced'
  },
  {
    key: 'documentation',
    label: 'Add or update documentation'
  },
];

/**
 * To add repo-specific checklist items, insert code above this
 * comment that pushes a config block onto repoSpecificItems as
 * shown immediately below this comment
 */
/*
repoSpecificItems.push({
  repo: 'name-of-repo'

  // false to append to defaultChecklistItems; true to replace default items
  replacesDefault: false,

  items: [
    {
      key: 'keyName', // unique key name used internally to identify item
      label: 'checkboxLabel'
    }
  ]
});
*/

let checklistItems = defaultChecklistItems;
let currentRepoConfig = getRepoSpecifcConfig();
if (currentRepoConfig) {
  if (currentRepoConfig.replacesDefault === false) {
    checklistItems = checklistItems.concat(currentRepoConfig.items);
  } else if (currentRepoConfig.replacesDefault === true) {
    checklistItems = currentRepoConfig.items;
  }
}

function getRepoSpecifcConfig() {
  let currentRepo = window.location.pathname.replace(/^\/.+\/(.+)\/pull\/\d+/, '$1');
  if (repoSpecificItems.length) {
    let repoConfig = repoSpecificItems.find((repoSpecificItem) => repoSpecificItem.repo === currentRepo);
    if (repoConfig && repoConfig.items && repoConfig.items.length) {
      return repoConfig;
    }
  }
  return undefined;
}

module.exports = {
  checklistItems: checklistItems,
};

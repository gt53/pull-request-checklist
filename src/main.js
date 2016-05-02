const config = require('./config');
const checklistTemplate = require('../checklist.nunjucks');

const domIds = {
  checklist: 'pr-extension-checklist',
};
const selectors = {
  discussionHeader: '#partial-discussion-header',
};

let props = {};

function init() {
  injectChecklist();
}

function injectChecklist() {
  let discussionHeader = document.querySelector(selectors.discussionHeader);
  if (!discussionHeader) return;

  let div = document.createElement('div');
  let markup = checklistTemplate.render({
    id: domIds.checklist,
    items: config.checklistItems
  });

  div.innerHTML = markup;

  let headerParent = discussionHeader.parentNode;
  headerParent.insertBefore(div, discussionHeader.nextSibling);
}

init();

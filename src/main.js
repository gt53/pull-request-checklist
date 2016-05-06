/**
 * @module main
 */

const config = require('./config');
const auth = require('./auth');
const checklistTemplate = require('../templates/checklist.nunjucks');
const authTemplate = require('../templates/auth.nunjucks');

const domIds = {
  checklist: 'pr-extension-checklist',
};
const selectors = {
  discussionHeader: '#partial-discussion-header',
};

let props = {};

function init() {
  injectHeaderContent();
}

function injectHeaderContent() {
  let discussionHeader = document.querySelector(selectors.discussionHeader);
  if (!discussionHeader) return;

  let div = document.createElement('div');
  let markup;

  if (auth.isAuthorized()) {
    markup = checklistTemplate.render({
      id: domIds.checklist,
      items: config.checklistItems
    });
  } else {
    markup = authTemplate.render({ id: domIds.checklist, });
  }

  div.innerHTML = markup;

  let headerParent = discussionHeader.parentNode;
  headerParent.insertBefore(div, discussionHeader.nextSibling);
}

init();

/**
 * @module main
 */

const config = require('./config');
const auth = require('./auth');
const checklistTemplate = require('../templates/checklist.nunjucks');
const authTemplate = require('../templates/auth.nunjucks');

const domIds = {
  header: 'pr-extension-header',
};
const selectors = {
  gitHubDiscussionHeader: '#partial-discussion-header',
};

let props = {};

function init() {
  injectHeaderContent();
}

function injectHeaderContent() {
  let discussionHeader = document.querySelector(selectors.gitHubDiscussionHeader);
  if (!discussionHeader) return;

  let markup;
  let isAuthenticated = auth.isAuthenticated();
  let div = document.createElement('div');

  if (isAuthenticated) {
    markup = checklistTemplate.render({
      id: domIds.header,
      items: config.checklistItems
    });
  } else {
    markup = authTemplate.render({ id: domIds.header });
  }

  div.innerHTML = markup;

  let headerParent = discussionHeader.parentNode;
  headerParent.insertBefore(div, discussionHeader.nextSibling);

  if (!isAuthenticated) {
    attachAuthEventHandlers();
  }
}

function attachAuthEventHandlers() {
  let tokenSaveButton = document.querySelector(`#${domIds.header}.auth button`);
  tokenSaveButton.addEventListener('click', (e) => {
    let tokenInput = document.querySelector(`#${domIds.header}.auth .access-token`);
    let tokenValue = tokenInput && tokenInput.value;
    if (tokenValue) {
      auth.setToken(tokenValue);
    }
  });
}

init();

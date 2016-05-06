/**
 * @module main
 */

const config = require('./config');
const auth = require('./auth');
const xhr = require('./xhr');
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
  let isAuthorized = auth.isAuthorized();
  let div = document.createElement('div');

  if (isAuthorized) {
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

  if (!isAuthorized) {
    attachAuthEventHandlers();
  } else {
    loadChecklist();
  }
}

function attachAuthEventHandlers() {
  let tokenSaveButton = document.querySelector(`#${domIds.header}.auth button`);
  tokenSaveButton.addEventListener('click', (e) => {
    let tokenInput = document.querySelector(`#${domIds.header}.auth .access-token`);
    let tokenValue = tokenInput && tokenInput.value;
    if (tokenValue) {
      auth.setToken(tokenValue);

      // Remove the auth section
      let authSection = document.querySelector(`#${domIds.header}.auth`);
      if (authSection && authSection.parentNode) {
        authSection.parentNode.removeChild(authSection);
        authSection = null;
        tokenSaveButton = null;
      }

      // Re-init to load checklist
      init();
      // TODO: Add messaging for user setting a token but then auth failing
    }
  });
}

function loadChecklist() {
  // TODO: Get and parse existing comments to see if any of the 
  // checklist items have been completed

  attachChecklistEventHandlers();
}

function attachChecklistEventHandlers() {
  let checklist = document.querySelector(`#${domIds.header}.checklist`);
  checklist.addEventListener('click', (e) => {
    let target = e.target;
    let checklistKey = target.getAttribute('data-checklist-key');
    if (!checklistKey) return;

  });
}

init();

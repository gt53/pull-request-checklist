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
      }

      // Re-init to load checklist
      init();
      // TODO: Add messaging for user setting a token but then auth failing
    }
  });
}

init();

/**
 * @module main
 */

const config = require('./config');
const auth = require('./auth');
const gitHubApi = require('./github-api');
const checklistTemplate = require('../templates/checklist.nunjucks');
const authTemplate = require('../templates/auth.nunjucks');
const mergeTemplate = require('../templates/merge-prompt.nunjucks');

const domIds = {
  header: 'pr-checklist-extension-header',
  mergePrompt: 'pr-checklist-extension-merge-prompt',
};
const selectors = {
  gitHubDiscussionHeader: '#partial-discussion-header',
  mergeContainer: '.merge-pr',
  mergeButton: 'button.btn-primary',
};

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
  // Mark checked any checkbox items that have already been checked
  gitHubApi.getComments()
    .then((result) => {
      let comments = result.body;
      config.checklistItems.forEach((item) => {
        if (gitHubApi.getCommentId(item.key, comments)) {
          let check = document.querySelector(`#${domIds.header} input[data-checklist-key="${item.key}"]`);
          if (check) {
            check.checked = true;
          }
        }
      });
    })
    .then(() => {
      promptMerge();
    })
    .catch((reason) => {
      console.dir(reason);
    });

  attachChecklistEventHandlers();
}

function attachChecklistEventHandlers() {
  let checklist = document.querySelector(`#${domIds.header}.checklist`);
  checklist.addEventListener('click', (e) => {
    let target = e.target;
    let checklistKey = target.getAttribute('data-checklist-key');
    if (!checklistKey) return;

    if (target.checked) {
      gitHubApi.addComment(checklistKey);
    } else {
      gitHubApi.deleteComment(checklistKey);
    }

  });
}

function promptMerge() {
  let mergeContainer = document.querySelector(selectors.mergeContainer);
  let mergeButton = mergeContainer && mergeContainer.querySelector(selectors.mergeButton);
  if (!mergeButton) return;

  mergeButton.addEventListener('click', (e) => {
    let uncheckedItems = getUncheckedItems();
    if (!uncheckedItems.length) return;

    e.preventDefault();
    e.stopPropagation();

    let markup = mergeTemplate.render({
      items: uncheckedItems
    });
    let div = document.createElement('div');
    div.id = domIds.mergePrompt;
    div.innerHTML = markup;
    document.body.appendChild(div);
  });
}

function getUncheckedItems() {
  return config.checklistItems.filter((item) => {
    let check = document.querySelector(`#${domIds.header} input[data-checklist-key="${item.key}"]`);
    return check === undefined || check.checked === false;
  });
}

init();

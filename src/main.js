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
  cancelMergeButton: '.commit-form-actions button.js-details-target',
};

function init() {
  injectHeaderContent();
}

function injectHeaderContent() {
  let discussionHeader = document.querySelector(selectors.gitHubDiscussionHeader);
  if (!discussionHeader) return;

  let markup;
  let isAuthorized = auth.isAuthorized();
  let authSection = document.createElement('div');

  if (isAuthorized) {
    markup = checklistTemplate.render({
      id: domIds.header,
      items: config.checklistItems
    });
  } else {
    markup = authTemplate.render({ id: domIds.header });
  }

  authSection.innerHTML = markup;

  let headerParent = discussionHeader.parentNode;
  headerParent.insertBefore(authSection, discussionHeader.nextSibling);

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
    .then(hookMerge)
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

function hookMerge() {
  let mergeContainer = document.querySelector(selectors.mergeContainer);
  let mergeButton = mergeContainer && mergeContainer.querySelector(selectors.mergeButton);
  if (!mergeButton) return;

  mergeButton.addEventListener('click', mergeButtonHandler);

  function mergeButtonHandler(mergeButtonEvent) {
    // Inspect checkbox items state that get set in loadChecklist()
    let uncheckedItems = getUncheckedItems();
    if (!uncheckedItems.length) return;

    mergeButtonEvent.preventDefault();
    mergeButtonEvent.stopPropagation();

    // Add merge prompt to DOM
    let markup = mergeTemplate.render({
      items: uncheckedItems
    });
    let promptDiv = document.createElement('div');
    promptDiv.id = domIds.mergePrompt;
    promptDiv.innerHTML = markup;
    document.body.appendChild(promptDiv);

    // Add cancel / proceed event handlers
    promptDiv.addEventListener('click', (e) => {
      let targetClasses = e.target.classList;
      if (targetClasses.contains('perform-merge')) {
        promptDiv.parentNode.removeChild(promptDiv);

        // Allow merge to proceed and activate merge button
        mergeButton.removeEventListener('click', mergeButtonHandler);
        mergeButtonEvent.target.click();

        // Hook the merge button again if the merge is cancelled
        let cancelMergeButton = mergeContainer.querySelector(selectors.cancelMergeButton);
        if (cancelMergeButton) {
          hookMerge();
        }
      } else if (targetClasses.contains('cancel-merge')) {
        promptDiv.parentNode.removeChild(promptDiv);
      }
    });
  }
}

function getUncheckedItems() {
  return config.checklistItems.filter((item) => {
    let check = document.querySelector(`#${domIds.header} input[data-checklist-key="${item.key}"]`);
    return check === undefined || check.checked === false;
  });
}

init();

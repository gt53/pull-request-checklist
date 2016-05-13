/**
 * @module github-api
 * @see {@link https://developer.github.com/v3/issues/comments}
 */

const request = require('superagent');
const auth = require('./auth');
const config = require('./config');

const apiUrlStart = 'https://api.github.com';
const commentPreface = '[Checklist auto-comment]';

function getComments() {
  return new Promise((resolve, reject) => {
    request
      .get(getCommentsUrl())
      .set('Authorization', getAuthHeader())
      .end((error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
  });
}

function addComment(checklistKey) {
  let checklistItem = getChecklistItem(checklistKey);
  if (!checklistItem) return;

  let comment = `${commentPreface} \`${checklistItem.label}\`: :+1:`;
  request
    .post(getCommentsUrl())
    .send({ body: comment || '' })
    .set('Authorization', getAuthHeader())
    .end((err, res) => {});
}

// TODO: After a comment is deleted, it still appears on the page
// until the page is reloaded. Figure out a way to trigger an async
// update like when a comment is added or message the user to avoid confusion
function deleteComment(checklistKey) {
  let url = getCommentsUrl();
  getComments()
    .then((result) => {
      let commentId = getCommentId(checklistKey, result.body);
      if (!commentId) return;

      // Strip issue number from URL
      url = url.replace(/(\/issues)\/\d+\/(comments\/?)/, '$1/$2');

      url += `/${commentId}`;
      request
        .del(url)
        .set('Authorization', getAuthHeader())
        .end((error, result) => {});
    })
    .catch((reason) => {});
}

function getChecklistItem(key) {
  let items = config.checklistItems;
  for (let i = 0; i < items.length; i++) {
    if (items[i].key === key) {
      return items[i];
    }
  }
  return undefined;
}

function getCommentId(checklistKey, comments) {
  let checklistItem = getChecklistItem(checklistKey);
  for (let i = 0; i < comments.length; i++) {
    let comment = comments[i];
    let preface = commentPreface.replace(/\[/, '\\[').replace(/\]/, '\\]');
    let prefacePattern = new RegExp(`^${preface}`);
    if (prefacePattern.test(comment.body) && comment.body.indexOf(checklistItem.label) !== -1) {
      return comment.id;
    }
  }
  return undefined;
}

function getAuthHeader() {
  return `token ${auth.getToken()}`;
}

function getCommentsUrl() {
  let url = `${apiUrlStart}/repos${window.location.pathname}`;
  url = url.replace(/(\/pull\/\d+).*/, '$1');
  url = url.replace(/\/pull\//, '/issues/');
  url += '/comments';
  return url;
}

module.exports = {
  getComments: getComments,
  addComment: addComment,
  deleteComment: deleteComment,
  getCommentId: getCommentId,
};

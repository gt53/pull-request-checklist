/**
 * @module github-api
 * @see {@link https://developer.github.com/v3/issues/comments}
 */

const request = require('superagent');
//const request = require('superagent-bluebird-promise'); // TODO: Remove as dependency if end up not using
const auth = require('./auth');
const config = require('./config');
const apiUrlStart = 'https://api.github.com';

const commentPreface = '[Checklist auto-comment]';

function getPullRequestData() {
  return new Promise((resolve, reject) => {
    request
      .get(getPullRequestUrl())
      .set('Authorization', getAuthHeader())
      .end((error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
  });
}

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
    .end((err, res) => {
      console.dir(res);
    });
}

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
        .end((error, result) => {
          console.dir(error);
          console.dir(result);
        });
    })
    .catch((reason) => {
      console.dir(reason);
    });
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

function getPullRequestUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}`.replace(/\/pull\//, '/pulls/');
}

function getCommentsUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}/comments`.replace(/\/pull\//, '/issues/');
}

module.exports = {
  getPullRequestData: getPullRequestData,
  getComments: getComments,
  addComment: addComment,
  deleteComment: deleteComment,
  getCommentId: getCommentId,
};

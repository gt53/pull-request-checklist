/**
 * @module github-api
 * @see {@link https://developer.github.com/v3/issues/comments}
 */

const request = require('superagent');
//const request = require('superagent-bluebird-promise'); // TODO: Remove as dependency if end up not using
const auth = require('./auth');
const config = require('./config');
const apiUrlStart = 'https://api.github.com';

const commentPreface = '[PR Checklist auto-comment]';

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
  request
    .get(getCommentUrl())
    .set('Authorization', getAuthHeader())
    .end((error, result) => {
    });
}

function addComment(checklistKey) {
  let checklistItem = getChecklistItem(checklistKey);
  if (!checklistItem) return;

  let comment = `${commentPreface} \`${checklistItem.label}\` -- good to go`;
  request
    .post(getCommentUrl())
    .send({ body: comment || '' })
    .set('Authorization', getAuthHeader())
    .end((err, res) => {
      console.dir(err);
      console.dir(res);
    });
}

function deleteComment(checklistKey) {
  let url = getCommentUrl();
  // TODO: Append '/:id'
  /*
  request
    .del(url)
    .set('Authorization', getAuthHeader())
    .end((error, result) => {
    });
    */
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

function getAuthHeader() {
  return `token ${auth.getToken()}`;
}

function getPullRequestUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}`.replace(/\/pull\//, '/pulls/');
}

function getCommentUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}/comments`.replace(/\/pull\//, '/issues/');
}

module.exports = {
  getPullRequestData: getPullRequestData,
  getComments: getComments,
  addComment: addComment,
  deleteComment: deleteComment,
};

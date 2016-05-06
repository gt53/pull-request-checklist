/**
 * @module github-api
 */

const request = require('superagent');
const auth = require('./auth');
const apiUrlStart = 'https://api.github.com';

function getPullRequestData() {
  request
    .get(getPullRequestUrl())
    .set('Authorization', getAuthHeader())
    .end((error, result) => {
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
  request
    .post(getCommentUrl())
    .set('Authorization', getAuthHeader())
    .send({
      body: checklistKey || '',
      commit_id: '',
      path: '',
      position: ''
    })
    .end((error, result) => {
    });
}

function deleteComment() {
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

function getAuthHeader() {
  return `token ${auth.getToken()}`;
}

function getPullRequestUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}`.replace(/\/pull\//, '/pulls/');
}

function getCommentUrl() {
  return `${apiUrlStart}/repos${window.location.pathname}/comments`;
}

module.exports = {
  getPullRequestData: getPullRequestData,
  getComments: getComments,
  addComment: addComment,
  deleteComment: deleteComment,
};

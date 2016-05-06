/**
 * @module auth
 */

const tokenKey = 'pr-checklist-extension-auth';

function isAuthorized() {
  return getToken() !== undefined;
}

function getToken() {
  return localStorage.getItem(tokenKey) || undefined;
}

function setToken(value) {
  localStorage.setItem(tokenKey, value);
}

function removeToken() {
  localStorage.removeItem(tokenKey);
}

module.exports = {
  isAuthorized: isAuthorized,
  getToken: getToken,
  setToken: setToken,
  removeToken: removeToken,
};

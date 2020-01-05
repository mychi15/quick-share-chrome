import "../css/popup.css";

const BACKEND_URL = process.env.NODE_ENV === 'production' ? "http://q.milushov.ru" : "http://localhost:3000";
console.log('BACKEND_URL', BACKEND_URL);
var isShared = false;

document.addEventListener('DOMContentLoaded', function(){
  console.log('Extension Loaded');

  const $title = document.getElementById('title');
  const $signOutButton = document.getElementById('sign-out-button');
  const $form = document.getElementById('form');
  const $tokenField = document.getElementById('token');
  const $shareInfo = document.getElementById('share-info');

  chrome.storage.sync.get('token', (data) => {
    const { token } = data || {};

    if (token) {
      $title.innerHTML = `Hello, <b>${token}</b>`;
      $title.style.textAlign = 'left';

      $signOutButton.style.display = 'inline';
      $signOutButton.addEventListener("click", (e) => {
        chrome.storage.sync.remove('token', () => {
          console.log("Token removed")
          location.reload();
        });
      });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const curTab = tabs[0];
        const title = curTab.title;
        const url = curTab.url || curTab.pendingUrl;
        $shareInfo.style.display = 'block';
        saveLinkInBackend(token, title, url, () => {
          $shareInfo.innerHTML = `"${title.substring(0, 18)}" — Shared!`;
        })
      });

    } else {
      console.log("We don't have token, so open form");
      $form.style.display = 'block';
      $form.addEventListener("submit", (e) => {
        e.preventDefault();
        chrome.storage.sync.set({token: $tokenField.value}, () => {
          console.log("Token saved");
          location.reload();
        });
      })
    }
  })

}, false);

function saveLinkInBackend(token, title, url, callback) {
  if (isShared) return;
  isShared = true;
  const req = new XMLHttpRequest();
  const baseUrl = `${BACKEND_URL}/${token}/links`;
  const urlParams = `title=${title}&url=${url}`;

  req.timeout = 2e3;
  req.open("POST", baseUrl, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send(urlParams);

  req.onreadystatechange = function() {
    if (this.readyState !== XMLHttpRequest.DONE) return;
    if (this.status === 200) {
      callback.call(this);
    } else {
      console.log("Something wrong", this);
    }
  }
}

import "../css/popup.css";

document.addEventListener('DOMContentLoaded', function(){
  console.log('Loaded');

  const $title = document.getElementById('title');
  const $signOutButton = document.getElementById('sign-out-button');
  const $form = document.getElementById('form');
  const $tokenField = document.getElementById('token');
  const $shareButton = document.getElementById('share-button');

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
        const url = curTab.url || curTab.pendingUrl;
        const title = curTab.title;
        console.log(url, title);
        $shareButton.style.display = 'block';
        $shareButton.value = `"${title.substring(0, 20)}" — Share!`;
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

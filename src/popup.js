'use strict';

import './popup.css';

(function() {

  const successContainer = document.querySelector("#app-success");
  const failureContainer = document.querySelector("#app-failure");

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'BLOCK',
      },
      response => {
        if(response.status) {
          console.log('Ad Blocker Blocker blocked succesfully!');
          failureContainer.classList.add('hide');
          successContainer.classList.remove('hide')
        }
        else {
          console.log("Nope! That didn't work");
          successContainer.classList.add('hide');
          failureContainer.classList.remove('hide')
        }
      }
    );

  });


})();

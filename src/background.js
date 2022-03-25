'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'BLOCK') {
//     chrome.scripting.executeScript({file: 'logic.js', tabId});

//     // Log message coming from the `request` parameter
//     console.log(request);
//     // Send a response message
    
//     sendResponse({});
//   }
// });

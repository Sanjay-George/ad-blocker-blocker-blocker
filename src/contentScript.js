'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts



function isElementPartiallyVisible (el) {
  var rect = el.getBoundingClientRect();

  // Using OR instead of AND, since we want to consider even partially visible elements.
  return (
      rect.top >= 0 
      || rect.left >= 0 
      || Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) 
      || Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


const getAllElementsInViewPort = () => {
  const elements = Array.from(document.querySelectorAll('*'));
  return elements.filter(item => isElementPartiallyVisible(item));
}; 

const sortElementsByZIndex = (elements) => {
  if(!elements || !elements.length)       return [];

  const filteredELements = elements.filter(element => {
      const computedStyle = window.getComputedStyle(element);
      return (
          computedStyle.zIndex !== 'auto' 
          && parseInt(computedStyle.zIndex, 10) > 0
          && computedStyle.display !== 'none'
      );
  });

  const elementsSortedByZIndex = filteredELements.sort((a, b) => {
      return ( 
          parseInt(window.getComputedStyle(a).zIndex, 10) 
              >= parseInt(window.getComputedStyle(b).zIndex, 10) 
          ? -1 
          : 1
      );
  });
  return elementsSortedByZIndex;
};

const enableScroll = (element) => {
  const computedStyle = window.getComputedStyle(element);
  const { position, overflow }  = computedStyle;

  if(overflow !== 'hidden') {
      return;
  }

  // TODO: MAKE THE LOGIC SMARTER
  // 1. (DONE) Set overflow to scroll only if the content is actually bigger 
  //    than the visible part (even with overflow=hidden set
  // 2. 

  if ((element.offsetHeight || element.clientHeight) < element.scrollHeight) {
     element.style.setProperty('overflow', 'scroll', 'important');
  }
  if(position === 'fixed') { 
    element.style.setProperty('position', 'relative', 'important'); 
  }
};

const enableBodyScroll = () => {
  const elements = document.querySelectorAll("*");
  elements.forEach(element => {
      enableScroll(element);
  });
};

const removeTopMostElements = (elements) => {
  // TODO: CONSIDER REMOVING FULL SCREEN ELEMENTS AS WELL (eg: div used for background blur)
  if(!elements || !elements.length)   return false;

  const topZIndex = parseInt(window.getComputedStyle(elements[0]).zIndex, 10);
  console.log(`highest zIndex: ${topZIndex}`);
  const targets = elements.filter(item => parseInt(window.getComputedStyle(item).zIndex, 10) === topZIndex);

  targets.forEach(element => {
      element.remove();
  });
  return true;
};


const blockAdBlockerBlocker = () => { 
  const viewPortElements = getAllElementsInViewPort();
  const elementsSortedByZIndex = sortElementsByZIndex(viewPortElements);

  if(!removeTopMostElements(elementsSortedByZIndex)) {
    return false;
  }

  enableBodyScroll();
  return true;
}; 


// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'BLOCK') {
    console.log('Trying to block the adblocker blocker!');
    let status = blockAdBlockerBlocker();
    sendResponse({ status: status });
    return true;
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({ status: false });
  return true;
});
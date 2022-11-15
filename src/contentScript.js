'use strict';

// const natural = require('natural');

const WEIGHTS = {
  Z_INDEX: 30,
  VISIBLE_AREA: 50,
};

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts


// TODO: Form regexes off these, instead of comparing strings directly. 
// This is to account for filler words
// TODO: use NLP here for stemming
// https://opensource.com/article/19/3/natural-language-processing-tools
const adBlockerBlockerKeywords = { 
  "disable": 10,
  "whitelist": 10,
  "ad blocker": 30,
  "turn off ad blocker": 50,
  "disable ad blocker": 50, 
}; 



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
  const elements = Array.from(document.querySelectorAll('body *'));
  return elements.filter(item => isElementPartiallyVisible(item));
}; 

const isVisible = element => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.visibility !== 'hidden';
  // INFO: no need to check for display !== 'none', since when element's display is set to none, it occupies no space
  //  and getBoundingClientRect() values will be 0, which we check in `isElementPartiallyVisible`.
}

// const sortElementsByZIndexAscending = elements => {
//   const filteredELements = elements.filter(element => {
//       const computedStyle = window.getComputedStyle(element);
//       return (
//           computedStyle.zIndex !== 'auto' 
//           && parseInt(computedStyle.zIndex, 10) > 0
//           && isVisible(element)
//       );
//   });

//   const finalElements = filteredELements.sort((a, b) => {
//       return ( 
//           parseInt(window.getComputedStyle(a).zIndex, 10) 
//               <= parseInt(window.getComputedStyle(b).zIndex, 10) 
//           ? -1 
//           : 1
//       );
//   });
//   return finalElements;
// };

// const assignScoresByZIndex = elements => {
//   if(!elements || !elements.length)       return [];

//   const sortedElements = sortElementsByZIndexAscending(elements);

//   sortedElements.forEach((element, index) => {
//     element.weight = element.weight 
//       ?  element.weight + (WEIGHTS.Z_INDEX * (index + 1)) 
//       : (WEIGHTS.Z_INDEX * (index + 1)); 
//   });
// }


const assignScores = elements => {
  if(!elements || !elements.length)       return;

  const filteredELements = elements.filter(element => isVisible(element));

  const finalElements = filteredELements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const childCount = element.childElementCount;    
    
    const computedStyle = window.getComputedStyle(element);
    const zIndex = 
      computedStyle.zIndex !== 'auto' && parseInt(computedStyle.zIndex, 10) > 0
        ? parseInt(computedStyle.zIndex, 10)
        : 0;

    const calculatedWeight = (rect.height * rect.width * zIndex * zIndex  );
    
    element.weight = element.weight ? element.weight + calculatedWeight : calculatedWeight;
    
    // TODO: remove this later
    element.meta = {
      height: rect.height,
      width: rect.width,
      zIndex: zIndex,
    };

  });

  return finalElements;
};

// const assignScoresByVisibleArea = elements => {
//   if(!elements || !elements.length)       return;

//   const sortedElements = sortElementsByVisibleAreaAndChildCountAscending(elements);
  
//   sortedElements.forEach((element, index) => {
//     element.weight = element.weight 
//       ?  element.weight + (WEIGHTS.VISIBLE_AREA * (index + 1)) 
//       : (WEIGHTS.VISIBLE_AREA * (index + 1)); 
//   });

// };


// TODO:Improve this logic 
const enableScroll = element => {
  const computedStyle = window.getComputedStyle(element);
  const { position, overflow }  = computedStyle;

  if(overflow !== 'hidden') {
      return;
  }

  if ((element.offsetHeight || element.clientHeight) <= element.scrollHeight) {
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



const removeBestMatchedElements = (elements)  => {
  // TODO: CONSIDER REMOVING FULL SCREEN ELEMENTS AS WELL (eg: div used for background blur)
  // removing top most elements isn't making sense, since there could be other elements with greater z-index
  // eg: https://www.independent.co.uk/asia/east-asia/kim-jong-un-north-korea-video-missile-test-b2044392.html

  if(!elements || !elements.length)   return false;

  // const topZIndex = parseInt(window.getComputedStyle(elements[0]).zIndex, 10);
  // console.log(`highest zIndex: ${topZIndex}, element: ${elements[0]}`);
  // const targets = elements.filter(item => parseInt(window.getComputedStyle(item).zIndex, 10) === topZIndex);

  const elementsSortedByWeightDescending = elements.sort((a, b) => {
    return a.weight > b.weight ? -1 : 1;
  });

  // console.log(elementsSortedByWeightDescending.slice(0, 20));

  elementsSortedByWeightDescending.slice(0, 20).forEach(item => {
    console.log(item, item.meta);
  });

  // TODO: Uncomment this
  // TODO: while removing elements, check keywords. Also remove if the innerText of the element is empty (background blur)
  // elementsSortedByWeightDescending[0].remove();

  // targets.forEach(element => {
  //     element.remove();
  // });
  return true;
};


const blockAdBlockerBlocker = () => { 
  const viewPortElements = getAllElementsInViewPort();

  // assignScoresByZIndex(viewPortElements);
  // assignScoresByVisibleArea(viewPortElements);
  assignScores(viewPortElements);
  
  // TODO:  Directly remove elements matching keywords ?

  // const elementsSortedByVisibleArea = sortElementsByVisibleArea(viewPortElements);
  // const elementsSortedBy 
  // const elementsMatchingKeywords = getElementsMatchingKeywords(viewPortElements); 


  if(!removeBestMatchedElements(viewPortElements)) {
    return false;
  }

  // TODO: Uncomment this
  // enableBodyScroll();
  return true;
}; 


// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'BLOCK') {
    console.log('Trying to block the adblocker blocker!');
    let status = blockAdBlockerBlocker();
    sendResponse({ status: status });

    // console.log(natural.PorterStemmer.stem("disabled"));
    
    return true;
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({ status: false });
  return true;
});




/*
A. Consider only elements that are at least partially visible (using BoundingClientRect)
B. Features to consider                     weight
i.   Z index                                30 * order/index in array
ii.  Area (l * w) occupied in viewport      50 * area
iii. Number of children                     Math.round(highest childCount/ element childCount) 
iv. Text Context of element                 keyword-weight mapping

C. Approaches
1. Knock off the elements with heighest weight
2. Create list of each Feature. Knock off elements that are intersecting (top 2-3)

D. Cases
To eliminate background blur (if a div is used)
- area feature/weight should take care of this 


*/
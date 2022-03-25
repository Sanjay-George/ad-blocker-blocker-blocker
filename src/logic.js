/*

LOGIC
1. Get all elements in document

2. Check which all elements are in viewport (to reduce processing) 
- use getBoundingClientRect()
https://stackoverflow.com/questions/123999/how-can-i-tell-if-a-dom-element-is-visible-in-the-current-viewport

3. Foreach element in viewport, get ComputedStyle and see if (zIndex !== 'auto' && zIndex > 0)
https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle

4. Delete the elements with highest Z-index
- need to check with multiple websites
- if multiple such elements, delete common parent?

5. If body contains overflow: hidden, remove that.

*/

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

    if(position !== 'fixed' || overflow !== 'hidden') {
        return;
    }

    element.style.setProperty('overflow', 'scroll', 'important');
    element.style.setProperty('position', 'relative', 'important');
};

const enableBodyScroll = () => {
    const elements = document.querySelectorAll("*");
    elements.forEach(element => {
        enableScroll(element);
    });
};

const removeTopMostElements = (elements) => {
    if(!elements || !elements.length)   return;

    const topZIndex = parseInt(window.getComputedStyle(elements[0]).zIndex, 10);
    const targets = elements.filter(item => parseInt(window.getComputedStyle(item).zIndex, 10) === topZIndex);

    targets.forEach(element => {
        element.remove();
    });
};


const blockAdBlockerBlocker = () => {
    const viewPortElements = getAllElementsInViewPort();
    const elementsSortedByZIndex = sortElementsByZIndex(viewPortElements);
    removeTopMostElements(elementsSortedByZIndex);
    enableBodyScroll();
}; 


blockAdBlockerBlocker();
function findRecipeList() {
  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6, page, page-content');
  console.log('1', headers);
  
  for (const header of headers) {
    const headerText = header.textContent.toLowerCase();
    console.log('2', headerText);
    
    if (headerText.includes('ingredients')) {
      let sibling = header.nextElementSibling;
      console.log('3', sibling);
      
      while (sibling) {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          return sibling.querySelectorAll('li');
        }
        
        sibling = sibling.nextElementSibling;
        console.log('4', sibling);
      }
      
      break;
    }
  }
  
  return null;
}

// Listen for the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'findRecipe') {
    const recipeListItems = findRecipeList();
    console.log('5', recipeListItems);

    if (recipeListItems) {
      recipeListItems.forEach((listItem) => {
        console.log(listItem.textContent);
        console.log('6');
      });
    } else {
      console.log('Recipe list not found.');
    }
  }
});

function findRecipeList() {
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    for (const header of headers) {
      const headerText = header.textContent.toLowerCase();
      
      if (headerText.includes('recipe')) {
        let sibling = header.nextElementSibling;
        
        while (sibling) {
          if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
            return sibling.querySelectorAll('li');
          }
          
          sibling = sibling.nextElementSibling;
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
  
      if (recipeListItems) {
        recipeListItems.forEach((listItem) => {
          console.log(listItem.textContent);
        });
      } else {
        console.log('Recipe list not found.');
      }
    }
  });
  
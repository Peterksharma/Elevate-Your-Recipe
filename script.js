function findRecipeList() {
  const lists = document.querySelectorAll('ul, ol');
  const recipeLists = []; 

  lists.forEach(list => {
    var ingredientsList = list.querySelectorAll('li');
    for (var ingredient of ingredientsList) {
      var ingredientText = ingredient.textContent.trim();
      var searchCredentials = /(\d+\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|tbsp)/g;
      var match = searchCredentials.exec(ingredientText);
      
      if (match) {
        const quantity = match[1]; 
        const unit = match[2]; 
        console.log(`Found ingredient with Quantity: ${quantity}, Unit: ${unit}`);
      }
    }
    
    recipeLists.push(list); 
  });
  
  return recipeLists.length ? recipeLists : null;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'findRecipe') {
    var recipeListItems = findRecipeList();
    console.log('Found Recipe Lists:', recipeListItems);
    
    if (recipeListItems) {
      recipeListItems.forEach(function(listItem) {
        console.log('List Item Text:', listItem.textContent);
      });
    } else {
      console.log('Recipe list not found.');
    }
  }
});

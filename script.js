
function findRecipeList() {
  const container = document.querySelectorAll('body, ol, li, ul');
  // console.log(container)
  const recipeLists = []; // make an empty array to hold the recipe lists

  if (container) {
    const lists = container.querySelectorAll('ul, ol');
  
    lists.forEach(list => {
      //selecting to lists to search through
      var ingredientsList = list.querySelectorAll('li');
      //loop to search the lists looking for criteria and sees if the list contains the proper information or not
      for (var ingredient of ingredientsList) {
        var ingredientText = ingredient.textContent.trim();
        console.log("am i working?")
        //Looks through lists to find these search credientials. First part searches looking for the whole number or fraction followed by any of the key terms.
        //  "/d+" looks for a digit, "/s+ searches if there is a space" 
        // looks for units
        var searchCredentials = /(\d+\s*(?:\d+\/\d+)?)\s* (cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|)/g; // "/g is global scale"
        var match = searchCredentials.exec(ingredientText);
        
        if (match) {
          const quantity = match[1]; // The quantity of the ingredient
          const unit = match[2]; // The unit of measurement of the ingredient
          console.log(`Quantity: ${quantity}, Unit: ${unit}`);
        }
      }
      
      recipeLists.push(list); // push the list onto the array of recipe lists
    });
    
    return recipeLists; // return the array of recipe lists
  } else {
    return null; // return null if the container is not found
  }
}


// Listen for the message from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(request.action);
  if (request.action === 'findRecipe') {
    var recipeListItems = findRecipeList();
    console.log('5', recipeListItems);
    
    if (recipeListItems) {
      recipeListItems.forEach(function(listItem) {
        console.log(listItem.textContent);
        // localStorage.setItem('Recipe list', JSON.stringify(listItem.textContent));
        console.log('6');
      });
    } else {
      console.log('Recipe list not found.');
    }
  }
});


// Listen for the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log(request.saction)
  if (request.action === 'findRecipe') {
    var recipeListItems = findRecipeList();
    console.log('5', recipeListItems);
    

    if (recipeListItems) {
      recipeListItems.forEach((listItem) => {
        console.log(listItem.textContent);
        // localStorage.setItem('Recipe list', JSON.stringify(listItem.textContent));
        console.log('6');
      });
    } else {
      console.log('Recipe list not found.');
    }
  }
});

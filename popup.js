console.log('Popup script starting...');

// RecipeAdjuster is now available globally
let recipeUI = null;

function initializeUI() {
  console.log('Initializing UI...');
  try {
    class RecipeUI {
      constructor() {
        console.log('RecipeUI constructor called');
        this.slider = document.getElementById("elevation");
        this.output = document.getElementById("rangeValue");
        this.findRecipeButton = document.getElementById('find-recipe');
        
        if (!this.slider || !this.output || !this.findRecipeButton) {
          throw new Error('Required elements not found');
        }
        
        console.log('Find Recipe button found:', this.findRecipeButton);
        this.setupEventListeners();
      }

      setupEventListeners() {
        console.log('Setting up event listeners');
        try {
          // Display Slider Value
          this.output.innerHTML = this.slider.value;
          this.slider.oninput = () => {
            this.output.innerHTML = this.slider.value;
          };

          this.findRecipeButton.addEventListener('click', async () => {
            console.log('Button clicked!');
            try {
              const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
              console.log('Found active tab:', tabs[0]);
              const activeTab = tabs[0];

              // First inject the content scripts
              console.log('Injecting content scripts...');
              await chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['searchCriteria.js']
              });
              
              await chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['script.js']
              });
              
              console.log('Content scripts injected, sending message');
              chrome.tabs.sendMessage(activeTab.id, { action: 'findRecipe' }, (response) => {
                console.log('Got response from content script:', response);
                if (chrome.runtime.lastError) {
                  console.error('Runtime error:', chrome.runtime.lastError);
                  return;
                }
                
                if (response && response.recipe) {
                  console.log('Recipe found:', response.recipe);
                  this.displayRecipe(response.recipe);
                } else {
                  console.log('No recipe found');
                }
              });
            } catch (error) {
              console.error('Error in click handler:', error);
            }
          });
        } catch (error) {
          console.error('Error in setupEventListeners:', error);
        }
      }

      displayRecipe(recipeData) {
        console.log('Displaying recipe:', recipeData);
        if (!recipeData) return;

        // Helper function to parse fractions and mixed numbers
        function parseAmount(amount) {
          // Remove any spaces
          amount = amount.replace(/\s+/g, '');
          
          // Check if it's a mixed number (e.g., "1 1/2")
          const mixedMatch = amount.match(/^(\d+)\s*(\d+\/\d+)$/);
          if (mixedMatch) {
            const whole = parseInt(mixedMatch[1]);
            const [num, denom] = mixedMatch[2].split('/').map(Number);
            return whole + (num / denom);
          }
          
          // Check if it's a simple fraction (e.g., "1/2")
          const fractionMatch = amount.match(/^(\d+)\/(\d+)$/);
          if (fractionMatch) {
            const [_, num, denom] = fractionMatch;
            return Number(num) / Number(denom);
          }
          
          // Otherwise, just return the number
          return Number(amount);
        }

        try {
          // Display recipe title
          const titleElement = document.querySelector('#recipe-title h1');
          if (titleElement) {
            titleElement.textContent = recipeData.title || 'Recipe';
          }

          // Display original ingredients
          const originalIngredientsContainer = document.getElementById('original-ingredients');
          if (originalIngredientsContainer) {
            originalIngredientsContainer.innerHTML = '';
            if (recipeData.ingredients && recipeData.ingredients.length > 0) {
              recipeData.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                originalIngredientsContainer.appendChild(li);
              });
            }
          }

          // Display parsed ingredients
          const adjustedContainer = document.getElementById('adjusted-ingredients');
          if (adjustedContainer) {
            adjustedContainer.innerHTML = '';
            if (recipeData.parsedIngredients) {
              // Use a Set to track displayed ingredients
              const displayedIngredients = new Set();
              
              // Get the current elevation value
              const elevation = this.slider.value;
              const adjuster = new RecipeAdjuster(parseInt(elevation));
              
              Object.entries(recipeData.parsedIngredients).forEach(([type, ingredients]) => {
                ingredients.forEach(ingredient => {
                  // Create normalized version for deduplication
                  const normalizedIngredient = ingredient.toLowerCase().replace(/\s+/g, ' ').trim();
                  
                  if (!displayedIngredients.has(normalizedIngredient)) {
                    displayedIngredients.add(normalizedIngredient);
                    
                    // Parse the ingredient measurements
                    const volumeMatch = ingredient.match(/(\d+(?:\s*\d*\/\d+)?)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?)/i);
                    const weightMatch = ingredient.match(/\((\d+)\s*(g|grams?)\)/i);
                    
                    if (volumeMatch || weightMatch) {
                      // Create the ingredient section
                      const section = document.createElement('div');
                      section.className = 'adjusted-ingredient';
                      
                      // Add the ingredient type header
                      const header = document.createElement('h4');
                      header.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ':';
                      section.appendChild(header);
                      
                      // Add volume adjustment if available
                      if (volumeMatch) {
                        const [, amount, unit] = volumeMatch;
                        const numericAmount = parseAmount(amount);
                        let adjustedAmount;
                        
                        // Convert to standard units before adjustment
                        let standardAmount;
                        switch(unit.toLowerCase()) {
                          case 'cup':
                          case 'cups':
                            standardAmount = numericAmount;
                            break;
                          case 'tbsp':
                          case 'tablespoon':
                          case 'tablespoons':
                            standardAmount = numericAmount;
                            break;
                          case 'tsp':
                          case 'teaspoon':
                          case 'teaspoons':
                            standardAmount = numericAmount;
                            break;
                          default:
                            standardAmount = numericAmount;
                        }
                        
                        switch(type) {
                          case 'flour':
                            adjustedAmount = adjuster.adjustFlour(standardAmount);
                            break;
                          case 'liquid':
                            adjustedAmount = adjuster.adjustLiquid(standardAmount);
                            break;
                          case 'sugar':
                            adjustedAmount = adjuster.adjustSugar(standardAmount);
                            break;
                          case 'leavener':
                            adjustedAmount = adjuster.adjustLeavening(standardAmount);
                            break;
                        }
                        
                        const volumeDiv = document.createElement('div');
                        volumeDiv.textContent = `Volume: ${amount} ${unit} => ${adjustedAmount.toFixed(2)} ${unit}`;
                        section.appendChild(volumeDiv);
                      }
                      
                      // Add weight adjustment if available
                      if (weightMatch) {
                        const [, amount, unit] = weightMatch;
                        const numericAmount = parseInt(amount);
                        let adjustedAmount;
                        
                        switch(type) {
                          case 'flour':
                            adjustedAmount = adjuster.adjustFlour(numericAmount);
                            break;
                          case 'liquid':
                            adjustedAmount = adjuster.adjustLiquid(numericAmount);
                            break;
                          case 'sugar':
                            adjustedAmount = adjuster.adjustSugar(numericAmount);
                            break;
                          case 'leavener':
                            adjustedAmount = adjuster.adjustLeavening(numericAmount);
                            break;
                        }
                        
                        const weightDiv = document.createElement('div');
                        weightDiv.textContent = `Weight: ${amount}${unit} => ${Math.round(adjustedAmount)}${unit}`;
                        section.appendChild(weightDiv);
                      }
                      
                      adjustedContainer.appendChild(section);
                    }
                  }
                });
              });
            }
          }

          // Display instructions
          const instructionsContainer = document.getElementById('recipe-instructions');
          if (instructionsContainer) {
            instructionsContainer.innerHTML = '';
            instructionsContainer.style.textAlign = 'left';
            if (recipeData.instructions && recipeData.instructions.length > 0) {
              recipeData.instructions.forEach((instruction, index) => {
                const li = document.createElement('li');
                li.style.listStyleType = 'decimal';
                li.style.textAlign = 'left';
                
                // Create a div to hold the instruction text
                const div = document.createElement('div');
                div.className = 'instruction-text';
                div.style.textAlign = 'left';
                
                // Use the HTML content if available, otherwise use text
                if (instruction.html) {
                  div.innerHTML = instruction.html;
                } else {
                  const span = document.createElement('span');
                  span.style.display = 'block';
                  span.style.textAlign = 'left';
                  span.textContent = instruction.text;
                  div.appendChild(span);
                }
                
                li.appendChild(div);
                instructionsContainer.appendChild(li);
              });
            } else {
              instructionsContainer.innerHTML = '<p>No instructions found</p>';
            }
          }
        } catch (error) {
          console.error('Error in displayRecipe:', error);
        }
      }
    }

    recipeUI = new RecipeUI();
  } catch (error) {
    console.error('Error initializing UI:', error);
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = '<div class="error">Error loading extension. Please try reloading.</div>';
    }
  }
}

// Initialize the UI when the document is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}
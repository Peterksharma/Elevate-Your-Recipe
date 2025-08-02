/**
 * Main Application Logic for Elevate Your Recipe Website
 */
class RecipeApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentRecipe = null;
        this.currentAdjuster = null;
        this.extractedIngredients = null;
    }

    initializeElements() {
        // Input elements
        this.recipeTitleInput = document.getElementById('recipe-title');
        this.recipeUrlInput = document.getElementById('recipe-url');
        this.instructionsInput = document.getElementById('instructions');
        
        // Elevation control
        this.elevationSlider = document.getElementById('elevation-slider');
        this.elevationValue = document.getElementById('elevation-value');
        
        // Buttons
        this.adjustButton = document.getElementById('adjust-recipe');
        this.printButton = document.getElementById('print-recipe');
        this.saveButton = document.getElementById('save-recipe');
        this.newRecipeButton = document.getElementById('new-recipe');
        
        // Display elements
        this.recipeDisplay = document.getElementById('recipe-display');
        this.displayTitle = document.getElementById('display-title');
        this.adjustedElevation = document.getElementById('adjusted-elevation');
        this.originalIngredients = document.getElementById('original-ingredients');
        this.adjustedIngredients = document.getElementById('adjusted-ingredients');
        this.originalInstructions = document.getElementById('original-instructions');
        this.adjustedInstructions = document.getElementById('adjusted-instructions');
        
        // Extracted recipe display
        this.extractedRecipeDisplay = document.getElementById('extracted-recipe-display');
        this.extractedIngredientsList = document.getElementById('extracted-ingredients-list');
        this.extractedInstructionsList = document.getElementById('extracted-instructions-list');
    }

    setupEventListeners() {
        // Elevation slider
        this.elevationSlider.addEventListener('input', (e) => {
            this.elevationValue.textContent = e.target.value;
        });

        // Adjust recipe button
        this.adjustButton.addEventListener('click', () => {
            this.processRecipe();
        });

        // Action buttons
        this.printButton.addEventListener('click', () => {
            this.printRecipe();
        });

        this.saveButton.addEventListener('click', () => {
            this.saveRecipe();
        });

        this.newRecipeButton.addEventListener('click', () => {
            this.resetForm();
        });

        // URL input for recipe extraction help
        this.recipeUrlInput.addEventListener('input', (e) => {
            this.handleUrlInput(e.target.value);
        });

        // Extract recipe button
        this.extractRecipeButton = document.getElementById('extract-recipe');
        if (this.extractRecipeButton) {
            this.extractRecipeButton.addEventListener('click', () => {
                this.extractRecipeFromUrl();
            });
        }
    }

    handleUrlInput(url) {
        if (url) {

        }
    }

    async extractRecipeFromUrl() {
        const url = this.recipeUrlInput.value.trim();
        if (!url) {
            this.showError('Please enter a recipe URL first.');
            return;
        }

        try {
            this.extractRecipeButton.textContent = 'Extracting...';
            this.extractRecipeButton.disabled = true;

            // Determine the API URL based on current location
            const apiUrl = this.getApiUrl();
            
            // Call the server API to extract the recipe
            const response = await fetch(`${apiUrl}/api/extract-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success && data.recipe) {
                // Populate the form with extracted data
                this.populateFormWithRecipe(data.recipe);
                this.showSuccess('Recipe extracted successfully!');
            } else {
                this.showError(data.error || 'Failed to extract recipe. Please try a different URL or enter manually.');
            }

        } catch (error) {
            console.error('Error extracting recipe:', error);
            this.showError('Error extracting recipe. Please check the URL and try again.');
        } finally {
            this.extractRecipeButton.textContent = 'Extract Recipe from URL';
            this.extractRecipeButton.disabled = false;
        }
    }

    populateFormWithRecipe(recipe) {
        // Populate title
        if (recipe.title) {
            this.recipeTitleInput.value = recipe.title;
        }

        // Populate instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
            this.instructionsInput.value = recipe.instructions.join('\n');
        }

        // Store ingredients for later use
        this.extractedIngredients = recipe.ingredients;

        // Display extracted ingredients and instructions
        this.displayExtractedRecipe(recipe);
    }

    displayExtractedRecipe(recipe) {
        // Show the extracted recipe section
        this.extractedRecipeDisplay.style.display = 'block';

        // Display ingredients
        this.extractedIngredientsList.innerHTML = '';
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                this.extractedIngredientsList.appendChild(li);
            });
        } else {
            this.extractedIngredientsList.innerHTML = '<p>No ingredients found</p>';
        }

        // Display instructions
        this.extractedInstructionsList.innerHTML = '';
        if (recipe.instructions && recipe.instructions.length > 0) {
            recipe.instructions.forEach((instruction, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${instruction}`;
                this.extractedInstructionsList.appendChild(li);
            });
        } else {
            this.extractedInstructionsList.innerHTML = '<p>No instructions found</p>';
        }

        // Scroll to the extracted recipe section
        this.extractedRecipeDisplay.scrollIntoView({ behavior: 'smooth' });
    }

    processRecipe() {
        try {
            // Validate inputs
            if (!this.validateInputs()) {
                return;
            }

            // Get elevation
            const elevation = parseInt(this.elevationSlider.value);
            this.currentAdjuster = new RecipeAdjuster(elevation);

            // Parse recipe
            const recipe = this.parseRecipe();
            this.currentRecipe = recipe;

            // Adjust recipe
            const adjustedRecipe = this.adjustRecipe(recipe);

            // Display results
            this.displayRecipe(recipe, adjustedRecipe, elevation);

        } catch (error) {
            console.error('Error processing recipe:', error);
            this.showError('Error processing recipe. Please check your inputs and try again.');
        }
    }

    validateInputs() {
        const title = this.recipeTitleInput.value.trim();
        const instructions = this.instructionsInput.value.trim();

        if (!title) {
            this.showError('Please enter a recipe title.');
            this.recipeTitleInput.focus();
            return false;
        }

        if (!this.extractedIngredients || this.extractedIngredients.length === 0) {
            this.showError('Please extract a recipe from a URL first.');
            this.recipeUrlInput.focus();
            return false;
        }

        if (!instructions) {
            this.showError('Please enter recipe instructions.');
            this.instructionsInput.focus();
            return false;
        }

        return true;
    }

    parseRecipe() {
        const title = this.recipeTitleInput.value.trim();
        
        // Use extracted ingredients if available, otherwise parse from input
        let ingredients;
        if (this.extractedIngredients && this.extractedIngredients.length > 0) {
            ingredients = this.extractedIngredients;
        } else {
            ingredients = this.parseIngredients(this.ingredientsInput.value);
        }
        
        const instructions = this.parseInstructions(this.instructionsInput.value);

        return {
            title,
            ingredients,
            instructions
        };
    }

    parseIngredients(ingredientsText) {
        return ingredientsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Remove bullet points, numbers, and extra whitespace
                return line.replace(/^[•\-\d\.\)\s]+/, '').trim();
            });
    }

    parseInstructions(instructionsText) {
        return instructionsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Remove step numbers and extra whitespace
                return line.replace(/^\d+[\.\)]\s*/, '').trim();
            });
    }

    adjustRecipe(recipe) {
        const adjustedRecipe = {
            title: recipe.title,
            ingredients: [],
            instructions: []
        };

        // Adjust ingredients
        adjustedRecipe.ingredients = recipe.ingredients.map(ingredient => {
            return this.currentAdjuster.adjustIngredient(ingredient);
        });

        // Adjust instructions (temperature and baking time)
        adjustedRecipe.instructions = recipe.instructions.map(instruction => {
            let adjustedInstruction = instruction;
            adjustedInstruction = this.currentAdjuster.adjustTemperature(adjustedInstruction);
            adjustedInstruction = this.currentAdjuster.adjustBakingTime(adjustedInstruction);
            return adjustedInstruction;
        });

        return adjustedRecipe;
    }

    displayRecipe(originalRecipe, adjustedRecipe, elevation) {
        // Update display title
        this.displayTitle.textContent = originalRecipe.title;
        this.adjustedElevation.textContent = elevation;

        // Display original ingredients
        this.originalIngredients.innerHTML = '';
        originalRecipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            this.originalIngredients.appendChild(li);
        });

        // Display adjusted ingredients
        this.adjustedIngredients.innerHTML = '';
        adjustedRecipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            this.adjustedIngredients.appendChild(li);
        });

        // Display original instructions
        this.originalInstructions.innerHTML = '';
        originalRecipe.instructions.forEach((instruction, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${instruction}`;
            this.originalInstructions.appendChild(li);
        });

        // Display adjusted instructions
        this.adjustedInstructions.innerHTML = '';
        adjustedRecipe.instructions.forEach((instruction, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${instruction}`;
            this.adjustedInstructions.appendChild(li);
        });

        // Show the display section
        this.recipeDisplay.style.display = 'block';
        
        // Scroll to the display section
        this.recipeDisplay.scrollIntoView({ behavior: 'smooth' });
    }

    printRecipe() {
        if (!this.currentRecipe || !this.currentAdjuster) {
            this.showError('No recipe to print. Please adjust a recipe first.');
            return;
        }

        const printWindow = window.open('', '_blank');
        const elevation = this.currentAdjuster.altitude;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.currentRecipe.title} - Adjusted for ${elevation} ft</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #4a90e2; padding-bottom: 10px; }
                    h2 { color: #4a90e2; margin-top: 30px; }
                    .recipe-section { margin: 20px 0; }
                    .ingredients-list { list-style: none; padding-left: 0; }
                    .ingredients-list li { margin: 5px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
                    .instructions-list { padding-left: 20px; }
                    .instructions-list li { margin: 10px 0; }
                    .elevation-note { background: #f8f9fa; padding: 15px; border-left: 4px solid #4a90e2; margin: 20px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>${this.currentRecipe.title}</h1>
                <div class="elevation-note">
                    <strong>Adjusted for ${elevation} feet elevation</strong><br>
                    Original recipe adjusted for high altitude baking conditions.
                </div>
                
                <div class="recipe-section">
                    <h2>Ingredients</h2>
                    <ul class="ingredients-list">
                        ${this.adjustedIngredients.innerHTML}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h2>Instructions</h2>
                    <ol class="instructions-list">
                        ${this.adjustedInstructions.innerHTML}
                    </ol>
                </div>
                
                <div class="elevation-note">
                    <strong>High Altitude Baking Tips:</strong><br>
                    • Increased flour strengthens the structure<br>
                    • Reduced leavening prevents overexpansion<br>
                    • Adjusted sugar maintains proper texture<br>
                    • Increased liquid compensates for faster evaporation<br>
                    • Higher temperature ensures proper cooking
                </div>
                
                <p><em>Generated by Elevate Your Recipe - High Altitude Baking Calculator</em></p>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    saveRecipe() {
        if (!this.currentRecipe || !this.currentAdjuster) {
            this.showError('No recipe to save. Please adjust a recipe first.');
            return;
        }

        const elevation = this.currentAdjuster.altitude;
        const recipeData = {
            title: this.currentRecipe.title,
            elevation: elevation,
            originalIngredients: this.currentRecipe.ingredients,
            adjustedIngredients: this.adjustedIngredients.innerHTML,
            originalInstructions: this.currentRecipe.instructions,
            adjustedInstructions: this.adjustedInstructions.innerHTML,
            date: new Date().toISOString()
        };

        const dataStr = JSON.stringify(recipeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${elevation}ft.json`;
        link.click();
    }

    resetForm() {
        this.recipeTitleInput.value = '';
        this.recipeUrlInput.value = '';
        this.instructionsInput.value = '';
        this.elevationSlider.value = 0;
        this.elevationValue.textContent = '0';
        this.recipeDisplay.style.display = 'none';
        this.extractedRecipeDisplay.style.display = 'none';
        
        // Reset URL help text
        const small = this.recipeUrlInput.nextElementSibling;
        small.textContent = 'Paste a recipe URL and we\'ll automatically extract the recipe for you';
        small.style.color = '#666';
        
        this.currentRecipe = null;
        this.currentAdjuster = null;
        this.extractedIngredients = null;
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background-color: #ffebee;
                color: #c62828;
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                border-left: 4px solid #c62828;
            `;
            document.querySelector('.main .container').insertBefore(errorDiv, document.querySelector('.recipe-input-section'));
        }
        
        errorDiv.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create or update success message
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.style.cssText = `
                background-color: #e8f5e8;
                color: #2e7d32;
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                border-left: 4px solid #2e7d32;
            `;
            document.querySelector('.main .container').insertBefore(successDiv, document.querySelector('.recipe-input-section'));
        }
        
        successDiv.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    getApiUrl() {
        // If we're running locally, use relative URL
        if (window.location.hostname === 'localhost') {
            return '';
        }
        
        // For production (Vercel), use relative URL since frontend and backend are on same domain
        return '';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeApp();
}); 
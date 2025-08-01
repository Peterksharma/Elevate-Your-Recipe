/**
 * Recipe Extractor for Web Pages
 * Comprehensive regex patterns and extraction logic for recipe websites
 */

class RecipeExtractor {
    constructor() {
        this.recipePatterns = this.initializePatterns();
    }

    initializePatterns() {
        return {
            // Common recipe website selectors
            selectors: {
                title: [
                    'h1[class*="recipe-title"]',
                    'h1[class*="recipe"]',
                    '[class*="recipe-title"]',
                    '[class*="recipe-name"]',
                    'h1',
                    '.recipe-header h1',
                    '.recipe h1',
                    '[data-testid*="recipe-title"]',
                    '[data-testid*="recipe-name"]'
                ],
                ingredients: [
                    '[class*="recipe-ingredients"]',
                    '[class*="ingredients-section"]',
                    '[class*="wprm-recipe-ingredients"]',
                    '[id*="recipe-ingredients"]',
                    '[class*="recipe_ingredients"]',
                    '[class*="ingredients-list"]',
                    '[class*="ingredient"]',
                    '.recipe-ingredients',
                    '.ingredients',
                    '[data-testid*="ingredients"]',
                    'ul[class*="ingredient"]',
                    'ol[class*="ingredient"]'
                ],
                instructions: [
                    '[class*="recipe-instructions"]',
                    '[class*="wprm-recipe-instructions"]',
                    '[class*="recipe-directions"]',
                    '[id*="recipe-instructions"]',
                    '[class*="recipe_instructions"]',
                    '[class*="instructions"]',
                    '[class*="directions"]',
                    '.recipe-instructions',
                    '.instructions',
                    '.directions',
                    '[data-testid*="instructions"]',
                    '[data-testid*="directions"]',
                    'ol[class*="instruction"]',
                    'ol[class*="step"]'
                ]
            },

            // Measurement patterns for ingredient parsing
            measurements: /(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?(?:\s+\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|Tablespoons|Tablespoon|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|stick|sticks|clove|cloves|bunch|bunches|package|packages|can|cans|jar|jars|slice|slices|whole|halves|third|thirds|fourth|fourths)/gi,

            // Ingredient type patterns
            ingredients: {
                flour: /(AP|All(-|\s*)Purpose|Bread|Cake|Pastry|Whole(-|\s*)Wheat|Self(-|\s*)Rising|00|Semolina|Rye|Spelt|Almond|Coconut|Rice|Corn|Oat|Buckwheat)?\s*[Ff]lour/i,
                sugar: /(Granulated|White|Brown|Light\s*Brown|Dark\s*Brown|Powdered|Confectioners'|Cane|Raw|Turbinado|Demerara|Muscovado|Superfine|Coconut|Palm|Date|Maple|Baker|Caster|Castor)?\s*[Ss]ugar/i,
                leavener: /([Bb]aking\s*(?:powder|soda)|[Yy]east|Cream\s*of\s*Tartar)/i,
                liquid: /(?:warm|cold\s+)?(?:water|milk|scalded\s+milk|buttermilk|cream|heavy\s+cream|half\s+and\s+half|juice|broth|stock|wine|beer|vinegar|oil|olive\s+oil|vegetable\s+oil|canola\s+oil|butter|margarine|eggs?|egg\s+whites?|egg\s+yolks?)/i,
                salt: /(?:sea\s+)?[Ss]alt|kosher\s+salt|table\s+salt|pink\s+salt/i,
                spice: /(?:ground\s+)?(?:cinnamon|nutmeg|ginger|cloves|allspice|cardamom|cumin|paprika|chili|oregano|basil|thyme|rosemary|sage|bay\s+leaves?|pepper|black\s+pepper|white\s+pepper|red\s+pepper|crushed\s+red\s+pepper)/i,
                extract: /(?:vanilla|almond|lemon|orange|mint|peppermint|maple|coconut|banana|strawberry|raspberry|cherry|butter|rum|brandy)\s+extract/i,
                chocolate: /(?:dark|milk|white|bittersweet|semisweet|unsweetened)\s+(?:chocolate|chips?|chunks?|bars?|cocoa|powder)/i,
                fruit: /(?:fresh|frozen|dried|canned)\s+(?:apples?|bananas?|berries?|strawberries?|blueberries?|raspberries?|blackberries?|cherries?|peaches?|pears?|oranges?|lemons?|limes?|grapes?|pineapple|mango|kiwi|cranberries?|raisins?|dates?|prunes?|apricots?|figs?)/i,
                nut: /(?:raw|roasted|salted|unsalted)\s+(?:almonds?|walnuts?|pecans?|cashews?|peanuts?|pistachios?|hazelnuts?|macadamia|pine\s+nuts?|sunflower\s+seeds?|pumpkin\s+seeds?|chia\s+seeds?|flax\s+seeds?|sesame\s+seeds?)/i
            },

            // Common recipe markers
            markers: {
                bulletPoints: /[▢•\-*]/,
                numbers: /^\d+[\.\)]\s*/,
                fractions: /(\d+\/\d+)/,
                mixedNumbers: /(\d+\s+\d+\/\d+)/
            },

            // Common recipe website patterns
            websites: {
                allrecipes: {
                    title: 'h1[class*="recipe-title"]',
                    ingredients: '[class*="ingredients-item"]',
                    instructions: '[class*="instructions-item"]'
                },
                foodnetwork: {
                    title: 'h1[class*="recipe-title"]',
                    ingredients: '[class*="ingredients"] li',
                    instructions: '[class*="instructions"] li'
                },
                epicurious: {
                    title: 'h1[class*="recipe-title"]',
                    ingredients: '[class*="ingredients"] li',
                    instructions: '[class*="instructions"] li'
                },
                bonappetit: {
                    title: 'h1[class*="recipe-title"]',
                    ingredients: '[class*="ingredients"] li',
                    instructions: '[class*="instructions"] li'
                },
                kingarthur: {
                    title: 'h1[class*="recipe-title"]',
                    ingredients: '[class*="ingredients"] li',
                    instructions: '[class*="instructions"] li'
                },
                smittenkitchen: {
                    title: 'h1.entry-title',
                    ingredients: '.ingredients li',
                    instructions: '.instructions li'
                },
                sallysbakingaddiction: {
                    title: 'h1.entry-title',
                    ingredients: '.ingredients li',
                    instructions: '.instructions li'
                }
            }
        };
    }

    /**
     * Extract recipe from current page
     * @returns {Object} Extracted recipe data
     */
    extractRecipe() {
        const recipeData = {
            title: null,
            ingredients: [],
            instructions: [],
            url: window.location.href,
            extractedAt: new Date().toISOString()
        };

        try {
            // Extract title
            recipeData.title = this.extractTitle();
            
            // Extract ingredients
            recipeData.ingredients = this.extractIngredients();
            
            // Extract instructions
            recipeData.instructions = this.extractInstructions();

            console.log('Extracted recipe data:', recipeData);
            return recipeData;

        } catch (error) {
            console.error('Error extracting recipe:', error);
            return null;
        }
    }

    /**
     * Extract recipe title
     * @returns {string|null} Recipe title
     */
    extractTitle() {
        // Try website-specific selectors first
        const website = this.detectWebsite();
        if (website && this.recipePatterns.websites[website]) {
            const selector = this.recipePatterns.websites[website].title;
            const element = document.querySelector(selector);
            if (element) {
                return this.cleanText(element.textContent);
            }
        }

        // Try general selectors
        for (const selector of this.recipePatterns.selectors.title) {
            const element = document.querySelector(selector);
            if (element) {
                const text = this.cleanText(element.textContent);
                if (text && text.length > 3 && text.length < 200) {
                    return text;
                }
            }
        }

        // Fallback to first h1
        const h1 = document.querySelector('h1');
        if (h1) {
            return this.cleanText(h1.textContent);
        }

        return null;
    }

    /**
     * Extract recipe ingredients
     * @returns {Array} Array of ingredient strings
     */
    extractIngredients() {
        const ingredients = new Set();
        
        // Try website-specific selectors first
        const website = this.detectWebsite();
        if (website && this.recipePatterns.websites[website]) {
            const selector = this.recipePatterns.websites[website].ingredients;
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const ingredient = this.cleanIngredient(element.textContent);
                if (ingredient) ingredients.add(ingredient);
            });
        }

        // Try general selectors
        for (const selector of this.recipePatterns.selectors.ingredients) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Handle both list items and containers
                const items = element.querySelectorAll('li') || [element];
                items.forEach(item => {
                    const ingredient = this.cleanIngredient(item.textContent);
                    if (ingredient) ingredients.add(ingredient);
                });
            });
        }

        // Fallback: look for common ingredient patterns
        const allText = document.body.textContent;
        const ingredientMatches = allText.match(/(\d+(?:\/\d+)?\s*(?:cup|cups|tbsp|tsp|oz|g|lb|grams?|ounces?|pounds?)\s+[^.!?]+)/gi);
        if (ingredientMatches) {
            ingredientMatches.forEach(match => {
                const ingredient = this.cleanIngredient(match);
                if (ingredient) ingredients.add(ingredient);
            });
        }

        return Array.from(ingredients).filter(ingredient => ingredient.length > 5);
    }

    /**
     * Extract recipe instructions
     * @returns {Array} Array of instruction strings
     */
    extractInstructions() {
        const instructions = new Set();
        
        // Try website-specific selectors first
        const website = this.detectWebsite();
        if (website && this.recipePatterns.websites[website]) {
            const selector = this.recipePatterns.websites[website].instructions;
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const instruction = this.cleanInstruction(element.textContent);
                if (instruction) instructions.add(instruction);
            });
        }

        // Try general selectors
        for (const selector of this.recipePatterns.selectors.instructions) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Handle both list items and containers
                const items = element.querySelectorAll('li') || [element];
                items.forEach(item => {
                    const instruction = this.cleanInstruction(item.textContent);
                    if (instruction) instructions.add(instruction);
                });
            });
        }

        // Fallback: look for numbered instructions
        const numberedInstructions = document.querySelectorAll('ol li, p:contains("step"), p:contains("instruction")');
        numberedInstructions.forEach(element => {
            const instruction = this.cleanInstruction(element.textContent);
            if (instruction) instructions.add(instruction);
        });

        return Array.from(instructions).filter(instruction => instruction.length > 10);
    }

    /**
     * Clean ingredient text
     * @param {string} text - Raw ingredient text
     * @returns {string|null} Cleaned ingredient
     */
    cleanIngredient(text) {
        if (!text) return null;

        let cleaned = text.trim()
            .replace(/\s+/g, ' ') // normalize whitespace
            .replace(/^ingredients?\s*:?\s*/i, '') // remove "ingredients" header
            .replace(/^\d+[\.\)]\s*/, '') // remove step numbers
            .replace(/^[•\-\*]\s*/, '') // remove bullet points
            .replace(/\s*\([^)]*\)/g, '') // remove parenthetical notes
            .replace(/\s*note\s*\d+/gi, '') // remove "Note X" references
            .replace(/\s*optional\s*/gi, '') // remove "optional"
            .replace(/\s*to\s*taste\s*/gi, '') // remove "to taste"
            .replace(/\s*as\s*needed\s*/gi, '') // remove "as needed"
            .trim();

        // Check if it looks like an ingredient
        if (cleaned.length < 3) return null;
        if (cleaned.toLowerCase().includes('ingredients')) return null;
        if (cleaned.toLowerCase().includes('instructions')) return null;
        if (cleaned.toLowerCase().includes('directions')) return null;
        if (cleaned.toLowerCase().includes('prep time')) return null;
        if (cleaned.toLowerCase().includes('cook time')) return null;
        if (cleaned.toLowerCase().includes('total time')) return null;
        if (cleaned.toLowerCase().includes('servings')) return null;

        return cleaned;
    }

    /**
     * Clean instruction text
     * @param {string} text - Raw instruction text
     * @returns {string|null} Cleaned instruction
     */
    cleanInstruction(text) {
        if (!text) return null;

        let cleaned = text.trim()
            .replace(/\s+/g, ' ') // normalize whitespace
            .replace(/^instructions?\s*:?\s*/i, '') // remove "instructions" header
            .replace(/^directions?\s*:?\s*/i, '') // remove "directions" header
            .replace(/^\d+[\.\)]\s*/, '') // remove step numbers
            .replace(/^[•\-\*]\s*/, '') // remove bullet points
            .trim();

        // Check if it looks like an instruction
        if (cleaned.length < 10) return null;
        if (cleaned.toLowerCase().includes('ingredients')) return null;
        if (cleaned.toLowerCase().includes('prep time')) return null;
        if (cleaned.toLowerCase().includes('cook time')) return null;
        if (cleaned.toLowerCase().includes('total time')) return null;
        if (cleaned.toLowerCase().includes('servings')) return null;

        return cleaned;
    }

    /**
     * Clean general text
     * @param {string} text - Raw text
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        if (!text) return '';
        return text.trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();
    }

    /**
     * Detect the website based on URL
     * @returns {string|null} Website identifier
     */
    detectWebsite() {
        const url = window.location.hostname.toLowerCase();
        
        if (url.includes('allrecipes.com')) return 'allrecipes';
        if (url.includes('foodnetwork.com')) return 'foodnetwork';
        if (url.includes('epicurious.com')) return 'epicurious';
        if (url.includes('bonappetit.com')) return 'bonappetit';
        if (url.includes('kingarthurbaking.com') || url.includes('kingarthurflour.com')) return 'kingarthur';
        if (url.includes('smittenkitchen.com')) return 'smittenkitchen';
        if (url.includes('sallysbakingaddiction.com')) return 'sallysbakingaddiction';
        
        return null;
    }

    /**
     * Get extraction status and recommendations
     * @param {Object} recipeData - Extracted recipe data
     * @returns {Object} Status and recommendations
     */
    getExtractionStatus(recipeData) {
        const status = {
            success: false,
            title: false,
            ingredients: false,
            instructions: false,
            recommendations: []
        };

        if (recipeData.title) {
            status.title = true;
        } else {
            status.recommendations.push('Could not find recipe title. Please enter manually.');
        }

        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
            status.ingredients = true;
        } else {
            status.recommendations.push('Could not find ingredients. Please enter manually.');
        }

        if (recipeData.instructions && recipeData.instructions.length > 0) {
            status.instructions = true;
        } else {
            status.recommendations.push('Could not find instructions. Please enter manually.');
        }

        status.success = status.title && status.ingredients && status.instructions;

        if (status.success) {
            status.recommendations.push('Recipe extracted successfully! Please review and adjust as needed.');
        }

        return status;
    }
}

// Make RecipeExtractor globally available
window.RecipeExtractor = RecipeExtractor; 
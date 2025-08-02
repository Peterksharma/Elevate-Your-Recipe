const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Recipe extraction patterns (same as client-side)
const recipePatterns = {
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
        },
        // Add more specific selectors for common recipe sites
        general: {
            title: 'h1, [class*="recipe-title"], [class*="recipe-name"]',
            ingredients: 'li:contains("▢"), li:contains("•"), [class*="ingredient"] li, [class*="ingredients"] li',
            instructions: '[class*="instruction"] li, [class*="directions"] li, ol li'
        }
    }
};

// Helper functions
function cleanText(text) {
    if (!text) return '';
    return text.trim()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();
}

function cleanIngredient(text) {
    if (!text) return null;

    let cleaned = text.trim()
        .replace(/\s+/g, ' ')
        .replace(/^ingredients?\s*:?\s*/i, '')
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[•\-\*▢]\s*/, '') // Remove bullet points including ▢
        .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
        .replace(/\s*note\s*\d+/gi, '')
        .replace(/\s*optional\s*/gi, '')
        .replace(/\s*to\s*taste\s*/gi, '')
        .replace(/\s*as\s*needed\s*/gi, '')
        .replace(/\s*US\s*Customary\s*Metric\s*\d+x\d+x\d+x\s*/gi, '') // Remove US CustomaryMetric 1x2x3x
        .replace(/\s*packed\s*$/i, '') // Remove trailing "packed"
        .replace(/\s*softened\s*$/i, '') // Remove trailing "softened"
        .replace(/½/g, '1/2') // Convert Unicode fraction to standard fraction
        .replace(/⅓/g, '1/3') // Convert other common Unicode fractions
        .replace(/⅔/g, '2/3')
        .replace(/¼/g, '1/4')
        .replace(/¾/g, '3/4')
        .replace(/⅕/g, '1/5')
        .replace(/⅖/g, '2/5')
        .replace(/⅗/g, '3/5')
        .replace(/⅘/g, '4/5')
        .replace(/⅙/g, '1/6')
        .replace(/⅚/g, '5/6')
        .replace(/⅐/g, '1/7')
        .replace(/⅛/g, '1/8')
        .replace(/⅜/g, '3/8')
        .replace(/⅝/g, '5/8')
        .replace(/⅞/g, '7/8')
        .replace(/⅑/g, '1/9')
        .replace(/⅒/g, '1/10')
        .trim();

    // Additional filtering
    if (cleaned.length < 3) return null;
    if (cleaned.toLowerCase().includes('ingredients')) return null;
    if (cleaned.toLowerCase().includes('instructions')) return null;
    if (cleaned.toLowerCase().includes('directions')) return null;
    if (cleaned.toLowerCase().includes('prep time')) return null;
    if (cleaned.toLowerCase().includes('cook time')) return null;
    if (cleaned.toLowerCase().includes('total time')) return null;
    if (cleaned.toLowerCase().includes('servings')) return null;
    if (cleaned.toLowerCase().includes('nutrition')) return null;
    if (cleaned.toLowerCase().includes('calories')) return null;
    if (cleaned.toLowerCase().includes('protein')) return null;
    if (cleaned.toLowerCase().includes('fat')) return null;
    if (cleaned.toLowerCase().includes('cholesterol')) return null;
    if (cleaned.toLowerCase().includes('sodium')) return null;
    if (cleaned.toLowerCase().includes('fiber')) return null;
    if (cleaned.toLowerCase().includes('vitamin')) return null;
    if (cleaned.toLowerCase().includes('calcium')) return null;
    if (cleaned.toLowerCase().includes('iron')) return null;
    if (cleaned.toLowerCase().includes('equals')) return null;
    if (cleaned.toLowerCase().includes('weight')) return null;
    if (cleaned.toLowerCase().includes('grams')) return null;
    if (cleaned.toLowerCase().includes('accepted')) return null;
    if (cleaned.toLowerCase().includes('really being')) return null;
    if (cleaned.toLowerCase().includes('hot water')) return null;
    if (cleaned.toLowerCase().includes('vinegar')) return null;
    if (cleaned.toLowerCase().includes('adjusting to your taste')) return null;
    if (cleaned.toLowerCase().includes('roll')) return null;
    if (cleaned.toLowerCase().includes('bake')) return null;
    if (cleaned.toLowerCase().includes('preheat')) return null;
    if (cleaned.toLowerCase().includes('says')) return null;
    if (cleaned.toLowerCase().includes('honestly')) return null;
    if (cleaned.toLowerCase().includes('reply')) return null;
    if (cleaned.toLowerCase().includes('back to top')) return null;
    if (cleaned.toLowerCase().includes('all rights reserved')) return null;
    if (cleaned.toLowerCase().includes('privacy policy')) return null;
    if (cleaned.toLowerCase().includes('powered by')) return null;
    if (cleaned.toLowerCase().includes('us customary')) return null;
    if (cleaned.toLowerCase().includes('metric')) return null;
    if (cleaned.toLowerCase().includes('1x')) return null;
    if (cleaned.toLowerCase().includes('2x')) return null;
    if (cleaned.toLowerCase().includes('3x')) return null;
    if (cleaned.toLowerCase().includes('hello')) return null;
    if (cleaned.toLowerCase().includes('error')) return null;
    if (cleaned.toLowerCase().includes('should it be')) return null;
    if (cleaned.toLowerCase().includes('img')) return null;
    if (cleaned.toLowerCase().includes('width')) return null;
    if (cleaned.toLowerCase().includes('height')) return null;
    if (cleaned.toLowerCase().includes('data-pin-nopin')) return null;
    if (cleaned.toLowerCase().includes('src=')) return null;
    if (cleaned.toLowerCase().includes('alt=')) return null;
    if (cleaned.toLowerCase().includes('class=')) return null;
    if (cleaned.toLowerCase().includes('wp-image')) return null;
    if (cleaned.toLowerCase().includes('joyfoodsunshine')) return null;
    if (cleaned.toLowerCase().includes('family-photo')) return null;
    if (cleaned.toLowerCase().includes('scaled')) return null;
    if (cleaned.toLowerCase().includes('uploads')) return null;
    if (cleaned.toLowerCase().includes('wp-content')) return null;
    if (cleaned.toLowerCase().includes('2024')) return null;
    if (cleaned.toLowerCase().includes('2025')) return null;

    // Must contain a measurement
    if (!/\d/.test(cleaned)) return null;

    return cleaned;
}

function cleanInstruction(text) {
    if (!text) return null;

    let cleaned = text.trim()
        .replace(/\s+/g, ' ')
        .replace(/^instructions?\s*:?\s*/i, '')
        .replace(/^directions?\s*:?\s*/i, '')
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[•\-\*]\s*/, '')
        .trim();

    if (cleaned.length < 10) return null;
    if (cleaned.toLowerCase().includes('ingredients')) return null;
    if (cleaned.toLowerCase().includes('prep time')) return null;
    if (cleaned.toLowerCase().includes('cook time')) return null;
    if (cleaned.toLowerCase().includes('total time')) return null;
    if (cleaned.toLowerCase().includes('servings')) return null;

    return cleaned;
}

function detectWebsite(url) {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('allrecipes.com')) return 'allrecipes';
    if (hostname.includes('foodnetwork.com')) return 'foodnetwork';
    if (hostname.includes('epicurious.com')) return 'epicurious';
    if (hostname.includes('bonappetit.com')) return 'bonappetit';
    if (hostname.includes('kingarthurbaking.com') || hostname.includes('kingarthurflour.com')) return 'kingarthur';
    if (hostname.includes('smittenkitchen.com')) return 'smittenkitchen';
    if (hostname.includes('sallysbakingaddiction.com')) return 'sallysbakingaddiction';
    
    return null;
}

function extractTitle($, website) {
    // Try website-specific selectors first
    if (website && recipePatterns.websites[website]) {
        const selector = recipePatterns.websites[website].title;
        const element = $(selector);
        if (element.length > 0) {
            return cleanText(element.text());
        }
    }

    // Try general selectors
    for (const selector of recipePatterns.selectors.title) {
        const element = $(selector);
        if (element.length > 0) {
            const text = cleanText(element.text());
            if (text && text.length > 3 && text.length < 200) {
                return text;
            }
        }
    }

    // Fallback to first h1
    const h1 = $('h1');
    if (h1.length > 0) {
        return cleanText(h1.first().text());
    }

    return null;
}

function extractIngredients($, website) {
    const ingredients = new Set();
    

    
    // Try multiple approaches to find ingredients
    let foundIngredients = false;
    
    // Approach 1: Try to find the ingredients section by looking for headers
    const ingredientSection = findIngredientsSection($);
    if (ingredientSection) {
        extractIngredientsFromSection($, ingredientSection, ingredients);
        if (ingredients.size > 0) {
            foundIngredients = true;

        } else {
        }
    } else {
    }
    
    // Approach 2: If no ingredients found, try direct ▢ character search
    if (!foundIngredients) {
        const beforeCount = ingredients.size;
        extractIngredientsByCharacter($, ingredients);
        const afterCount = ingredients.size;
        if (afterCount > beforeCount) {
            foundIngredients = true;

        } else {
        }
    }
    
    // Approach 3: Fallback to general selectors
    if (!foundIngredients) {
        const beforeCount = ingredients.size;
        extractIngredientsFallback($, website, ingredients);
        const afterCount = ingredients.size;
        
    }


    // Filter and sort ingredients
    const filteredIngredients = Array.from(ingredients)
        .filter(ingredient => {
            // Must have a measurement
            const hasMeasurement = /\d/.test(ingredient);
            // Must not be nutrition info
            const notNutrition = !ingredient.toLowerCase().includes('nutrition') && 
                                !ingredient.toLowerCase().includes('calories') &&
                                !ingredient.toLowerCase().includes('protein') &&
                                !ingredient.toLowerCase().includes('fat') &&
                                !ingredient.toLowerCase().includes('cholesterol') &&
                                !ingredient.toLowerCase().includes('sodium') &&
                                !ingredient.toLowerCase().includes('fiber') &&
                                !ingredient.toLowerCase().includes('vitamin') &&
                                !ingredient.toLowerCase().includes('calcium') &&
                                !ingredient.toLowerCase().includes('iron') &&
                                // Only filter out nutrition-related sugar mentions, not ingredient sugar
                                !(ingredient.toLowerCase().includes('sugar') && 
                                  (ingredient.toLowerCase().includes('calories') || 
                                   ingredient.toLowerCase().includes('nutrition') || 
                                   ingredient.toLowerCase().includes('protein') || 
                                   ingredient.toLowerCase().includes('fat') || 
                                   ingredient.toLowerCase().includes('cholesterol') || 
                                   ingredient.toLowerCase().includes('sodium') || 
                                   ingredient.toLowerCase().includes('fiber') || 
                                   ingredient.toLowerCase().includes('vitamin') || 
                                   ingredient.toLowerCase().includes('calcium') || 
                                   ingredient.toLowerCase().includes('iron')));
            // Must not be conversion notes or comments
            const notConversion = !ingredient.toLowerCase().includes('equals') &&
                                 !ingredient.toLowerCase().includes('weight') &&
                                 !ingredient.toLowerCase().includes('grams') &&
                                 !ingredient.toLowerCase().includes('accepted') &&
                                 !ingredient.toLowerCase().includes('really being') &&
                                 !ingredient.toLowerCase().includes('hot water') &&
                                 !ingredient.toLowerCase().includes('vinegar') &&
                                 !ingredient.toLowerCase().includes('adjusting to your taste') &&
                                 !ingredient.toLowerCase().includes('roll') &&
                                 !ingredient.toLowerCase().includes('bake') &&
                                 !ingredient.toLowerCase().includes('preheat') &&
                                 !ingredient.toLowerCase().includes('says') &&
                                 !ingredient.toLowerCase().includes('honestly') &&
                                 !ingredient.toLowerCase().includes('reply') &&
                                 !ingredient.toLowerCase().includes('back to top') &&
                                 !ingredient.toLowerCase().includes('all rights reserved') &&
                                 !ingredient.toLowerCase().includes('privacy policy') &&
                                 !ingredient.toLowerCase().includes('powered by') &&
                                 !ingredient.toLowerCase().includes('us customary') &&
                                 !ingredient.toLowerCase().includes('metric') &&
                                 !ingredient.toLowerCase().includes('1x') &&
                                 !ingredient.toLowerCase().includes('2x') &&
                                 !ingredient.toLowerCase().includes('3x') &&
                                 !ingredient.toLowerCase().includes('baking sheet') &&
                                 !ingredient.toLowerCase().includes('equipment') &&
                                 !ingredient.toLowerCase().includes('measuring') &&
                                 !ingredient.toLowerCase().includes('kitchenaid') &&
                                 !ingredient.toLowerCase().includes('spatula') &&
                                 !ingredient.toLowerCase().includes('parchment') &&
                                 !ingredient.toLowerCase().includes('cookie scoop') &&
                                 !ingredient.toLowerCase().includes('silicone') &&
                                 !ingredient.toLowerCase().includes('hand mixer') &&
                                 !ingredient.toLowerCase().includes('cool the') &&
                                 !ingredient.toLowerCase().includes('store these') &&
                                 !ingredient.toLowerCase().includes('decrease baking') &&
                                 !ingredient.toLowerCase().includes('great recipe') &&
                                 !ingredient.toLowerCase().includes('recommend') &&
                                 !ingredient.toLowerCase().includes('preference') &&
                                 !ingredient.toLowerCase().includes('critique') &&
                                 !ingredient.toLowerCase().includes('lol') &&
                                 !ingredient.toLowerCase().includes('sugar:') &&
                                 !ingredient.toLowerCase().includes('calories:') &&
                                 !ingredient.toLowerCase().includes('protein:') &&
                                 !ingredient.toLowerCase().includes('fat:') &&
                                 !ingredient.toLowerCase().includes('cholesterol:') &&
                                 !ingredient.toLowerCase().includes('sodium:') &&
                                 !ingredient.toLowerCase().includes('fiber:') &&
                                 !ingredient.toLowerCase().includes('vitamin') &&
                                 !ingredient.toLowerCase().includes('calcium:') &&
                                 !ingredient.toLowerCase().includes('iron:') &&
                                 !ingredient.toLowerCase().includes('as you can see') &&
                                 !ingredient.toLowerCase().includes('let them sit') &&
                                 !ingredient.toLowerCase().includes('before removing') &&
                                 !ingredient.toLowerCase().includes('cooling rack') &&
                                 !ingredient.toLowerCase().includes('doesn\'t matter what you use') &&
                                 !ingredient.toLowerCase().includes('choose your favorite') &&
                                 !ingredient.toLowerCase().includes('really amps up') &&
                                 !ingredient.toLowerCase().includes('michelle writes') &&
                                 !ingredient.toLowerCase().includes('biggest secrets') &&
                                 !ingredient.toLowerCase().includes('recommends') &&
                                 !ingredient.toLowerCase().includes('either brand') &&
                                 !ingredient.toLowerCase().includes('rate this recipe') &&
                                 !ingredient.toLowerCase().includes('serves') &&
                                 !ingredient.toLowerCase().includes('baking dish') &&
                                 !ingredient.toLowerCase().includes('equipment') &&
                                 !ingredient.toLowerCase().includes('cooking spray') &&
                                 !ingredient.toLowerCase().includes('parchment paper') &&
                                 !ingredient.toLowerCase().includes('rubber spatula') &&
                                 !ingredient.toLowerCase().includes('you may like') &&
                                 !ingredient.toLowerCase().includes('vegan carrot cake') &&
                                 !ingredient.toLowerCase().includes('lemon cake') &&
                                 !ingredient.toLowerCase().includes('sugar cookies') &&
                                 !ingredient.toLowerCase().includes('banana bread') &&
                                 !ingredient.toLowerCase().includes('muffin recipes') &&
                                 !ingredient.toLowerCase().includes('carrot muffins') &&
                                 !ingredient.toLowerCase().includes('i made these') &&
                                 !ingredient.toLowerCase().includes('yesterday') &&
                                 !ingredient.toLowerCase().includes('crazy, i know') &&
                                 !ingredient.toLowerCase().includes('definite winner') &&
                                 !ingredient.toLowerCase().includes('too salty') &&
                                 !ingredient.toLowerCase().includes('dunno if i did it wrong') &&
                                 !ingredient.toLowerCase().includes('maybe because i cut') &&
                                 !ingredient.toLowerCase().includes('maybe i should have cut') &&
                                 !ingredient.toLowerCase().includes('made these for visiting') &&
                                 !ingredient.toLowerCase().includes('added 1 cup of chopped') &&
                                 !ingredient.toLowerCase().includes('cause i can\'t do') &&
                                 !ingredient.toLowerCase().includes('hands down the best') &&
                                 !ingredient.toLowerCase().includes('do have onequestion') &&
                                 !ingredient.toLowerCase().includes('cool in the pan') &&
                                 !ingredient.toLowerCase().includes('remove from pan') &&
                                 !ingredient.toLowerCase().includes('michelle uses') &&
                                 !ingredient.toLowerCase().includes('bit of water') &&
                                 !ingredient.toLowerCase().includes('moist, gooey texture') &&
                                 !ingredient.toLowerCase().includes('boxed mix') &&
                                 !ingredient.toLowerCase().includes('commercial emulsifiers') &&
                                 !ingredient.toLowerCase().includes('doesn\'t contain any') &&
                                 !ingredient.toLowerCase().includes('essential for helping') &&
                                 !ingredient.toLowerCase().includes('puff up in the oven') &&
                                 !ingredient.toLowerCase().includes('pour the batter') &&
                                 !ingredient.toLowerCase().includes('lined with parchment') &&
                                 !ingredient.toLowerCase().includes('spread it to all four') &&
                                 !ingredient.toLowerCase().includes('smooth the top') &&
                                 !ingredient.toLowerCase().includes('mixture will be very thick') &&
                                 !ingredient.toLowerCase().includes('that\'s ok') &&
                                 !ingredient.toLowerCase().includes('better chocolate chips') &&
                                 !ingredient.toLowerCase().includes('good-quality chocolate chips') &&
                                 !ingredient.toLowerCase().includes('ghirardelli') &&
                                 !ingredient.toLowerCase().includes('enjoy life') &&
                                 !ingredient.toLowerCase().includes('fantastic in this recipe') &&
                                 !ingredient.toLowerCase().includes('if you\'d like to reduce') &&
                                 !ingredient.toLowerCase().includes('i\'ve had success with') &&
                                 !ingredient.toLowerCase().includes('instead of') &&
                                 !ingredient.toLowerCase().includes('as mentioned in the notes') &&
                                 !ingredient.toLowerCase().includes('brownies') &&
                                 !ingredient.toLowerCase().includes('cookies') &&
                                 !ingredient.toLowerCase().includes('muffins') &&
                                 !ingredient.toLowerCase().includes('cakes') &&
                                 !ingredient.toLowerCase().includes('bread') &&
                                 !ingredient.toLowerCase().includes('serves') &&
                                 !ingredient.toLowerCase().includes('yield') &&
                                 !ingredient.toLowerCase().includes('makes') &&
                                 !ingredient.toLowerCase().includes('prep time') &&
                                 !ingredient.toLowerCase().includes('cook time') &&
                                 !ingredient.toLowerCase().includes('total time') &&
                                 !ingredient.toLowerCase().includes('course') &&
                                 !ingredient.toLowerCase().includes('cuisine') &&
                                 !ingredient.toLowerCase().includes('calories') &&
                                 !ingredient.toLowerCase().includes('servings') &&
                                 !ingredient.toLowerCase().includes('minutes') &&
                                 !ingredient.toLowerCase().includes('hours') &&
                                 !ingredient.toLowerCase().includes('degrees') &&
                                 !ingredient.toLowerCase().includes('fahrenheit') &&
                                 !ingredient.toLowerCase().includes('celsius') &&
                                 !ingredient.toLowerCase().includes('preheat') &&
                                 !ingredient.toLowerCase().includes('bake') &&
                                 !ingredient.toLowerCase().includes('cool') &&
                                 !ingredient.toLowerCase().includes('store') &&
                                 !ingredient.toLowerCase().includes('freeze') &&
                                 !ingredient.toLowerCase().includes('thaw') &&
                                 !ingredient.toLowerCase().includes('notes') &&
                                 !ingredient.toLowerCase().includes('tips') &&
                                 !ingredient.toLowerCase().includes('substitutions') &&
                                 !ingredient.toLowerCase().includes('variations') &&
                                 !ingredient.toLowerCase().includes('ingredient substitutions') &&
                                 !ingredient.toLowerCase().includes('how to') &&
                                 !ingredient.toLowerCase().includes('why') &&
                                 !ingredient.toLowerCase().includes('because') &&
                                 !ingredient.toLowerCase().includes('since') &&
                                 !ingredient.toLowerCase().includes('when') &&
                                 !ingredient.toLowerCase().includes('while') &&
                                 !ingredient.toLowerCase().includes('until') &&
                                 !ingredient.toLowerCase().includes('before') &&
                                 !ingredient.toLowerCase().includes('after') &&
                                 !ingredient.toLowerCase().includes('during') &&
                                 !ingredient.toLowerCase().includes('allow') &&
                                 !ingredient.toLowerCase().includes('let') &&
                                 !ingredient.toLowerCase().includes('make sure') &&
                                 !ingredient.toLowerCase().includes('be sure') &&
                                 !ingredient.toLowerCase().includes('don\'t forget') &&
                                 !ingredient.toLowerCase().includes('remember') &&
                                 !ingredient.toLowerCase().includes('important') &&
                                 !ingredient.toLowerCase().includes('key') &&
                                 !ingredient.toLowerCase().includes('secret') &&
                                 !ingredient.toLowerCase().includes('trick') &&
                                 !ingredient.toLowerCase().includes('hint') &&
                                 !ingredient.toLowerCase().includes('pro tip') &&
                                 !ingredient.toLowerCase().includes('expert tip');
            // Must be reasonable length
            const reasonableLength = ingredient.length > 5 && ingredient.length < 200;
            
            const isValid = hasMeasurement && notNutrition && notConversion && reasonableLength;
            

            
            return isValid;
        })
        .sort((a, b) => {
            // Sort by measurement amount (extract first number)
            const aNum = parseFloat(a.match(/\d+(?:\/\d+)?/)?.[0] || '0');
            const bNum = parseFloat(b.match(/\d+(?:\/\d+)?/)?.[0] || '0');
            return aNum - bNum;
        });

    console.log(`\nFinal filtered ingredients: ${filteredIngredients.length}`);
    console.log('Final ingredients:', filteredIngredients);

    
    return filteredIngredients;
}

function findIngredientsSection($) {
    // Look for common ingredient section headers
    const headerSelectors = [
        'h2:contains("Ingredients")',
        'h3:contains("Ingredients")',
        'h4:contains("Ingredients")',
        '[class*="ingredients-header"]',
        '[class*="recipe-ingredients-header"]',
        'h2:contains("INGREDIENTS")',
        'h3:contains("INGREDIENTS")',
        'h4:contains("INGREDIENTS")'
    ];

    for (const selector of headerSelectors) {
        const header = $(selector);
        if (header.length > 0) {
            // Find the ingredients section that ends before instructions
            return findIngredientsSectionFromHeader($, header);
        }
    }

    // Look for elements with ingredient-related classes
    const sectionSelectors = [
        '[class*="recipe-ingredients"]',
        '[class*="ingredients-section"]',
        '[class*="wprm-recipe-ingredients"]',
        '[id*="recipe-ingredients"]',
        '[class*="recipe_ingredients"]',
        '[class*="ingredients-list"]'
    ];

    for (const selector of sectionSelectors) {
        const section = $(selector);
        if (section.length > 0) {
            return section;
        }
    }

    return null;
}

function findIngredientsSectionFromHeader($, header) {
    // Start from the header and collect elements until we hit instructions
    const ingredientsElements = [];
    let currentElement = header.next();
    
    while (currentElement.length > 0) {
        const text = currentElement.text().trim();
        
        // Stop if we hit instructions header
        if (text.toLowerCase().includes('instructions') || 
            text.toLowerCase().includes('directions') ||
            text.toLowerCase().includes('method') ||
            text.toLowerCase().includes('steps')) {
            break;
        }
        
        // Stop if we hit another major section header
        if (currentElement.is('h1, h2, h3, h4, h5, h6')) {
            const headerText = text.toLowerCase();
            if (headerText.includes('prep') || 
                headerText.includes('cook') || 
                headerText.includes('total') ||
                headerText.includes('servings') ||
                headerText.includes('nutrition')) {
                break;
            }
        }
        
        // Add the element if it contains ingredient-like content
        if (text && (text.includes('▢') || /\d/.test(text))) {
            ingredientsElements.push(currentElement);
        }
        
        currentElement = currentElement.next();
    }
    
    // Create a wrapper element containing all ingredients
    if (ingredientsElements.length > 0) {
        const wrapper = $('<div class="ingredients-wrapper"></div>');
        ingredientsElements.forEach(element => {
            wrapper.append(element.clone());
        });
        return wrapper;
    }
    
    return null;
}

function extractIngredientsFromSection($, section, ingredients) {
    // Look for list items within the section
    const listItems = section.find('li');
    
    if (listItems.length > 0) {
        listItems.each((i, item) => {
            const text = $(item).text().trim();
            if (text && text.includes('▢')) {
                const ingredient = cleanIngredient(text);
                if (ingredient) ingredients.add(ingredient);
            }
        });
    } else {
        // Look for text content with bullet points
        const text = section.text();
        if (text && text.includes('▢')) {
            const parts = text.split('▢');
            parts.forEach(part => {
                const ingredient = cleanIngredient(part);
                if (ingredient) ingredients.add(ingredient);
            });
        }
    }
    
    // Also look for any elements with the ▢ character directly
    section.find('*').each((i, element) => {
        const text = $(element).text().trim();
        if (text && text.includes('▢')) {
            // Split by ▢ and process each part
            const parts = text.split('▢');
            parts.forEach(part => {
                const ingredient = cleanIngredient(part);
                if (ingredient) ingredients.add(ingredient);
            });
        }
    });
}

function extractIngredientsByCharacter($, ingredients) {
    let foundWithCharacter = 0;
    
    // Look for elements containing the ▢ character - be more specific
    $('li, p, div, span').each((i, element) => {
        const text = $(element).text().trim();
        if (text && text.includes('▢')) {
            // Split by ▢ and process each part
            const parts = text.split('▢');
            parts.forEach(part => {
                const ingredient = cleanIngredient(part);
                if (ingredient) {
                    ingredients.add(ingredient);
                    foundWithCharacter++;
                }
            });
        }
    });
    
    // Also look for any text that contains measurements and ingredient words, even without ▢
    $('li, p, div, span').each((i, element) => {
        const text = $(element).text().trim();
        if (text && /\d/.test(text)) {
            const hasIngredientWord = ['butter', 'sugar', 'flour', 'eggs', 'vanilla', 'baking', 'salt', 'chocolate', 'chips', 'brown', 'granulated', 'all-purpose', 'powder'].some(word => text.toLowerCase().includes(word));
            const hasMeasurement = /\d/.test(text);
            if (hasIngredientWord && hasMeasurement && text.length < 100) {
                const ingredient = cleanIngredient(text);
                if (ingredient) {
                    ingredients.add(ingredient);
                    foundWithCharacter++;
                }
            }
        }
    });
    
    let foundWithBullets = 0;
    // Also look for bullet points and numbered lists that contain measurements
    $('li, p, div').each((i, element) => {
        const text = $(element).text().trim();
        if (text && (text.includes('▢') || text.includes('•') || text.includes('-'))) {
            const ingredient = cleanIngredient(text);
            if (ingredient) {
                ingredients.add(ingredient);
                foundWithBullets++;
            }
        }
    });
    let foundWithMeasurements = 0;
    // Look for specific ingredient patterns with measurements
    const measurementPattern = /(\d+(?:\/\d+)?)\s*(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|g|gram|grams|lb|lbs|pound|pounds)\s+/i;
    
    $('li, p, div').each((i, element) => {
        const text = $(element).text().trim();
        if (text && measurementPattern.test(text)) {
            const ingredient = cleanIngredient(text);
            if (ingredient) {
                ingredients.add(ingredient);
                foundWithMeasurements++;
            }
        }
    });

    let foundWithWords = 0;
    // Look for any text that contains both a measurement and common ingredient words
    const ingredientWords = ['butter', 'sugar', 'flour', 'eggs', 'vanilla', 'baking', 'salt', 'chocolate', 'chips', 'brown', 'granulated', 'all-purpose', 'powder'];
    $('li, p, div, span').each((i, element) => {
        const text = $(element).text().trim();
        if (text && /\d/.test(text)) {
            const hasIngredientWord = ingredientWords.some(word => text.toLowerCase().includes(word));
            if (hasIngredientWord) {
                const ingredient = cleanIngredient(text);
                if (ingredient) {
                    ingredients.add(ingredient);
                    foundWithWords++;
                }
            }
        }
    });
}

function extractIngredientsFallback($, website, ingredients) {
    // Try website-specific selectors first
    if (website && recipePatterns.websites[website]) {
        const selector = recipePatterns.websites[website].ingredients;
        $(selector).each((i, element) => {
            const ingredient = cleanIngredient($(element).text());
            if (ingredient) ingredients.add(ingredient);
        });
    }

    // Try general selectors
    for (const selector of recipePatterns.selectors.ingredients) {
        $(selector).each((i, element) => {
            const items = $(element).find('li');
            if (items.length > 0) {
                items.each((j, item) => {
                    const ingredient = cleanIngredient($(item).text());
                    if (ingredient) ingredients.add(ingredient);
                });
            } else {
                const ingredient = cleanIngredient($(element).text());
                if (ingredient) ingredients.add(ingredient);
            }
        });
    }
}

function extractInstructions($, website) {
    const instructions = new Set();
    
    // Try website-specific selectors first
    if (website && recipePatterns.websites[website]) {
        const selector = recipePatterns.websites[website].instructions;
        $(selector).each((i, element) => {
            const instruction = cleanInstruction($(element).text());
            if (instruction) instructions.add(instruction);
        });
    }

    // Try general selectors
    for (const selector of recipePatterns.selectors.instructions) {
        $(selector).each((i, element) => {
            const items = $(element).find('li');
            if (items.length > 0) {
                items.each((j, item) => {
                    const instruction = cleanInstruction($(item).text());
                    if (instruction) instructions.add(instruction);
                });
            } else {
                const instruction = cleanInstruction($(element).text());
                if (instruction) instructions.add(instruction);
            }
        });
    }

    // Fallback: look for numbered instructions
    $('ol li, p').each((i, element) => {
        const text = $(element).text();
        if (text.includes('step') || text.includes('instruction')) {
            const instruction = cleanInstruction(text);
            if (instruction) instructions.add(instruction);
        }
    });

    return Array.from(instructions).filter(instruction => instruction.length > 10);
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/extract-recipe', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('Fetching recipe from:', url);

        // Fetch the webpage
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        // Parse HTML
        const $ = cheerio.load(response.data);
        
        // Detect website
        const website = detectWebsite(url);
        
        // Extract recipe data
        const recipeData = {
            title: extractTitle($, website),
            ingredients: extractIngredients($, website),
            instructions: extractInstructions($, website),
            url: url,
            extractedAt: new Date().toISOString(),
            website: website
        };

        res.json({ success: true, recipe: recipeData });

    } catch (error) {
        console.error('Error extracting recipe:', error);
        res.status(500).json({ 
            error: 'Failed to extract recipe',
            message: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Recipe extraction API available at /api/extract-recipe');
}); 
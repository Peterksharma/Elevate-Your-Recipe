//Function that holds an array of arrays with the details of how to convert that ingredient.
function adjustRecipeAmounts(recipe, altitude) {
    
    //For this conversion, it really should work by adding ~1%-2% of the flour weight back into it, to adjust for the water
    //The recipe should add a min of ~1 tablespoon of flour
    // One tablespoon of flour is roughly 9g of the flour
    const flourAltitudeRanges = [
        { altitudeRange: [3500, 6500], increaseAmount: 2 },
        { altitudeRange: [6500, 8500], increaseAmount: 2.25 },
        { altitudeRange: [8500, 10000], increaseAmount: 2.5 }
    ];

    //this is a lot more complicated for the calculations....
    const leaveningAgentsAltitudeRanges = [
        { altitudeRange: [3500, 5000], decreaseAmount: 0.125}, // for 1 tsp: 87.5%, 2tsp: 75%, 4tsp: 62.5% 
        { altitudeRange: [5000, 6500], decreaseAmount: [0.125, 0.25] }, // for 1 tsp: 50%, 2tsp: 50%, 4tsp: 37.5%%
        { altitudeRange: [6500, 8000], decreaseAmount: 0.25 } //for 1 tsp: 25%, 2tsp: 37.5%, 4tsp: 25%
    ];

    const sugarAltitudeRanges = [
        { altitudeRange: [3500, 6500], decreaseAmount: 1 },
        { altitudeRange: [6500, 8500], decreaseAmount: 2 },
        { altitudeRange: [8500, 10000], decreaseAmount: [1, 3] }
    ];

    const liquidAltitudeRanges = [
        { altitudeRange: [3500, 6500], increaseAmount: [1, 2] },
        { altitudeRange: [6500, 8500], increaseAmount: [2, 4] },
        { altitudeRange: [8500, 10000], increaseAmount: [3, 4] }
    ];

    // Adjust Flour
    recipe.flour += calculateAdjustment(flourAltitudeRanges, altitude);

    // Adjust Leavening Agents
    recipe.leaveningAgents -= calculateAdjustment(leaveningAgentsAltitudeRanges, altitude);

    // Adjust Sugar
    recipe.sugar -= calculateAdjustment(sugarAltitudeRanges, altitude);

    // Adjust Liquid
    recipe.liquid += calculateAdjustment(liquidAltitudeRanges, altitude);

    return recipe;
}

function calculateAdjustment(altitudeRanges, altitude) {
    for (const range of altitudeRanges) {
        const [minAltitude, maxAltitude] = range.altitudeRange;
        if (altitude >= minAltitude && altitude <= maxAltitude) {
            const adjustment = range.decreaseAmount || range.increaseAmount;
            return Array.isArray(adjustment) ? getRandomNumberBetween(adjustment[0], adjustment[1]) : adjustment;
        }
    }
    return 0;
}

function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Example usage:
const originalRecipe = {
    flour: 2,
    leaveningAgents: 1,
    sugar: 3,
    liquid: 4
};

const altitude = 5000; // Example altitude

const adjustedRecipe = adjustRecipeAmounts(originalRecipe, altitude);

console.log('Original Recipe:', originalRecipe);
console.log('Adjusted Recipe:', adjustedRecipe);

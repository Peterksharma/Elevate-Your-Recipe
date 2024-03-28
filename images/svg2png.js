const sharp = require('sharp');
const prompt = require('prompt-sync')({ sigint: true });

// Ask for the SVG file path
const svgFilePath = prompt('Enter the path to your SVG file: ');

// Sizes for conversion
const sizes = [16, 48, 128];

sizes.forEach(size => {
    const outputFilePath = `icon-${size}x${size}.png`;
    sharp(svgFilePath)
        .resize(size, size)
        .toFile(outputFilePath, (err, info) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log(`Created ${outputFilePath}`);
            }
        });
});

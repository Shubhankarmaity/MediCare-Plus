const fs = require('fs');
const path = require('path');
const https = require('https');

const imageUrl = "https://images.unsplash.com/photo-1587351021759-3e566b9af922?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
const outputPath = path.resolve("d:\\project files\\Hospital\\my-app\\src\\assets\\images\\city_general.jpg");

const file = fs.createWriteStream(outputPath);

https.get(imageUrl, function (response) {
    response.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log('Download Completed:', outputPath);
    });
}).on('error', (err) => {
    fs.unlink(outputPath);
    console.error('Error downloading image:', err.message);
});

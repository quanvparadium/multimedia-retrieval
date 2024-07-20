const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Path to your video file
const videoPath = path.join(__dirname, 'store/uploads/66857d9bc8f9631af6f1a9f5.jpeg');

// Path to save the first frame
// ffmpeg(videoPath)
//     .screenshots({
//         timestamps: [0], // Capture at the 0 second mark
//         filename: 'abc.jpeg',
//         folder: __dirname,
//         size: '320x240' // Size of the frame, optional
//     })
//     .on('end', function () {
//         console.log('First frame extracted successfully!');
//     })
//     .on('error', function (err) {
//         console.error('Error extracting frame: ' + err.message);
//     });

sharp(videoPath)
    .resize(320, 240) // Resize the image (optional)
    .toFile(path.join(__dirname, 'abc.jpeg'), (err, info) => {
        if (err) {
            console.error('Error saving screenshot:', err);
        } else {
            console.log('Screenshot saved:', info);
        }
    });
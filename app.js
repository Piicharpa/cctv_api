const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const app = express();
const port = process.env.PORT || 3000;

app.get('/cctv_cam_data', (req, res) => {
    const results = {};  // Change to object instead of array
    let vidCounter = 1;  // Keep the counter for keys
    
    // Use path.join to correctly reference the file
    const csvFilePath = path.join(__dirname, 'cctv_cam_data.csv');
    
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            // Use vidCounter as key but include cam_id inside the object
            results[vidCounter++] = {
                id: data.cam_id,  // This will ensure the ID appears
                ip: data.ip,
                type: data.type,
                location: {
                    lat: parseFloat(data.lat),
                    long: parseFloat(data.long)
                },
                status: data.status
            };
        })
        .on('end', () => {
            if (Object.keys(results).length === 0) {
                return res.status(404).json({ message: "No data found." });
            }
            res.json(results);  // Return the object directly
        })
        .on('error', (error) => {
            console.error('Error reading the CSV file:', error);
            res.status(500).send('Error reading the CSV file');
        });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
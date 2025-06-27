const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const app = express();
const port = process.env.PORT || 3000;

app.get('/cctv_cam_data', (req, res) => {
    const results = {};
    let vidCounter = 1;
    
    // Use path.join to correctly reference the file
    const csvFilePath = path.join(__dirname, 'cctv_cam_data.csv');
    console.log('Attempting to read CSV from:', csvFilePath);
    
    fs.createReadStream(csvFilePath)
        .pipe(csv({
            // Define the headers for your CSV
            headers: ['cam_id', 'ip', 'type', 'lat', 'long', 'status'],
            skipLines: 1 // Set to 1 if your CSV already has a header row
        }))
        .on('data', (data) => {
            // Log each row to see what's being parsed
            console.log('Parsed CSV row:', data);
            
            results[vidCounter++] = {
                cam_id: data.cam_id || 'unknown',
                ip: data.ip || '',
                type: data.type || '',
                location: {
                    lat: parseFloat(data.lat || 0),
                    long: parseFloat(data.long || 0)
                },
                status: data.status || 'unknown'
            };
            
            // Log the object that was just added
            console.log('Added to results:', results[vidCounter-1]);
        })
        .on('end', () => {
            if (Object.keys(results).length === 0) {
                console.log('No results found');
                return res.status(404).json({ message: "No data found." });
            }
            console.log('Final results:', results);
            res.json(results);
        })
        .on('error', (error) => {
            console.error('Error reading the CSV file:', error);
            res.status(500).send('Error reading the CSV file');
        });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
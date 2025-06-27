const express = require('express');
const fs = require('fs');
const path = require('path'); // Add this
const csv = require('csv-parser');
const app = express();
const port = process.env.PORT || 3000;

app.get('/cctv_cam_data', (req, res) => {
    const results = [];
    let vidCounter = 1;
    
    // Use path.join to correctly reference the file
    const csvFilePath = path.join(__dirname, 'cctv_cam_data.csv');
    
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push({
                [vidCounter++]: {
                    id: data.cam_id,
                    ip: data.ip,
                    type: data.type,
                    location: {
                        lat: parseFloat(data.lat),
                        long: parseFloat(data.long)
                    },
                    status: data.status
                }
            });
        })
        .on('end', () => {
            if (results.length === 0) {
                return res.status(404).json({ message: "No data found." });
            }
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
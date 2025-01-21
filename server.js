const express = require('express');
const cors = require('cors'); //npm install cors: To aquire permissions to access APIs i.e Supabase etc.
const fs = require('fs'); //npm install fs: To Read CSV file.
const csv = require('csv-parser'); // npm i csv-parser: To Parse CSV files.
const supabase = require('./SupabaseClient'); //npm i @supabase/supabase-js: To access Supabase
const multer = require('multer'); //npm i multer: To let user upload files.
const path = require('path'); //(To manage/concatenate paths)
const dotenv = require('dotenv').config(); // npm i dotenv (to access env variables)
const bodyParser = require('body-parser'); // npm install body-parser (for processing direct data/JSON, {from git webhooks etc})
const { exec } = require('child_process'); 


// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_KEY = process.env.SUPABASE_KEY;

const https = require('https');
const options = {
    key: fs.readFileSync('/etc/ssl/private/server.key'),
    cert: fs.readFileSync('/etc/ssl/certs/server.crt')
};


//-------------------------------------------------------------------------------->>

const app = express();
app.use(cors( 
    // {
    //     origin: 'https://your-amplify-app-url.com', // replace with your Amplify app URL
    //     methods: ['GET', 'POST'],
    //   }
));
app.use(bodyParser.json());

console.log('Hi, Express Server is starting')
console.log("ENV: ",process.env.SUPABASE_URL);

// app.get('/|/index.html', (req, res)=> {
app.get('^/$|/index(.html)?', (req, res) => {
    console.log('here')
    res.sendFile('./index.html', { root: __dirname })
})



//----------------------  Fetch (and map) Supabase Movies Data  --------------------------->>
app.get('/supabase/movies', (req, res) => {

    const FetchSupabaseData = async () => {
        const { data, error } = await supabase
            .from('movies')
            .select('*')

        if (data) {
            res.json(data)
        }
        if (error) {
            console.log('Error fetching supa data:', error)
        }
    }

    FetchSupabaseData();
})
//----------------------()  Fetch Supabase Movies Data Ends ()--------------------------->>





//----------------------  Fetch (and map) Supabase Tasks Data  --------------------------->>
app.get('/supabase/tasks', (req, res) => {

    const FetchSupabaseData = async () => {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')

        if (data) {
            res.json(data)
        }
        if (error) {
            console.log('Error fetching supa data:', error)
        }
    }

    FetchSupabaseData();
})
//----------------------()  Fetch Supabase Tasks Data Ends () --------------------------->>





//----------------------  Uploading CSV by User Starts --------------------------->>

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const originalName = file.originalname.replace(/\s+/g, '_');
        // Replace spaces with underscores for safety
        cb(null, `${originalName}`)
    }
    // filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


app.post('/upload-csv', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No File Uploaded')
    }
    res.send('File uploaded successfully')
});
//----------------------()  Uploading CSV by User Ends ()--------------------------->>








//----------------------  CSV Upload and Map Starts  --------------------------->>

//------------  CSV Mapping Function  ---------------->>

function mapData(data) {

    return data.map(row => ({
        title: row.title,
        description: row.description,
        date: row.release_year,
    }));
}

//-------------  CSV Read/Parse Function  ------------------>>
const readCSV = (csv_file) => {
    const results = [];
    fs.createReadStream(file_name)
        .pipe(csv())
        .on('data', (data) =>
            results.push(data))
        .on('end', () => {

            const mappedData = mapData(results);
            res.json(mappedData)
            // res.json(results)
        })
        .on('error', (err) => res.status(500).json({
            error: 'Error Reading File', details: err.message
        }))
}

//--------------- CSV File Upload  ------------------>>

app.get('/movies', (req, res) => {

    // app.post('/api/csv', upload.single('file'), (req, res) => {
    //     if (!req.file) {
    //         return res.status(400).send('No File Uploaded')
    //     }

    // const filename= req.file.originalname ;
    // console.log('User File Name = ', filename) ;

    const csv_file = 'movies.csv';
    readCSV(csv_file);

});

//----------------------()  CSV Upload and Map Ends  ()--------------------------->>







//----------------------  Send CSV Movies Data to SupaBase STARTS  --------------------------->>


app.post('/upload/supabase/movies', upload.single('file'), (req, res) => {  // CSV Upload Call
    if (!req.file) {
        return res.status(400).send('No File Uploaded')
    }
    // res.json({ message: 'File uploaded successfully' })

    // const file_name = path.join(__dirname, 'upload', 'movies.csv');
    const csv_file = `./uploads/${req.file.filename}`;

    console.log('File Name is =', csv_file);

    function mapData(data) {   // Map Function
        return data.map(row => ({
            name: row.title,
            description: row.description,
            date: row.release_year,
        }));
    }

    // CSV File Read Function

    const results = [];
    fs.createReadStream(csv_file)
        .pipe(csv())
        .on('data', (data) =>
            results.push(data))
        .on('end', async () => {
            const mappedData = mapData(results);


            //-----  CSV Data Uploading to SupaBase  --->>
            try {
                for (const row of mappedData) {
                    const { name, description, date } = row;

                    const { data, error } = await supabase
                        .from('movies')
                        .insert([{ name, description, date }])
                        .select()

                    // if (data) { res.json('Added Task:', data) }
                    if (error) { return res.status(500).json({ err: 'Error Adding record', detail: error }) }

                    console.log('Added Task', data);
                }

                console.log('All rows processed successfully!');
                res.json({ message: 'All rows processed successfully!' });
            }
            catch (err) {
                console.error('Unexpected Error:', err);
                res.status(500).json({ error: 'An unexpected error occurred' });
            }
            //-----  CSV Data Uploading to SupaBase ENDS  --->>

        })
        .on('error', (err) => res.status(500).json({
            error: 'Error Reading File', details: err.message
        }))
});

//----------------------  Send CSV Movies Data to SupaBase ENDS --------------------------->>



//----------------------  Send CSV Tasks Data to SupaBase STARTS  --------------------------->>


app.post('/upload/supabase/tasks', upload.single('file'), (req, res) => {  // CSV Upload Call
    if (!req.file) {
        return res.status(400).send('No File Uploaded')
    }
    // res.json({ message: 'File uploaded successfully' })


    const csv_file = `./uploads/${req.file.filename}`;

    console.log('File Name is =', csv_file);

    function mapData(data) {   // Map Function
        return data.map(row => ({
            name: row.name,
            description: row.description,
            date: row.date,
            priority: row.priority,
            status: row.status
        }));
    }

    // CSV File Read Function

    const results = [];
    fs.createReadStream(csv_file)
        .pipe(csv())
        .on('data', (data) =>
            results.push(data))
        .on('end', async () => {
            const mappedData = mapData(results);

            console.log(mappedData) ;


            //-----  CSV Data Uploading to SupaBase  --->>
            try {
                for (const row of mappedData) {
                    const { name, description, date, priority, status } = row;

                    const { data, error } = await supabase
                        .from('Tasks')
                        .insert([{ name, description, date, priority, status }])
                        .select()

                    // if (data) { res.json('Added Task:', data) }
                    if (error) { return res.status(500).json({ err: 'Error Adding record', detail: error }) }

                    console.log('Added Task', data);
                }

                console.log('All rows processed successfully!');
                res.json({ message: 'All rows processed successfully!' });
            }
            catch (err) {
                console.error('Unexpected Error:', err);
                res.status(500).json({ error: 'An unexpected error occurred' });
            }
            //-----  CSV Data Uploading to SupaBase ENDS  --->>

        })
        .on('error', (err) => res.status(500).json({
            error: 'Error Reading File', details: err.message
        }))
});

//----------------------  Send CSV Tasks Data to SupaBase ENDS --------------------------->>








//----------------------  Delete Supabase Data  --------------------------->>
app.delete('/api/delete/:id', async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('Tasks')
        .delete()
        .eq('id', id)
        .select()

    // if (data) {
    //     res.json('Deleted data:', data)
    // }

    if (error) {
        return res.status(500).json({ err: 'Error Deleting record', detail: error })
    }

})
//----------------------  Delete Data Ends  --------------------------->>



//----------------------  Add Supabase Data  --------------------------->>
app.post('/api/add', async (req, res) => {
    const { name, description, date } = req.body;

    const { data, error } = await supabase
        .from('Tasks')
        .insert(
            [{ name, description, date }]
        )
        .select()

    if (data) {
        res.json('Added Task:', data)
    }

    if (error) {
        return res.status(500).json({ err: 'Error Deleting record', detail: error })
    }

})
//----------------------  Add Data Ends  --------------------------->>


app.get('/data(.js)?', (req, res) => {
    res.sendFile('./data.js', { root: __dirname })
})


//Default route
app.get('/*', (req, res) => {
    res.status(404).sendFile('index.html', { root: __dirname })
})

//----------------------  GitHub WebHook Starts  --------------------------->>
// This Hook ensures that github changes are pulled into code/server when changes are pulled on github and github webhook workflow sends the webhook to EC2 Server.

// app.post('/webhook', (req, res) => {
//     const payload = req.body;

//     if (payload.ref === 'refs/heads/main') { // Ensure it's the main branch
//         exec('cd ~/My_Express_Server && git pull origin main && pm2 restart server.js', (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error: ${error.message}`);
//                 return res.status(500).send('Deployment failed');
//             }
//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//                 return res.status(500).send('Deployment failed');
//             }
//             console.log(`stdout: ${stdout}`);
//             res.status(200).send('Deployment successful');
//         });
//     } else {
//         res.status(400).send('Not a main branch push');
//     }
// });

//----------------------  GitHub WebHook Ends  --------------------------->>



var server = app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000')
})


//now run "npm start" or "npm run dev" (for nodemon)

// https.createServer(options, app).listen(443, () => {
//     console.log('Server is running on https://http://100.29.21.213');
// });


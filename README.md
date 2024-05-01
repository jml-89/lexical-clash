# Lexical Clash

Browser-based word battle game built in Next.js

[Play](https://lexicalclash.com)

## Develop

Prepare an empty postgres database for the application to use  
Remember the database name, user, password, port, host for later steps

`git clone https://github.com/jml-89/lexical-clash.git`  
`cd lexical-clash`

Add configuration to `.env.local` in base directory (same one as this README.md)  
Below are the minimum keys to include with some example values  
If you used different values when setting up your database, use those  
`PGHOST=localhost`  
`PGPORT=5432`  
`PGUSER=lexicalclash`  
`PGPASSWORD=secretpassword`  
`PGDATABASE=lexicalclashgame`

Browse into base directory (the one with this README.md)  
`npm install`  
`npm run dev`

Go to `http://localhost:3000/init`  
Press the Initialise button to prepare database content  
This step downloads a Wordnet XML file and parses it into the database  
Please be patient, this can take a while; progress is logged to console

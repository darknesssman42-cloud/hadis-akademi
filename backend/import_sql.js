const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hadith = require('./models/Hadith');

dotenv.config();

const sqlPath = 'c:\\Users\\Mustafa\\OneDrive\\Masaüstü\\riyazus_salihin_with_ravi.sql';

if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found at', sqlPath);
    process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');
const insertBlocks = sqlContent.split('INSERT INTO `riyazus_salihin`');

let tuples = [];

// Parse each insert block
for (let b = 1; b < insertBlocks.length; b++) {
    const block = insertBlocks[b];
    let i = block.indexOf('VALUES');
    if (i === -1) continue;
    i += 6;

    while (i < block.length) {
        if (block[i] === '(') {
            let insideString = false;
            let currentTuple = [];
            let currentString = "";
            let isStringContext = false;
            i++;
            while (i < block.length) {
                if (block[i] === "'" && block[i - 1] !== '\\') {
                    insideString = !insideString;
                    isStringContext = true;
                    i++;
                    continue;
                }
                if (insideString) {
                    if (block[i] === '\\' && block[i + 1] === "'") {
                        currentString += "'";
                        i += 2;
                        continue;
                    }
                    if (block[i] === '\\' && block[i + 1] === 'n') { currentString += '\n'; i += 2; continue; }
                    if (block[i] === '\\' && block[i + 1] === 'r') { currentString += '\r'; i += 2; continue; }
                    currentString += block[i];
                } else {
                    if (block[i] === ',' || block[i] === ')') {
                        if (isStringContext) {
                            currentTuple.push(currentString);
                        } else {
                            currentTuple.push(currentString.trim());
                        }
                        currentString = "";
                        isStringContext = false;
                        if (block[i] === ')') {
                            tuples.push(currentTuple);
                            i++;
                            break;
                        }
                    } else {
                        currentString += block[i];
                    }
                }
                i++;
            }
        }
        if (block[i] === ';') break; // end of statement
        i++;
    }
}

console.log(`Parsed ${tuples.length} hadiths from SQL.`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hadis-akademi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB connected. Clearing old hadiths...');
        await Hadith.deleteMany({});

        let toInsert = [];
        for (const t of tuples) {
            if (t.length < 6) continue;

            let idVal = t[0];
            let arabicVal = t[1];
            let turkishVal = t[2];
            let hadithIdVal = t[3];
            let titleVal = t[4];
            let raviVal = t[5];

            if (!arabicVal || arabicVal.trim() === '' || !turkishVal || turkishVal.trim() === '') {
                continue; // skip empty hadiths
            }

            // Strip HTML tags from turkish
            turkishVal = turkishVal.replace(/<[^>]*>?/gm, '').trim();
            // Remove \r\n
            arabicVal = arabicVal.replace(/\\r/g, '').replace(/\\n/g, '\n').trim();
            turkishVal = turkishVal.replace(/\\r/g, '').replace(/\\n/g, '\n').trim();

            let difficulty = 'kolay';
            if (arabicVal.length > 300) difficulty = 'zor';
            else if (arabicVal.length > 100) difficulty = 'orta';

            let topicVal = titleVal;
            if (topicVal.includes(':')) {
                topicVal = topicVal.split(':').slice(1).join(':').trim();
            } else {
                topicVal = titleVal.replace(/Riyazus Salihin, [0-9]+ Nolu Hadis/g, '').trim();
                if (!topicVal) topicVal = 'Genel';
            }

            toInsert.push({
                number: parseInt(hadithIdVal) || parseInt(idVal),
                arabic: arabicVal,
                turkish: turkishVal,
                source: 'Riyâzü’s-Sâlihîn',
                topic: topicVal || 'Genel Hadis',
                narrator: raviVal && raviVal !== 'NULL' && raviVal !== '' ? raviVal : 'Bilinmeyen Râvi',
                difficulty,
                dailyExample: 'Bu hadisi günlük hayatımızda uygulamaya gayret edelim.'
            });
        }

        console.log(`Inserting ${toInsert.length} formatted hadiths into DB...`);
        await Hadith.insertMany(toInsert);
        console.log('Import successful!');
        process.exit(0);
    })
    .catch(err => {
        if (err.errors) console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
        else console.error('Error:', err);
        process.exit(1);
    });

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(fileUpload());
app.use(express.static('public'));

const STOPWORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any','are','as','at',
    'be','because','been','before','being','below','between','both','but','by',
    'can','could',
    'did','do','does','doing','down','during',
    'each',
    'few','for','from','further',
    'had','has','have','having','he','her','here','hers','herself','him','himself','his','how',
    'i','if','in','into','is','it','its','itself',
    'just',
    'me','more','most','my','myself',
    'no','nor','not','now',
    'of','off','on','once','only','or','other','our','ours','ourselves','out','over','own',
    'same','she','should','so','some','such',
    'than','that','the','their','theirs','them','themselves','then','there','these','they','this','those','through','to','too',
    'under','until','up',
    'very',
    'was','we','were','what','when','where','which','while','who','whom','why','with',
    'you','your','yours','yourself','yourselves'
]);

function summarizeText(text, maxSentences = 3) {
    const clean = text
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .trim();

    if (!clean) return '';

    const sentences = clean
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0);

    if (sentences.length <= maxSentences) {
        return sentences.join(' ');
    }

    const freq = Object.create(null);
    const wordRe = /[a-zA-Z][a-zA-Z']*/g;
    for (const sentence of sentences) {
        const words = sentence.toLowerCase().match(wordRe) || [];
        for (const w of words) {
            if (STOPWORDS.has(w)) continue;
            freq[w] = (freq[w] || 0) + 1;
        }
    }

    const scored = sentences.map((sentence, index) => {
        const words = sentence.toLowerCase().match(wordRe) || [];
        let score = 0;
        for (const w of words) {
            if (STOPWORDS.has(w)) continue;
            score += freq[w] || 0;
        }
        return { sentence, index, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, maxSentences).sort((a, b) => a.index - b.index);
    return top.map(s => s.sentence.trim()).join(' ');
}

app.post('/upload', (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const file = req.files.file;
        if (!file || !file.name) {
            return res.status(400).json({ error: 'File field is missing.' });
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
            return res.status(400).json({ error: 'Only .txt files are supported.' });
        }

        const buffer = file.data;
        const text = buffer ? buffer.toString('utf8') : '';
        const summary = summarizeText(text, 3);

        if (!summary) {
            return res.status(400).json({ error: 'File is empty or unreadable.' });
        }

        return res.json({
            fileName: file.name,
            fileSizeKB: (file.size / 1024).toFixed(2),
            summary
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Server error while summarizing.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

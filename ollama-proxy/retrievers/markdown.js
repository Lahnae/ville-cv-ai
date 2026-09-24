const fs = require('fs');
const path = require('path');

function normalize(value) {
    return value.toLocaleLowerCase('fi-FI').normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

const STOP_WORDS = new Set([
    'ja', 'on', 'oli', 'ovat', 'han', 'hanen', 'hanella', 'mita', 'mika', 'missa',
    'kuinka', 'kerro', 'ville', 'olet', 'olen', 'sinulla', 'sinä', 'about', 'the', 'and', 'what', 'how', 'his', 'her'
].map(normalize));

function terms(value) {
    return normalize(value).split(/\s+/).filter(term => term.length > 1 && !STOP_WORDS.has(term));
}

function intentFor(query) {
    const value = normalize(query);
    if (/\b(?:osa\p{L}*|taito\p{L}*|teknolog\p{L}*)\b/u.test(value)) return 'skills';
    if (/\bprojek\p{L}*\b/u.test(value)) return 'projects';
    if (/\b(?:tyo\p{L}*|kokem\p{L}*|ura|teh\p{L}*|teit)\b/u.test(value)) return 'experience';
    if (/\b(?:koulut\p{L}*|opiskel\p{L}*|tutkinto\p{L}*)\b/u.test(value)) return 'education';
    if (/\bkiel\p{L}*\b/u.test(value)) return 'languages';
    if (/\b(?:kuka|esittely|esittele|profiil\p{L}*)\b/u.test(value)) return 'profile';
    return null;
}

function splitIntoChunks(text) {
    const chunks = text.split(/(?=^##\s)/m).map(part => part.trim()).filter(Boolean);
    if (chunks.length > 1 && !chunks[0].replace(/^#{1,6}.*$/gm, '').trim()) {
        chunks[1] = `${chunks[0]}\n\n${chunks[1]}`;
        chunks.shift();
    }
    return chunks;
}

function fallbackForIntent(documents, intent, limit) {
    if (!intent) return [];
    const source = intent === 'skills' ? 'skills.md'
        : intent === 'projects' ? 'projects.md'
            : 'profile.md';
    const section = intent === 'experience' ? 'tyokokemus'
        : intent === 'education' ? 'koulutus'
            : intent === 'languages' ? 'kielet'
                : null;
    const document = documents.find(item => item.source === source);
    if (!document) return [];

    let chunks = document.chunks;
    if (section) chunks = chunks.filter(chunk => {
        const heading = chunk.match(/^#{1,6}\s+(.+)$/m)?.[1] || '';
        return normalize(heading) === section;
    });
    else if (intent === 'profile') chunks = chunks.slice(0, 1);

    return chunks.slice(0, limit).map(text => ({ source, text }));
}

function create(options = {}) {
    const directory = options.directory || path.resolve(__dirname, '../../knowledge');
    const documents = fs.existsSync(directory)
        ? fs.readdirSync(directory).filter(name => name.toLowerCase().endsWith('.md')).sort()
            .map(source => ({ source, chunks: splitIntoChunks(fs.readFileSync(path.join(directory, source), 'utf8')) }))
        : [];

    return {
        retrieve(query, limit = 3) {
            const intent = intentFor(query);
            const intentMatches = fallbackForIntent(documents, intent, limit);
            if (intentMatches.length) return intentMatches;

            const queryTerms = [...new Set(terms(query))];
            const ranked = documents.flatMap(document => document.chunks.map(text => {
                const contentTerms = new Set(terms(text));
                const score = queryTerms.reduce((sum, term) => sum + (contentTerms.has(term) ? 1 : 0), 0);
                return { source: document.source, text, score };
            }))
                .filter(chunk => chunk.score > 0)
                .sort((a, b) => b.score - a.score || a.source.localeCompare(b.source))
                .slice(0, limit)
                .map(({ source, text }) => ({ source, text }));

            return ranked;
        }
    };
}

module.exports = { create };

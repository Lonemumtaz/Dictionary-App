const input  = document.getElementById('search-input');
const btn    = document.getElementById('search-btn');
const output = document.getElementById('dictionary-app');

// ── API ───────────────────────────────────────────────────────
async function fetchDefinition(word) {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('not_found');
    const data = await res.json();
    return data[0];
}

// ── Event Listeners ───────────────────────────────────────────
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') search();
});

btn.addEventListener('click', search);

// ── Main Search Flow ──────────────────────────────────────────
async function search() {
    const word = input.value.trim();
    if (!word) {
        input.focus();
        return;
    }

    setLoading(true);

    try {
        const data = await fetchDefinition(word);

        if (!data || !data.meanings) {
            showError('No results found for that word.');
            return;
        }

        renderCard(data);

    } catch (err) {
        showError(
            err.message === 'not_found'
                ? `"${word}" was not found. Check the spelling and try again.`
                : 'Network error. Please check your connection.'
        );
    } finally {
        setLoading(false);
    }
}

// ── Render Card ───────────────────────────────────────────────
function renderCard(data) {
    const partsOfSpeech = data.meanings.map(m => m.partOfSpeech).join(', ');
    const phoneticText  = data.phonetic ?? '';
    const audioSrc      = data.phonetics?.find(p => p.audio)?.audio ?? '';
    const definition    = data.meanings[0].definitions[0].definition ?? '';
    const example       = data.meanings[0].definitions[0].example ?? '';

    output.innerHTML = `
        <div class="card">

            <div class="card-word-row">
                <span class="card-word">${escHtml(data.word)}</span>
                ${partsOfSpeech ? `<span class="card-pos-badge">${escHtml(partsOfSpeech)}</span>` : ''}
            </div>

            ${phoneticText ? `<div class="card-phonetic">${escHtml(phoneticText)}</div>` : ''}

            ${audioSrc ? `
            <div class="audio-wrap">
                <button class="play-btn" id="play-btn" title="Listen to pronunciation" aria-label="Play pronunciation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                </button>
                <span class="audio-label">Hear pronunciation</span>
                <audio id="word-audio" src="${audioSrc}" preload="none"></audio>
            </div>` : ''}

            <hr class="card-divider">

            <div class="prop-block">
                <div class="prop-label">Definition</div>
                <div class="prop-value definition">${escHtml(definition)}</div>
            </div>

            ${example ? `
            <div class="prop-block">
                <div class="prop-label">Example</div>
                <div class="prop-value example">${escHtml(example)}</div>
            </div>` : ''}

        </div>`;

    // Wire up the custom play button
    if (audioSrc) {
        const playBtn = document.getElementById('play-btn');
        const audio   = document.getElementById('word-audio');

        playBtn.addEventListener('click', () => {
            audio.currentTime = 0;
            audio.play();
        });

        // Swap icon while playing
        audio.addEventListener('play', () => {
            playBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                     viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>`;
        });
        audio.addEventListener('ended', resetPlayIcon.bind(null, playBtn));
        audio.addEventListener('pause', resetPlayIcon.bind(null, playBtn));
    }
}

function resetPlayIcon(btn) {
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>`;
}

// ── UI Helpers ────────────────────────────────────────────────
function setLoading(on) {
    btn.disabled = on;
    if (on) {
        output.innerHTML = `
            <div class="loading-card">
                <div class="spinner"></div>
                <span>Looking up&hellip;</span>
            </div>`;
    }
}

function showError(message) {
    output.innerHTML = `
        <div class="error-card">
            <span class="error-icon">✦</span>
            <p>${escHtml(message)}</p>
        </div>`;
}

// Prevent XSS — escape any user-supplied or API text inserted via innerHTML
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

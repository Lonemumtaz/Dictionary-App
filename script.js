const input = document.querySelector('input');
const btn = document.querySelector('button');


const dictionaryArea = document.querySelector('.dictionary-app');


//https://api.dictionaryapi.dev/api/v2/entries/en/<word>


async function dictionaryfn(word){
const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
.then((res) => res.json())

return res[0];

}

btn .addEventListener('click', fetchandCreateCard);

async function fetchandCreateCard(){
    const data = await dictionaryfn(input.value);
    if (!data || !data.meanings) {
        dictionaryArea.innerHTML = `<div class="card"><div class="property"><span>Word not found or API error. Please try another word.</span></div></div>`;
        return;
    }
    console.log(data);

    let partOfSpeechArray = [];
    for (let i = 0; i < data.meanings.length; i++) {
        partOfSpeechArray.push(data.meanings[i].partOfSpeech);
    }
    // createCard(data);
    dictionaryArea.innerHTML = `      
        <div class="card">
                     <div class="property"> 
                          <span>Word: </span>
                          <span>${data.word}</span>
                     </div>
                      <div class="property"> 
                          <span>phonetics: </span>
                          <span>${data.phonetic}</span>
                     </div>
                      <div class="property"> 
                          <span>
                          <audio controls src="${data.phonetics[0].audio}"></audio>
                            </span>
                     </div>
                      <div class="property">
                          <span>Parts of Speech: </span>
                          <span>${partOfSpeechArray.join(', ')}</span>
                      </div>
                      <div class="property">
                          <span>Definition: </span>
                          <span>${data.meanings[0].definitions[0].definition}</span>
                      </div>
                      <div class="property"> 
                          <span>Example: </span>
                          <span>${data.meanings[0].definitions[0].example || 'N/A'}</span>
                      </div>
        </div>`;
}

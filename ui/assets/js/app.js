
const form = document.forms[0];
const overlay = document.querySelector('.overlay');
let abortController;

const showResponse = (string) => {
    document.querySelector('code').innerText = string;
}
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const endpoint  = event.target.action;
    const description = document.getElementById('input')?.value?.trim();
    if (!description || endpoint === window.location.href) {
        return;
    }

    overlay.hidden = false;
    abortController = new AbortController();
    fetch(endpoint, {
        signal: abortController.signal,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({description}),
    })
        .then(res => res.text())
        .then(txt => {
            showResponse(txt);
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            overlay.hidden = true;
        })
})

const pickIndex = (array) => Math.floor(Math.random() * array.length);

const overlayStatus = () => {
    const messages = [
        'G\'ing the PT',
        'Waiting',
        'Thinking',
        'Pondering',
        'Taking over jobs',
        'Secretly reading your emails',
        'Asking a guy I went to school with',
        'Tokenizing thingamajigs',
        'Parsing description',
        'Taking a break',
        'Accessing the mainframe',
        'Generating response',
        'Telling the interns to hurry',
        'Taking a sip of coffee',
        'Typing as fast as I can',
        'Making you wait because I can',
        'Burning the evidence',
        'Cleaning up after myself',
        'Any moment now',
        'SIKE! Still letting you wait',
    ];

    let currentIndex;

    const statusContainer = document.querySelector('.status');
    setInterval(() => {
        let i = pickIndex(messages);
        while (i === currentIndex) {
            i = pickIndex(messages);
        }
        currentIndex = i;
        statusContainer.innerText = `${messages[currentIndex]}...`;
    }, 5000);
}

overlayStatus();

window.addEventListener('keydown', ({key}) => {
    if (key !== 'Escape' || !abortController) {
        return;
    }

    abortController.abort();


}, {passive: true});

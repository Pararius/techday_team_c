
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
    const fd = new FormData();
    fd.append('description', description);
    fetch(endpoint, {
        signal: abortController.signal,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: fd,
    })
        .then(res => res.json())
        .then(json => {
            showResponse(json);
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            overlay.hidden = true;
        })
})

pickIndex = (array) => Math.floor(Math.random() * array.length);

const overlayStatus = () => {
    const messages = [
        'G\'ing the PT',
        'Waiting',
        'Thinking',
        'Pondering',
        'Taking over jobs',
        'Secretly reading your emails',
        'Asking a guy I went to school with',
    ]

    let currentIndex;

    const statusContainer = document.querySelector('.status');
    setInterval(() => {
        let i = pickIndex(messages);
        while (i === currentIndex) {
            i = pickIndex(messages);
        }
        currentIndex = i;
        statusContainer.innerText = `${messages[currentIndex]}...`;
    }, 1000);
}

overlayStatus();

window.addEventListener('keydown', ({key}) => {
    if (key !== 'Escape' || !abortController) {
        return;
    }

    abortController.abort();


}, {passive: true});

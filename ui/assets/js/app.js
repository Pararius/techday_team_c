const fakeResponse = `
{
  "rentalPrice": {
    "label": "Huurprijs",
    "value": "1600"
  },
  "availableSince": {
    "label": "Aangeboden sinds",
    "value": null
  },
  "availability": {
    "label": "Beschikbaarheid",
    "options": ["Te huur", "Verhuurd"],
    "value":"Te huur"
  },
  "surfaceArea": {
    "label": "Woonoppervlakte m2",
    "value": null
  },
  "numRooms": {
    "label": "Aantal kamers",
    "value": "2"
  },
  "numBedrooms": {
    "label": "Aantal slaapkamers",
    "value": "1"
  },
  "numBathrooms": {
    "label": "Aantal badkamers",
    "value": "1"
  },
  "energyLabel": {
    "label": "Energielabel",
    "value": null
  },
  "balcony": {
    "label": "Balkon aanwezig",
    "options": ["Ja", "Nee", null],
    "value":null
  },
  "garden": {
    "label": "Tuin aanwezig",
    "options": ["Ja", "Nee", null],
    "value":"Nee"
  },
  "shower": {
    "label": "Douche aanwezig",
    "options": ["Ja", "Nee", null],
    "value":"Ja"
  },
  "toilet": {
    "label": "Toilet aanwezig",
    "options": ["Ja", "Nee", null],
    "value":null
  },
  "storage": {
    "label": "Bergruimte aanwezig",
    "options": ["Ja", "Nee", null],
    "value":"Ja"
  },
  "shed": {
    "label": "Schuur aanwezig",
    "options": ["Ja", "Nee", null],
    "value":"Nee"
  },
  "garage": {
    "label": "Garage aanwezig",
    "options": ["Ja", "Nee", null],
    "value":"Nee"
  },
  "parking": {
    "label": "Parkeerruimte aanwezig",
    "options": ["Ja", "Nee", null],
    "value":null
  },
  "buildingType": {
    "label": "Soort bouw",
    "options": ["Bestaande bouw", "Nieuwbouw", null],
    "value":"Bestaande bouw"
  },
  "interior": {
    "label": "Interieur",
    "options": ["Gemeubileerd", "Gestoffeerd", "Kaal", null],
    "value":"Gestoffeerd"
  },
  "apartmentOrHouse": {
    "label": "Type woning",
    "options": ["Appartement", "Huis", null],
    "value":"Appartement"
  }
}
---
Deze prachtige en karakteristieke voormalige pakhuiswoning ligt in het hart van Alkmaar, een historische stad in Noord-Holland. De woning bevindt zich in een rustig gebied, midden in het stadscentrum en combineert de sfeer en uitstraling van het oude centrum met moderne voorzieningen. Op loopafstand vindt u het historische Waagplein met haar gezellige terrassen, een kinderspeelplaats en diverse winkels en restaurants. Alkmaar staat bekend om haar mooie grachten, oude gebouwen en natuurlijk de wereldberoemde kaasmarkt. Hier kunt u genieten van de rijke cultuur en historie die de stad te bieden heeft.

In de directe omgeving van de Mosterdsteeg zijn er tal van bezienswaardigheden en activiteiten te ontdekken. Zo kunt u een bezoek brengen aan het Stedelijk Museum Alkmaar, de Grote Sint-Laurenskerk of de Accijnstoren. Daarnaast zijn er diverse parken en groene zones in de buurt, zoals het Victoriepark en het Bolwerk, waar u heerlijk kunt wandelen en ontspannen. Ook het winkelgebied van Alkmaar ligt op een steenworp afstand, waar u naar hartenlust kunt shoppen en genieten van de levendige sfeer.

Qua openbaar vervoer is de buurt van de Mosterdsteeg goed bereikbaar. Het NS-station van Alkmaar ligt op loopafstand, waardoor u gemakkelijk en snel verbindingen heeft naar omliggende steden zoals Amsterdam, Haarlem en Den Helder. Daarnaast zijn er diverse buslijnen die door de stad rijden en u naar verschillende wijken en omliggende dorpen kunnen brengen.

In de omgeving van de Mosterdsteeg zijn er diverse scholen en supermarkten te vinden. Er zijn zowel basisscholen als middelbare scholen op loop- of fietsafstand, waardoor het een ideale locatie is voor gezinnen met kinderen. Voor uw dagelijkse boodschappen kunt u terecht bij de verschillende supermarkten in de buurt, zoals Albert Heijn, Jumbo en DEEN. Hierdoor heeft u alles wat u nodig heeft binnen handbereik.
`;



const form = document.forms[0];
const overlay = document.querySelector('.overlay');
let abortController;

const showResponse = (string) => {
    document.querySelector('code').innerText = string;
}

const generateForm = (string) => {
  const dialog = document.querySelector('dialog');
  const form = document.createElement('form');
  form.className = 'output-form';
  const [obj, description] = string.split('---');
  for (const [key, {label, value}] of Object.entries(JSON.parse(obj))) {
    form.insertAdjacentHTML('beforeend',`
      <div class="form-row">
        <label for="${key}">${label}</label>
        <input type="text" id="${key}" value="${value || ''}">
      </div>
    `);
  }
  form.insertAdjacentHTML('beforeend',`
      <div class="form-row">
        <label for="description">Omschrijving</label>
        <textarea>${description}</textarea>
      </div>
    `);
  dialog.innerHTML = '';
  dialog.insertAdjacentElement('afterbegin', form);
  dialog.showModal();
}
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const endpoint  = event.target.action;
    const description = document.getElementById('input')?.value?.trim();
    if (!description || endpoint === window.location.href) {
        return;
    }

    overlay.hidden = false;
    /*
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
     */
    new Promise(resolve => {
      setTimeout(() => resolve(fakeResponse), 12000);
    })
        // .then(res => res.text())
        .then(txt => {
            showResponse(txt);
            generateForm(txt);
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

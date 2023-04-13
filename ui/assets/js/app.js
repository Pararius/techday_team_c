
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
  const obj = JSON.parse(string.split('---')[0]);
  for (const [key, {label, value}] of Object.entries(obj)) {
    form.insertAdjacentHTML('beforeend',`
      <div class="form-row">
        <label for="${key}">${label}</label>
        <input type="text" id="${key}" value="${value || ''}">
      </div>
    `);
  }
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

const json = `
{
  "rentalPrice": {
    "label": "Huurprijs",
    "value": null
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
De Schans in Giessenlanden is een prachtige locatie in Zuid-Holland, gelegen in een rustige en groene omgeving. In de nabije omgeving vindt u diverse bezienswaardigheden en recreatiemogelijkheden die zeker de moeite waard zijn om te bezoeken. Zo kunt u genieten van de historische vestingwerken en molens die de regio rijk is, of heerlijk wandelen en fietsen door de uitgestrekte polders en natuurgebieden. Daarnaast zijn er ook diverse watersportmogelijkheden in de omgeving, zoals kanoën en vissen in de rivier de Giessen.

Naast de prachtige natuur en historische bezienswaardigheden, biedt de omgeving van De Schans in Giessenlanden ook een breed scala aan culturele en culinaire mogelijkheden. Zo kunt u een bezoek brengen aan de gezellige dorpskernen met hun karakteristieke winkels en horecagelegenheden, of genieten van een heerlijke maaltijd in één van de vele restaurants die de streek te bieden heeft. Kortom, De Schans in Giessenlanden is een ideale plek om te wonen en te genieten van al het moois dat Zuid-Holland te bieden heeft.

Wat betreft het openbaar vervoer in de buurt van De Schans in Giessenlanden zijn er diverse mogelijkheden. Er zijn verschillende buslijnen die door de regio rijden en u naar omliggende steden en dorpen kunnen brengen, zoals Gorinchem, Dordrecht en Rotterdam. Daarnaast is er een treinstation in het nabijgelegen Hardinxveld-Giessendam, waarvandaan u eenvoudig naar grotere steden als Utrecht en Amsterdam kunt reizen.

In de omgeving van De Schans in Giessenlanden zijn er diverse scholen en supermarkten te vinden. Er zijn zowel basisscholen als middelbare scholen in de nabije omgeving, waardoor het een geschikte locatie is voor gezinnen met kinderen. Wat betreft supermarkten zijn er verschillende opties beschikbaar, zoals een Albert Heijn, Jumbo en Lidl, waar u terecht kunt voor uw dagelijkse boodschappen.













`;

generateForm(json);

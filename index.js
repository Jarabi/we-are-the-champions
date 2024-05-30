import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
    getDatabase,
    ref,
    push,
    onValue,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

const appSettings = {
    databaseURL:
        'https://champions-e8ee8-default-rtdb.europe-west1.firebasedatabase.app/',
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementListInDB = ref(database, 'endorsements');

// Get DOM elements
const endoresementInputEl = document.getElementById('endorsement-text');
const fromInputEl = document.getElementById('from');
const toInputEl = document.getElementById('to');
const endorseBtn = document.getElementById('endorse-btn');
const endorsementListEl = document.getElementById('endorsement-list');

// Add event listener to the button
endorseBtn.addEventListener('click', function () {
    const endorsementText = endoresementInputEl.value;
    const fromText = fromInputEl.value;
    const toText = toInputEl.value;

    if (endorsementText && fromText && toText) {
        const endorsement = {
            from: fromText,
            to: toText,
            text: endorsementText,
            created: moment().format(),
        };

        push(endorsementListInDB, endorsement);
        clearInputFields();
    }
});

// Listen for changes in the database
onValue(endorsementListInDB, function (snapshot) {
    if (snapshot.exists()) {
        const data = Object.entries(snapshot.val());

        // Sort the data by date
        data.sort((a, b) => {
            return new Date(b[1].created) - new Date(a[1].created);
        });

        clearEndorsementListEl();

        for (let i = 0; i < data.length; i++) {
            let endorsement = data[i];
            updateEndorsementListEl(endorsement);
        }
    } else {
        endorsementListEl.innerHTML =
            "<li class='empty-list'>No endorsements yet</li>";
    }
});

/**
 * Function to clear the endorsement list
 * @returns {void}
 */
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = '';
}

/**
 * Function to clear input fields
 * @returns {void}
 */
const clearInputFields = () => {
    endoresementInputEl.value = '';
    fromInputEl.value = '';
    toInputEl.value = '';
};

/**
 * @param {array} endorsement
 * @returns {void}
 */
const updateEndorsementListEl = (endorsement) => {
    let [endorsementID, { from, to, text, created }] = endorsement;
    const date = getDate(created);

    const listEl = document.createElement('li');

    listEl.id = endorsementID;
    listEl.innerHTML = `
        <h3>To ${to}</h3>
        <p>${text}</p>
        <h3>From ${from} &middot; <span>${date}</span></h3>
    `;
    endorsementListEl.appendChild(listEl);
};

/**
 * Function to get the date
 * @param {string} string
 * @returns {string}
 */
function getDate(string) {
    const today = moment().format('DD MMMM YYYY');
    const date = moment(string).format('DD MMMM YYYY');

    return today === date ? moment(string).calendar() : date;
}

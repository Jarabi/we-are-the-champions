import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
    getDatabase,
    ref,
    push,
    onValue,
    get,
    update,
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
            likes: Math.floor(Math.random() * 10) + 1,
            liked: false,
            created: moment().format(),
        };

        push(endorsementListInDB, endorsement)
            .then(() => {
                clearInputFields();
                // console.log('Endorsement added successfully');
            })
            .catch((error) => {
                console.error('Error adding endorsement: ', error);
            });
    }
});

// Listen for changes in the database
onValue(endorsementListInDB, function (snapshot) {
    if (snapshot.exists()) {
        const data = sortEndorsementsByDate(Object.entries(snapshot.val()));

        clearEndorsementListEl();

        for (let i = 0; i < data.length; i++) {
            let endorsement = data[i];
            updateEndorsementListEl(endorsement);
        }
    } else {
        endorsementListEl.innerHTML =
            "<li class='empty-list'>No endorsements yet... 😔</li>";
    }
});

/**
 * Function to sort endorsements by date
 * @param {array} endorsements
 * @returns {array}
 */
function sortEndorsementsByDate(endorsements) {
    return endorsements.sort((a, b) => {
        return new Date(b[1].created) - new Date(a[1].created);
    });
}

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
 * Function to update endorsement list
 * @param {array} endorsement
 * @returns {void}
 */
const updateEndorsementListEl = (endorsement) => {
    let [endorsementID, { from, to, text, likes, liked, created }] =
        endorsement;
    const date = getDate(created);

    const listEl = document.createElement('li');
    listEl.id = endorsementID;

    // Create and append 'To' element
    const toEl = createElement('h3', `To ${to}`);
    listEl.appendChild(toEl);

    // Create and append 'Text' element
    const textEl = createElement('p', text);
    listEl.appendChild(textEl);

    // Div element
    const divEl = document.createElement('div');

    // Create and append 'From' element
    const fromEl = createElement('h3', `From ${from} \u00B7 `);
    divEl.appendChild(fromEl);

    // Create and append 'Date' element
    const dateEl = createElement('span', date);
    fromEl.appendChild(dateEl);

    // Create and append 'Likes' element
    const likesEl = document.createElement('span');
    likesEl.dataset.id = endorsementID;
    likesEl.dataset.liked = liked;
    likesEl.className = 'likes';
    likesEl.textContent = `🖤 ${likes}`;
    likesEl.addEventListener('click', updateLikes);
    divEl.appendChild(likesEl);

    listEl.appendChild(divEl);
    endorsementListEl.appendChild(listEl);
};

/**
 * Function to create HTML element
 * @param {String} tag
 * @param {string} content
 * @returns {element}
 */
function createElement(tag, content) {
    const element = document.createElement(tag);
    element.textContent = content;

    return element;
}

/**
 * Function to update likes
 * @returns {void}
 */
function updateLikes() {
    const id = this.dataset.id;
    const liked = this.dataset.liked === 'true'; // Convert to boolean
    const endorsementRef = ref(database, `endorsements/${id}`);

    // Get current value of endorsement
    get(endorsementRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const endorsement = snapshot.val();

                // Update the likes and liked status
                endorsement.likes += liked ? -1 : 1;
                endorsement.liked = !liked;

                // Update the endorsement in the database
                update(endorsementRef, {
                    likes: endorsement.likes,
                    liked: endorsement.liked,
                })
                    .then(() => {
                        console.log('Likes updated successfully');
                    })
                    .catch((error) => {
                        console.error('Error updating likes: ', error);
                    });
            } else {
                console.log('No ndorsement not found with given ID');
            }
        })
        .catch((error) => {
            console.log('Error fetching endorsement:', error);
        });
}

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

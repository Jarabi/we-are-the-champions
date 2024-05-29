import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://champions-e8ee8-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementListInDB = ref(database, "endorsements");

// Get DOM elements
const endoresementInputEl = document.getElementById("endorsement-text");
const endorseBtn = document.getElementById("endorse-btn");
const endorsementListEl = document.getElementById("endorsement-list");

// Add event listener to the button
endorseBtn.addEventListener("click", function() {
    const endorsement = endoresementInputEl.value;

    if (endorsement) {
        push(endorsementListInDB, endorsement);
        clearEndoresementInputEl();
    }
});

// Listen for changes in the database
onValue(endorsementListInDB, function(snapshot) {
    if (snapshot.exists()) {
        const data = Object.entries(snapshot.val());
    
        clearEndorsementListEl();
        
        for (let i = 0; i < data.length; i++) {
            let endorsement = data[i];
            updateEndorsementListEl(endorsement);
        }
    } else {
        endorsementListEl.innerHTML = "<li class='empty-list'>No endorsements yet</li>";
    }
});

/**
 * Function to clear the endorsement list
 * @returns {void}
 */
function clearEndorsementListEl() {
    endorsementListEl.innerHTML = "";
}

/**
 * Function to clear the input field
 * @returns {void}
 */
const clearEndoresementInputEl = () => {
    endoresementInputEl.value = "";
}

/**
 * @param {array} endorsement 
 * @returns {void}
 */
const updateEndorsementListEl = (endorsement) => {
    let [endorsementID, endorsementText] = endorsement;
    const listEl = document.createElement("li");

    listEl.id = endorsementID;
    listEl.textContent = endorsementText;
    endorsementListEl.appendChild(listEl);
}
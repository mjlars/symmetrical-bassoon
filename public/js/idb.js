//create variable to hold db connection 
let db;

//establish the connection to database 
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    //save reference to database
    const db = event.target.result;
    //add an object store 
    db.createObjectStore('new_spending', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    //check if app is online 
    if (navigator.online) {
        //////add function here 
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    //make transaction readwrite so data users enter can be saved 
    const transaction = db.transaction(['new_spending'], 'readwrite');
    const spendingObjectStore = transaction.objectStore('new_spending');

    spendingObjectStore.add(record);
}

function uploadSpending() {
    const transaction = db.transaction(['new_spending'], 'readwrite');

    const spendingObjectStore = transaction.objectStore('new_spending');

    //get all records from object store and set to a variable 
    const getAll = spendingObjectStore.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0 ) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                //open one more transaction 
                const transaction = db.transaction(['new_spending'], 'readwrite');
                const spendingObjectStore = transaction.objectStore('new_spending');
                //clear all items in store 
                spendingObjectStore.clear();

                //module uses alert, if time implement modal here
                console.log('All spending has been submitted!');
            })
            .catch(err => {
                console.log(err)
            });
        }
    };
};

//listen for app to go back online 
window.addEventListener('online', uploadSpending);



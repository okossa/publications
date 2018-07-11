// with async await

const createInteraction = require('./api').createInteraction;

// regular way
async function usecase_create_1_interaction() {
    let createdInteraction = await createInteraction();
    console.log('created interaction ', createdInteraction);
}

// create 3 interactions
async function usecase_create_3_interactions() {
    let createdInteraction = await createInteraction();
    console.log('created first interaction ', createdInteraction);

    let secondCreatedInteraction = await createInteraction();
    console.log('created second interaction ', createdInteraction);

    let thirdCreatedInteraction = await createInteraction();
    console.log('created third interaction ', createdInteraction);
}

// create n interactions
async function usecase_create_n_interactions() {
    for (let i = 0; i < 10; i++) {
        let justCreatedInteraction = await createInteraction();
        console.log('just created interaction numero ' + i, justCreatedInteraction);
    }
}

// mixing async and sync code
function updateInteractionDate(currentInteraction) {
    currentInteraction.dateUpdate = new Date();
    return currentInteraction;
}

function updateInteractionContent(currentInteraction) {
    currentInteraction.content = 'Hello world ' + Date.now();
    return currentInteraction;
}

async function usecase_peformOperationOnInteractions() {
    let currentInteraction = null;
    if (!currentInteraction) {
        currentInteraction = await createInteraction();
    }
    updateInteractionDate(currentInteraction);
    updateInteractionContent(currentInteraction);
    console.log('final interaction ', currentInteraction);
}





usecase_create_1_interaction();
// usecase_create_3_interactions();
// usecase_create_n_interactions();
// usecase_peformOperationOnInteractions();
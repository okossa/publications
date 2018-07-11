const createInteraction = require('./api').createInteraction;

// regular way
function usecase_create_1_interaction() {
    createInteraction().then((createdInteraction) => {
        console.log('created interaction ', createdInteraction);
    });
}

// create 3 interactions
function usecase_create_3_interactions() {  // nesting promise
    createInteraction().then((createdInteraction) => {
        console.log('created the first interaction ', createdInteraction);

        createInteraction().then((secondCreatedInteraction) => {
            console.log('created the second interaction ', secondCreatedInteraction);

            createInteraction().then((thirdCreatedInteraction) => {
                console.log('created the third interaction ', thirdCreatedInteraction);
            });
        })
    })
}

// create n interactions
function usecase_create_n_interactions() {
    // create an arbitrary number of interactions ( for loop )
    console.log('*********** creating n interactions ***********');
    for (let i = 0, p = Promise.resolve(); i < 10; i++) {
        p = p.then(_ => new Promise(resolve =>
            createInteraction().then(justCreatedInteraction => {
                console.log('just created interaction numero ' + i, justCreatedInteraction);
                // console.log('previous interactions ', _);   to pass to the over promise the previous one
                resolve(justCreatedInteraction);
            })
        ));
    }
}

// //conditional creationniong ( mixing async and sync code)
function usecase_peformOperationOnInteractions() {
    let myInteraction = undefined;
    createIfNeedInteraction(myInteraction)  // async
        .then(currenInteraction => {
            updateInteractionContent(currenInteraction);    // sync
            updateInteractionDate(currenInteraction);       // sync
            console.log('final interaction ', currenInteraction);
        });
}

// async
function createIfNeedInteraction(currentInteraction) {
    if (!currentInteraction) {
        return createInteraction();
    }
    updateInteractionDate(currentInteraction);
    return Promise.resolve(currentInteraction);
}

// sync
function updateInteractionDate(currentInteraction) {
    currentInteraction.dateUpdate = new Date();
    return currentInteraction;
}

// sync
function updateInteractionContent(currentInteraction) {
    currentInteraction.content = 'Hello world ' + Date.now();
    return currentInteraction;
}



usecase_create_1_interaction();
// usecase_create_3_interactions();
// usecase_create_n_interactions();
// usecase_peformOperationOnInteractions();
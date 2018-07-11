const rxjs = require('rxjs');
const operators = require('rxjs/operators');

const createInteraction = require('./api').createInteraction;

// create 1 interaction
function usecase_create_1_interaction() {
    rxjs
        .from(createInteraction())  //converting promise to observable
        .pipe(operators.first())
        .subscribe(createdInteraction => {
            console.log('created interaction ', createdInteraction);
        });
}

// create 3 interactions
function usecase_create_3_interactions() {
    const firstInteraction$ = rxjs.from(createInteraction());
    const secondInteraction$ = rxjs.from(createInteraction());
    const thirdInteraction$ = rxjs.from(createInteraction());

    rxjs
        .merge(firstInteraction$, secondInteraction$, thirdInteraction$)
        .subscribe(createdInteraction => {
            console.log('created interaction ', createdInteraction);
        });
}

// create n interactions
async function usecase_create_n_interactions() {
    const operationsToPerforms$ = [];
    for (let i = 0; i < 10; i++) {
        operationsToPerforms$.push(rxjs.from(createInteraction()));
    }

    let j = 0;
    const subscription = rxjs
        .concat(...operationsToPerforms$) // or merge
        .subscribe(createdInteraction => {
            console.log('just created interaction numero ' + j++, createdInteraction);
        });
    //subscription.unsubscribe();
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

function usecase_peformOperationOnInteractions() {
    let currentInteraction = null;

    const interactionStream$ = rxjs
        .of(currentInteraction)
        .pipe(operators.switchMap(currentInteraction => {   //mergeMap or flatMap ??? https://www.learnrxjs.io/operators/transformation/mergemap.html
            if (currentInteraction == null) {
                return rxjs.from(createInteraction());
            }
            return rxjs.of(currentInteraction);;
        }),
            operators.switchMap(currentInteractionReadyToBeUpdate => {
                let finalInteraction = updateInteractionDate(currentInteractionReadyToBeUpdate);
                finalInteraction = updateInteractionContent(finalInteraction);
                return rxjs.of(finalInteraction);
            }),
            operators.first());


    const subscription = interactionStream$.subscribe(x => {
        console.log('subscribe ', x);
        subscription.unsubscribe();
    });
}



usecase_create_1_interaction();
// usecase_create_3_interactions();
// usecase_create_n_interactions();
// usecase_peformOperationOnInteractions();


// bonus
// https://github.com/ReactiveX/rxjs/issues/1308 ??? why merge not working anymore
// should we unsubscribe from switchmap ?? https://stackoverflow.com/questions/44748878/do-we-have-to-unsubscribe-when-using-switchmap-operator-in-rxjs-in-angular-2
// https://stackoverflow.com/questions/49698640/flatmap-mergemap-switchmap-and-concatmap-in-rxjs?rq=1   mergeMap, concatMap, switchMap, exhaustMap ?????
// https://rxjs-dev.firebaseapp.com/guide/v6/migration migration from v5x to v6 
// https://rxjs-dev.firebaseapp.com/guide/v6/migration#howto-convert-deprecated-methods yeahhh 
// https://www.metaltoad.com/blog/angular-6-upgrading-api-calls-rxjs-6 angular 6 to rxjs 6
// https://github.com/ReactiveX/rxjs/issues/3306 ???
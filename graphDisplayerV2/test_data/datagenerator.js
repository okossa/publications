const randomValue = (list, exceptionList, nbElement) => {
    const isItemInList = (list, node, field) => list.filter(x=>x[field] == node[field]).length > 0;
    const getRandomNumber = limit => Math.floor(Math.random() * limit);
    let listLength = list.length - 1;
    let selectedRandomElement = [];
    let i;
    for (i = 0; i < nbElement; i++) {
        let randomIndex = getRandomNumber(listLength);
        while (isItemInList(exceptionList, list[randomIndex], 'id')
        || isItemInList(selectedRandomElement, list[randomIndex], 'id')) {
            randomIndex = getRandomNumber(listLength);
        }
        if(list[randomIndex] == null){
            console.log('randowIndex');
        }
        selectedRandomElement.push(list[randomIndex]);
    }
    return selectedRandomElement;
};


const makeid = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 9; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

const generateXNodes = nbNode => {
    let nodes = [];
    let countries = ['Greece', "Thailand", "United States", "China", "Poland", "Peru",
        "Armenia", "Colombia", "Philippines", "France", "Israel"];
    let sexs = ['male', 'female', 'male','female'];


    let teams = ['teamA', 'teamB' , 'teamA', 'teamB'];
    let sizes = [10,11,12,13,14,15,29,28,27,30,50,50,100];

    let jobs = ["Research Assistant III", "Computer Systems Analyst I", "Clinical Specialist",
        "Payment Adjustment Coordinator", "Senior Sales Associate", "Paralegal",
        "Systems Administrator III", "Software Consultant", "Structural Analysis Engineer",
        "Human Resources Assistant IV", "Executive Secretary", "Internal Auditor"];

    let i = 0;
    for (i = 0; i < nbNode; i++) {
        let country = randomValue(countries, [], 1)[0];
        let job = randomValue(jobs, [], 1)[0];
        let sex = randomValue(sexs, [], 1)[0];

        let team = randomValue(teams, [], 1)[0];
        let size = randomValue(sizes, [], 1)[0];

        let id = makeid();
        let first_name = makeid();
        let last_name = makeid();
        nodes.push({
            id,
            first_name,
            last_name,
            sex,
            job,
            country,
            team,
            size
        });


    }
    return nodes;
};


const createRandomLinks = (json) => {
    console.log('creating random links');
    let array = json;
    array.map(x=> x.linkedId = []);
    let allNodeIdsOnly = array.map( x => x.id) ;
    let nbNodeLinked = Math.floor(array.length / 3);
    let nodeToBeLinked = randomValue(array, [], nbNodeLinked);

    nodeToBeLinked.map(n => n.linkedId = randomValue(array, [n], 20));
    // nodeToBeLinked.map(n => n.linkedId = randomValue(array, [n], 5));

    nodeToBeLinked.map(n => {
        let idsOnly = n.linkedId.map(x => x.id);
        n.linkedId = idsOnly;
    });
    console.log('stop creating random links');
    return array;
};


window.DataGenerator = {
    createRandomLinks,
    generateXNodes
};

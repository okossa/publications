// api
function createInteraction() {
    const fakeInteraction = {
        interactionID: Math.floor(Math.random() * 1000),
        itemID: Math.floor(Math.random() * 1000),
        content: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(fakeInteraction);
        }, 1000);
    });
}

module.exports = {
    createInteraction
};
function addToLocalStorage(key, item){
    localStorage.setItem(key, item);
}

function deleteFromLocalStorage(key){
    localStorage.removeItem(key);
}

function updateInLocalStorage(key, item){
    localStorage.setItem(key,item);
}

function getFromLocalStorage(key){
    return localStorage.getItem(key);
}

function getAllKeysFromLocalStorage(){
    var keys = [];
    for(var i = 0; i < localStorage.length; i++){
        keys.push(localStorage.key(i));
    }
    return keys;
}

function getTaskOrder(){
    var order = getFromLocalStorage("task-order");
    return order ? JSON.parse(order) : [];
}

function saveTaskOrder(order){
    addToLocalStorage("task-order", JSON.stringify(order));
}
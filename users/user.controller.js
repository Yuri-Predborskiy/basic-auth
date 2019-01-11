// in prod: separate controller into database layer (model) and logic controller (and, possibly, request handler)
const fs = require('fs');

const DATA_FILE_PATH = 'data/data.json';

// you may want to replace file read/write operations with database calls

// typically you'd want to send the error down the middleware chain
function getData() {
    if (!fs.existsSync(DATA_FILE_PATH)) {
        // create file if it doesn't exist
        fs.writeFileSync(DATA_FILE_PATH, '{}');
    }
    try {
        let rawData = fs.readFileSync(DATA_FILE_PATH);
        return JSON.parse(rawData);
    } catch(err) {
        console.error('error reading data from file...', err);
    }
    return null;
}

// typically you'd want to send the error down the middleware chain
function writeData(data) {
    if (!data) return;
    try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data));
        return true;
    } catch (err) {
        console.error('error writing new data to file...', err);
        return false;
    }
}

function getById(userId) {
    let data = getData();
    if (data[userId]) {
        return data[userId];
    } else {
        return null;
    }
}

function getAll() {
    return getData();
}

// todo: improvement - generate user ID dynamically (UUID) or use simple numeric index
function create(user) {
    let data = getData();
    if (data[user.id]) {
        return false;
    }
    // todo: hash password using bcrypt
    data[user.id] = {
        username: user.name,
        password: user.password // never save user password as plain text!
    };
    if (writeData(data)) {
        return true;
    } else {
        console.log('user creation failed');
        return false;
    }
}

// todo: add typical checks, like checking if username is not null
function updateById(user) {
    // a better way to handle this kind of call:
    // use callback here that accepts two parameters: error, result
    // if there is error, report to client
    // if there is no error but success is false, report to user about failure
    // if there is no error and success === true, report to user about success
    // callback should be handled in another file, this should only call callback with (err, result)
    let data = getData();
    if (!data[user.id]) {
        console.log(`failed to update user id ${userId}, user does not exist`);
        return false;
    }

    data[user.id].password = user.password;
    if (!writeData(data)) {
        console.log(`failed to write new user data for user id ${userId}`);
        return false;
    }
    return true;
}

// todo: add error description - what failed, or send error down the middleware string
function deleteById(userId) {
    let data = getData();
    if (data[userId]) {
        delete data[userId];
        if (!writeData(data)) {
            console.log(`failed to save data after deleting user id ${userId}`);
            return false;
        }
    }
    // if data doesn't contain userId, then result = desired result
    // potentially you want to handle this differently
    return true;
}

module.exports = {
    getById,
    getAll,
    create,
    updateById,
    deleteById,
};
// in prod: separate controller into database layer (model) and logic controller (and, possibly, request handler)
const fs = require('fs');

const DATA_FILE_PATH = 'data/data.json';

// todo: replace file read/write operations with mongodb calls

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
    } catch (err) {
        console.error('error writing new data to file...', err);
    }
}

function getById(req, res) {
    let data = getData();
    if (data[req.user]) {
        res.send(user);
    } else {
        res.status(404);
    }
}

function getAll(req, res) {
    let data = getData();
    res.send(JSON.stringify(data));
}

// todo: improvement - generate user ID dynamically (UUID) or use simple numeric index
function create(req, res) {
    let data = getData();
    let userId = req.body.username;
    if (data[userId]) {
        res.send('this user already exists!');
    } else {
        data[userId] = {
            username: userId, // username = user id
            password: req.body.password // never save user password as plain text!
        };
        writeData(data);
        res.send('success');
    }
}

// todo: add typical checks, like checking if username is not null
function updateById(req, res) {
    let data = getData();
    let userId = req.params.id;
    if (!data[userId]) {
        res.status(404);
    } else {
        // todo: add more fields to update, currently user name is fixed, only password can be changed
        data[userId] = {
            password: req.body.password
        };
        writeData(data);
        res.send('success');
    }
}

// todo: add error description - what failed, or send error down the middleware string
function deleteById(req, res) {
    let data = getData();
    let userId = req.body.username;
    if (!data[userId]) {
        res.status(404).send('this user does not exist');
    } else {
        delete data[userId];
        if (writeData()) {
            res.redirect('/auth');
        } else {
            console.log('failed to delete user', userId);
            res.send(`error deleting user ${userId}`);
        }
    }
}

module.exports = {
    getById,
    getAll,
    create,
    updateById,
    deleteById,
};
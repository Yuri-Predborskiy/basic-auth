// in prod: separate controller into database layer (model) and logic controller (and, possibly, request handler)
const fs = require('fs');
function getData() {
    try {
        let rawData = fs.readFileSync('./data.json');
        return JSON.parse(rawData);
    } catch(err) {
        console.error('error reading data from file...', err);
    }
    return null;
}

function writeData(data) {
    if (!data) return;
    try {
        fs.writeFileSync('./data.json', JSON.stringify(data));
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

function create(req, res) {
    let data = getData();
    let username = req.body.username;
    if (data[username]) {
        res.send('this user already exists!');
    } else {
        data[username] = {
            username: username, // username = user id
            password: req.body.password
        };
        writeData(data);
        res.send('success');
    }
}

function updateById(req, res) {
    let data = getData();
    let username = req.body.username;
    if (!data[username]) {
        res.status(404);
    } else {
        data[username] = {
            username: username, // username = user id
            password: req.body.password
        };
        writeData(data);
        res.send('success');
    }
}

function deleteById(req, res) {
    let data = getData();
    let username = req.body.username;
    if (!data[username]) {
        res.status(404);
    } else {
        delete data[username];
        res.send('success');
    }
}

module.exports = {
    getById,
    getAll,
    create,
    updateById,
    deleteById,
};
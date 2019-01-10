const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const userController = require('./users/user.controller');

const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

const secret = 'my dirty little secret';
const jwtMW = exjwt({
    secret
});

const logRequests = (req, res, next) => {
    console.info(`${req.method} ${req.originalUrl}`);
    next();
};

app.use(logRequests);
app.use(router);

router.get('/', (req, res) => {
    res.send('hello world!');
});

router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', userController.create);
router.post('/auth', (req, res) => {
    // authenticate user
});

// further paths require user to be authorized
router.use(jwtMW);
router.get('/user/all', userController.getAll);
router.get('/user/?id', userController.getById);
router.put('/user/?id', userController.updateById);
router.delete('/user/?id', userController.deleteById);

// error handler, dead end
router.use(function (err, req, res) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
    }
    else {
        // unexpected error
        console.error(err);
        res.status(500);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server live on localhost:${PORT}`);
});
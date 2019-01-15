require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('./api/auth.controller');
const userController = require('./users/user.controller');
const authRouter = require('./api/router');

const app = express();
// todo: move router into a separate file
const router = express.Router();
// const authRouter = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

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

// create - this route is not protected (otherwise nobody can register unless they're authenticated, which is a paradox
router.post('/register', (req, res) => {
    let user = userController.getById(req.body.username);
    // user should not exist
    if (user) {
        return res.send(`User ${user.username} already exists! Do you want to <a href=${req.protocol + '://' + req.get('host')}/auth>log in</a>?`);
    }

    user = {
        username: req.body.username,
        password: req.body.password
    };

    if (!userController.create(user)) {
        return res.send('User creation failed, contact webmaster for details');
    }
    return res.send(`User successfully created! You can now <a href=${req.protocol + '://' + req.get('host')}/auth>log in</a>`);
});

router.get('/auth', (req, res) => {
    res.render('auth');
});

// ideally you want to validate the parameters here, before moving on to controller
router.post('/auth', (req, res) => {
    // primitive validation
    if (!req.body || !req.body.username || !req.body.password) { return res.send('All fields are required!'); }

    let user = userController.getById(req.body.username);
    if (!user || user.password !== req.body.password) {
        return res.status(401).send(`Authorization failed, incorrect login/password`);
    }

    if (user.password === req.body.password) {
        const payload = { username: req.body.username };
        let token = jwt.sign(payload, process.env.AUTH_SECRET, {
            expiresIn : 24*60*60 // 24 hours
        });

        res.json({
            success: true,
            message: 'Token successfully created',
            token: token
        });
    }
});

// further paths require user to be authorized
app.use('/users', authenticateUser, authRouter);

// error handler, dead end - no next
app.use(function (err, req, res, next) {
    // if (err.name === '')
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('User is not authorized');
    }
    else {
        console.error(err);
        res.status(404).send('This page does not exist');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server live at http://${process.env.HOST}:${process.env.PORT}`);
});
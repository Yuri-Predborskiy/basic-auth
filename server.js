const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const userController = require('./users/user.controller');

const app = express();
// todo: move router into a separate file
const router = express.Router();
// todo: move authRouter into a separate file
const authRouter = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

const secret = 'my dirty little secret';

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

// ideally you want to validate the parameters here, before moving on to controller
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

    let success = userController.create(user);
    if (success) {
        res.send(`User successfully created! You can now <a href=${req.protocol + '://' + req.get('host')}/auth>log in</a>`);
    } else {
        res.send('User creation failed, contact webmaster for details');
    }
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
        let token = jwt.sign(payload, secret, {
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
app.use('/users', authRouter);
// todo: check if authentication token is valid
authRouter.get('/all', (req, res) => {
    res.json(userController.getAll());
});
authRouter.get('/id/:id', (req, res) => {
    if (!req.params.id) { return res.send({}); }
    let user = userController.getById(req.params.id);
    // strip fields you don't want to show
    delete user.password;
    res.send(user);
});
authRouter.put('/', (req, res) => {
    let user = {
        username: req.body.username,
        password: req.body.password
    };
    let success = userController.updateById(user);
    return res.json({ success });
});
authRouter.delete('/:userId', (req, res) => {
    let success = userController.deleteById(req.params.userId);
    res.json({ success });
});

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server live on localhost:${PORT}`);
});
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
    let user = userController.getById(req.body.username);
    if (!user) {
        res.status(404).send(`User ${req.body.username} not found. Would you like to /register ?`);
    }

    if (user.password === req.body.password) {
        const payload = { username: req.body.username };
        let token = jwt.sign(payload, secret, {
            expiresInMinutes: 1440 // expires in 24 hours
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
router.get('/users/all', userController.getAll);
router.get('/users/id/:id', userController.getById);
router.put('/users/id/:id', userController.updateById);
router.delete('/users/id/:id', userController.deleteById);

// error handler, dead end - no next
app.use(function (err, req, res) {
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
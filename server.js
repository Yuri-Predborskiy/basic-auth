const express = require('express');
const bodyParser = require('body-parser');
//const jwt = require('jsonwebtoken');

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
router.post('/register', userController.create);

router.get('/auth', (req, res) => {
    res.render('auth');
});
// ideally you want to validate the parameters here, before moving on to controller
router.post('/auth', (req, res) => {
    // todo: authenticate user, if user is correct, redirect to users/id/:id
});

// further paths require user to be authorized
app.use('/users', authRouter);
router.get('/users/all', userController.getAll);
router.get('/users/id/:id', userController.getById);
router.put('/users/id/:id', userController.updateById);
router.delete('/users/id/:id', userController.deleteById);

// error handler, dead end
app.use(function (err, req, res, next) {
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
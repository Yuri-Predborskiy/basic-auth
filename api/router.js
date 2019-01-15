// protected api routes, require authentication

// read one
authRouter.get('/all', (req, res) => {
    res.json(userController.getAll());
});

// read all
authRouter.get('/id/:id', (req, res) => {
    if (!req.params.id) { return res.send({}); }
    let user = userController.getById(req.params.id);
    // strip fields you don't want to show
    delete user.password;
    res.send(user);
});

// update
authRouter.put('/', (req, res) => {
    let user = {
        username: req.body.username,
        password: req.body.password
    };
    let success = userController.updateById(user);
    return res.json({ success });
});

// delete
authRouter.delete('/:userId', (req, res) => {
    let success = userController.deleteById(req.params.userId);
    res.json({ success });
});
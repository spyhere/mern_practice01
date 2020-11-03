const {Router} = require('express');
const { check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const router = Router();

// api/auth/register
router.post(
    '/register',
    [ 
        check('email', 'wrong email').isEmail(),
        check('password', 'minimum 6 symbols for password').isLength({min: 6})
    ],
 async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "invalid registration data"
            })
        }

        const { email, password } = req.body;

        const candidate = await User.findOne({ email });

        if (candidate) return res.status(400).json({ message: "User with such email is already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ email, password: hashedPassword });

        await user.save();

        res.status(201).json({ message: "New user has been created" });

    } catch(e) {
        console.error(e)
        res.status(500).json({ message: `There is an error: ${e}`})
    }
})

router.post(
    '/login',
    [
        check('email', 'put correct email').normalizeEmail().isEmail(),
        check('password', 'this is wrong password').exists()

    ],
     async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "invalid registration data"
            })
        }

        try {

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: "No such user found"});

            const isMatch = bcrypt.compare(password, user.password);

            if (!isMatch) return res.status(400).json({ message: "incorrect password" });

            const token = jwt.sign(
                { userId: user.id},
                config.get("jwtSecret"),
                { expiresIn: "1h"}
            )

            res.json({ token, userId: user.id });

        } catch(e) {
            console.error(e)
            res.status(500).json({ message: `There is an error: ${e}`})
        }

})

module.exports = router;
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const maxAge = 3 * 24 * 60 * 60 * 1000 // 3 days

router.post('/register', async (req, res, next) => {
    try{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        //console.log(req.body)

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })

        const result = await user.save()

        const {password, ...data} = await result.toJSON()

        res.status(200).send(data)
    }catch(err) {
        console.log(err)
        next(err)
    }
})

router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const user = await User.findOne({email: req.body.email})

        if (!user) {
            return res.status(200).send({
                message: 'user not found'
            })
        }
    
        if (!await bcrypt.compare(req.body.password, user.password)) {
            return res.status(200).send({
                message: 'invalid credentials'
            })
        }
    
        const token = jwt.sign({_id: user._id}, "secret")
    
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
    
        res.send({
            message: 'success'
        })
    } catch(err) {
        next(err)
    }
})

router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt']

        const claims = jwt.verify(cookie, 'secret')

        if (!claims) {
            return res.status(401).send({
                message: 'unauthenticated'
            })
        }

        const user = await User.findOne({_id: claims._id})

        const {password, ...data} = await user.toJSON()

        res.send(data)
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        })
    }
})

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'success'
    })
})

module.exports = router;

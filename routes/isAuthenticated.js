const router = require('express').Router()
/* const db = require('../models/db') */


router.get('/candidate', (req, res, next) => {
    try {
        const token = req.cookies.jui

        res.json({ authenticated: token? true : false })
    } catch (e) {
        console.log(e)
        res.json({ authenticated: false, message: e.message })
    }
})
 

module.exports = router;
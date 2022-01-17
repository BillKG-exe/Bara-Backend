const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid'); 
const multer = require('multer')
const db = require('../models/db')
const { listToString } = require('../models/helperMethods')
 

const maxAge = 3 * 24 * 60 * 60 * 1000 


const multerConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/company/')
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1]
        const imageName = `${uuidv4()}.${ext}`

        const db_queries = db.getDbQueriesInstance() 
        
        const payload = jwt.verify(req.cookies.eui, 'secret')

        db_queries.setCompanyIcon(payload.employerId, imageName)

        callback(null, imageName)
    }
})

const upload = multer({ storage: multerConfig })


router.post('/register', async (req, res, next) => {
    try {
        const { companyName, employerName, employerTitle, email, password } = req.body

        const dbq = db.getDbQueriesInstance()

        /* const valid = await dbq.verifyEmployerEmail(email)

        console.log(valid)

        if(!valid) {
            res.json({success: false, message: 'The email entered already exits'})
        } else */ 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const result = await dbq.createEmployer(companyName, employerName, employerTitle, email, hashedPassword) 

        res.json({success: true, message: "Account created successfully"})
        

    } catch(e) {
        console.log(e)
        res.json({success: false, message: "Account creation was unsuccessful"})
    }
})

router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        
        const { email, password } = req.body

        const dbq = db.getDbQueriesInstance()
        const credentials = await dbq.authenticateEmployer(email)

        const authenticated = await bcrypt.compare(password, credentials.employerPassword)

        if(authenticated) {
            const token = jwt.sign({employerId: credentials.employerId}, "secret")

            res.cookie('eui', token, { httpOnly: true, maxAge: maxAge })
            
            res.json({success: authenticated, message: 'User logged successfully'})
        } else {
            res.json({success: authenticated, message: 'Invalid email or password'})
        }

    } catch (e) {
        console.log(e.message)
    }
})

router.get('/profile', async (req, res) => {
    try {
        const cookieToken = req.cookies.eui

        if(cookieToken) {
            const payload = jwt.verify(cookieToken, 'secret')

            const db_queries = db.getDbQueriesInstance()
            const profileData = await db_queries.getEmployerProfile(payload.employerId)

            res.json({ success: true, authenticated: true, message: 'user is authenticated', profile: profileData })

        } else {
            res.json({ success: false, authenticated: false, message: 'user is not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.post('/profile', async (req, res) => {
    try {
        const cookieToken = req.cookies.eui

        if(cookieToken) {
            const payload = jwt.verify(cookieToken, 'secret')

            const db_queries = db.getDbQueriesInstance()
            const result = await db_queries.updateEmployerProfile(payload.employerId, req.body)

            res.json({ success: true, authenticated: true, message: 'profile was updated successfully' })

        } else {
            res.json({ success: false, authenticated: false, message: 'user is not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})


router.post('/post', async (req, res) => {
    try {
        const cookieToken = req.cookies.eui
         

        if(cookieToken) {
            const payload = jwt.verify(cookieToken, 'secret')

            const db_queries = db.getDbQueriesInstance()
            
            const data = await db_queries.getEmployerCompanyName(payload.employerId)
            const result = await db_queries.postJob(payload.employerId, data.employerCompanyName, data.employerCompanyLogo, req.body)


            const jobId = await db_queries.getJobId(payload.employerId)

            console.log(req.body, "\n", jobId)

            const { description, qualifications, experience } = req.body

            
            const quals = listToString(qualifications)
            const exps = listToString(experience)

            const response = await db_queries.setJobDescription(jobId, description, quals, exps)

            res.json({ success: true, authenticated: true, message: 'profile was updated successfully' })

        } else {
            res.json({ success: false, authenticated: false, message: 'user is not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.post('/upload/icon', upload.single('icon'), async (req, res) => {
    try {
        const cookieToken = req.cookies.eui

        if(cookieToken) {
            res.json({ success: true, authenticated: true, message: 'image uploaded successfully' })
        } else {
            res.json({ success: false, authenticated: false, message: 'the image upload was unsuccessful' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/icon', async (req, res) => {
    try {
        const cookieToken = req.cookies.eui

        if(cookieToken) {
            const payload = jwt.verify(cookieToken, 'secret')

            const queries = db.getDbQueriesInstance()
            
            const imageName = await queries.getCompanyIcon(payload.employerId)

            res.json({ success: true, authenticated: true, image: imageName, message: 'image uploaded successfully' })
        } else {
            res.json({ success: false, authenticated: false, message: 'the image upload was unsuccessful' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/candidates', async (req, res) => {
    try {
        const cookieToken = req.cookies.eui

        if(cookieToken) {
            const payload = jwt.verify(cookieToken, 'secret')

            const db_queries = db.getDbQueriesInstance()
            const result = await db_queries.getCandidates(payload.employerId)

            res.json({ success: true, authenticated: true, message: 'list of candidates', list: result })

        } else {
            res.json({ success: false, authenticated: false, message: 'user is not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/:candidateId', async (req, res) => {
    try {
        const token = req.cookies.eui
        const { candidateId } = req.params
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const userInfo = await dbq.getCandidate(candidateId)

        res.json({ success: true, authenticated: true, user: userInfo})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/:candidateId/education', async (req, res) => {
    try {
        const token = req.cookies.eui
        const { candidateId } = req.params
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const educations = await dbq.getCandidateEducations(candidateId)

        res.json({ success: true, list: educations})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/:candidateId/experience', async (req, res) => {
    try {
        const token = req.cookies.eui
        const { candidateId } = req.params
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const experiences = await dbq.getCandidateExperiences(candidateId)

        res.json({ success: true, list: experiences})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/:candidateId/projects', async (req, res) => {
    try {
        const token = req.cookies.eui
        const { candidateId } = req.params
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const projects = await dbq.getCandidateProjects(candidateId)

        res.json({ success: true, list: projects})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/:candidateId/skills', async (req, res) => {
    try {
        const token = req.cookies.eui
        const { candidateId } = req.params
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const skills = await dbq.getCandidateSkills(candidateId)

        res.json({ success: true, list: skills})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/authenticated', (req, res) => {
    try {
        const token = req.cookies.eui

        if(token) {
            res.json({ authenticated: true, message: 'user is authenticated'})
        } else {
            res.json({ authenticated: false, message: 'user is not authenticated' })
        }
        
    } catch (e) {
        res.json({ authenticated: false, message: e.message })
    }
})

router.get('/logout', (req, res) => {
    try {
        res.cookie('eui', '', {maxAge: 0})

        res.json({ success: true, authenticated: false, message: 'user logged out successfully'})

    } catch (e) {
        res.json({ success: false, authenticated: true, message: 'ERROR: the user was not looged out'})
    }
})

module.exports = router;
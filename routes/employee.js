const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid'); 
const multer = require('multer')
const db = require('../models/db')

const maxAge = 3 * 24 * 60 * 60 * 1000 


const multerConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/candidates/')
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1]
        const imageName = `${uuidv4()}.${ext}`

        const db_queries = db.getDbQueriesInstance() 
        
        const payload = jwt.verify(req.cookies.jui, 'secret')

        db_queries.setCandidatePicture(payload.candidateId, imageName)

        callback(null, imageName)
    }
})

const upload = multer({ storage: multerConfig })


router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        
        const payload = jwt.verify(password, 'secret')


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(payload.password, salt)


        const dbq = db.getDbQueriesInstance()
        const result = dbq.createCandidate(name, email, hashedPassword) 
        
        res.json({success: true, message: "Account created successfully"})

    } catch(e) {
        console.log(e)
        res.json({success: false, message: e})
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const payload = jwt.verify(password, 'secret')

        const dbq = db.getDbQueriesInstance()
        const cred = await dbq.authenticateCandidate(email)
        
        const authenticated = await bcrypt.compare(payload.password, cred.candidatePassword)

        if(authenticated) {
            const token = jwt.sign({candidateId: cred.candidateId}, "secret")
            res.cookie('jui', token, { httpOnly: true, maxAge: maxAge }) // 3 day

            res.json({success: authenticated, message: 'User logged in successfully'})
        } else {
            res.json({success: authenticated, message: 'Invalid email or password'})
        }

    } catch(e) {
        console.log(e)
        res.json({success: false, message: e.message})
    }
})

router.post('/update', (req, res) => {
    try {
        const token = req.cookies.jui

        const payload = jwt.verify(token, 'secret')

        const dbq = db.getDbQueriesInstance()
        /* const result = dbq.updateCandidateInformation(payload.candidateId, req.body.userInfo) */
       
        const educationList = req.body.educationList
        const experienceList = req.body.experienceList
        const projectsList = req.body.projectsList
        const skills = req.body.skillsList


        for(var i = 0; i < educationList.length; i++) {
            const result = dbq.updateCandidateEducation(payload.candidateId, educationList[i].id, educationList[i])
        }

        for(var i = 0; i < experienceList.length; i++) {
            const result = dbq.updateCandidateExperience(payload.candidateId, experienceList[i].id, experienceList[i])
        }

        for(var i = 0; i < projectsList.length; i++) {
            const result = dbq.updateCandidateProjects(payload.candidateId, projectsList[i].id, projectsList[i])
        }
       
        const result = dbq.updateCandidateSkills(payload.candidateId, skills.id, skills.skillSet)
        
        res.json({ success: true, message: 'none' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})


router.get('/profile', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const userInfo = await dbq.getCandidate(payload.candidateId)
        const educations = await dbq.getCandidateEducations(payload.candidateId)
        const experiences = await dbq.getCandidateExperiences(payload.candidateId)
        const projects = await dbq.getCandidateProjects(payload.candidateId)
        const skills = await dbq.getCandidateSkills(payload.candidateId)

        const data = {
            user: userInfo,
            educations: educations,
            experiences: experiences,
            projects: projects,
            skills: skills
        }

        res.json({ success: true, authenticated: true, userData: data})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }

})

router.get('/user', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const userInfo = await dbq.getCandidate(payload.candidateId)

        res.json({ success: true, authenticated: true, user: userInfo})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/upload/picture', upload.single('picture'), async (req, res) => {
    try {
        const cookieToken = req.cookies.jui

        if(cookieToken) {
            res.json({ success: true, authenticated: true, message: 'image uploaded successfully' })
        } else {
            res.json({ success: false, authenticated: false, message: 'the image upload was unsuccessful' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/education', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const educations = await dbq.getCandidateEducations(payload.candidateId)

        res.json({ success: true, list: educations})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/experience', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const experiences = await dbq.getCandidateExperiences(payload.candidateId)

        res.json({ success: true, list: experiences})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/projects', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const projects = await dbq.getCandidateProjects(payload.candidateId)

        res.json({ success: true, list: projects})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/skills', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()

        const skills = await dbq.getCandidateSkills(payload.candidateId)

        res.json({ success: true, list: skills})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/education/:id', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { id } = req.params

        const dbq = db.getDbQueriesInstance()

        const result = await dbq.getEducation(id)

        res.json({ success: true, education: result})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/experience/:id', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { id } = req.params

        const dbq = db.getDbQueriesInstance()

        const result = await dbq.getExperience(id)

        res.json({ success: true, result: result})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/project/:id', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { id } = req.params

        const dbq = db.getDbQueriesInstance()

        const result = await dbq.getProject(id)

        res.json({ success: true, result: result})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/update/info', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()
        const result = dbq.updateCandidateInformation(payload.candidateId, req.body)

        if(result.valid && result.valid === false) {
            res.json({ success: false, message: result.message })
        }

        res.json({ success: true })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/update/education/:educationId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { educationId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.updateEducation(educationId, req.body)

        res.json({ success: true, message: 'Section updated successfully'})
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/update/experience/:workId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { workId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.updateExperience(workId, req.body)

        res.json({ success: true, message: 'Section updated successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/update/project/:projectId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const { projectId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.updateExperience(projectId, req.body)

        res.json({ success: true, message: 'Section updated successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/update/skills', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }



        res.json({ success: true, })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/add/education', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()
        const result = dbq.addEducation(payload.candidateId, req.body)

        res.json({ success: true, message: 'Section added successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/add/experience', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()
        const result = dbq.addExperience(payload.candidateId, req.body)

        res.json({ success: true, message: 'Section added successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.post('/add/project', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, message: 'user not authenticated' })
        }

        const dbq = db.getDbQueriesInstance()
        const result = dbq.addProject(payload.candidateId, req.body)

        res.json({ success: true, message: 'Section added successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/delete/education/:educationId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const { educationId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.deleteEducation(educationId)

        res.json({ success: true, message: 'Section deleted successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/delete/experience/:workId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const { workId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.deleteExperience(workId)

        res.json({ success: true, message: 'Section deleted successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/delete/project/:projectId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const payload = jwt.verify(token, 'secret')

        if(!token) {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }

        const { projectId } = req.params

        const dbq = db.getDbQueriesInstance()
        const result = dbq.deleteProject(projectId)

        res.json({ success: true, message: 'Section deleted successfully' })
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/jobs', async (req, res) => {
    try {
        const token = req.cookies.jui

        if(token) {            
            const dbq = db.getDbQueriesInstance()

            const jobList = await dbq.getListOfJobs()

            res.json({ success: true, authenticated: true, jobs: jobList, message: 'Loaded successfully' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }     
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/jobs/:jobId', async (req, res) => {
    try {
        /* const token = req.cookies.jui */
                   
        const { jobId } = req.params

        const dbq = db.getDbQueriesInstance()

        const result = await dbq.getDecription(jobId)

        res.json({ success: true, job: result, message: 'Loaded successfully' })
            
    } catch (e) {
        res.json({ sucess: false, message: e.message })
    }
})

router.get('/likes/:jobId/:like', async (req, res) => {
    try {
        const token = req.cookies.jui
        const { jobId, like } = req.params

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const likes = await queries.getLikes(jobId)

            if(!likes || likes === 0) {
                const result = await queries.updateLikes(jobId, 1) 
            } else {
                const total = likes + parseInt(like)
                const result = await queries.updateLikes(jobId, total)
            }

            const exists = await queries.employeeJobExist(jobId)

            if(exists) {
                queries.updateFavoriteJob(jobId, parseInt(like) === 1? 1 : 0)
            } else {
                const employerId = queries.getEmployerId(jobId)
                queries.addFavoriteJob(jobId, payload.candidateId, employerId)
            }

            res.json({ success: true, authenticated: true, message: 'like updated successfully' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/likes', async (req, res) => {
    try {
        const token = req.cookies.jui
        var jobs = []

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const result = await queries.getFavoriteJob(payload.candidateId)

            for(var i in result) {
                const data = await queries.getDecription(result[i].jobId)
                const job = {...data, date: result[i].createdAt}
                jobs.push(job)
            }

            res.json({ success: true, authenticated: true, favorites: jobs, message: 'list' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/liked/:jobId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const { jobId } = req.params

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const result = await queries.isLikedJob(jobId, payload.candidateId)

            res.json({ success: true, authenticated: true, liked: result, message: 'Job liked status' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/applications', async (req, res) => {
    try {
        const token = req.cookies.jui
        var jobs = []

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const result = await queries.getAppliedJob(payload.candidateId)

            for(var i in result) {
                const data = await queries.getDecription(result[i].jobId)
                const job = {...data, date: result[i].createdAt}
                jobs.push(job)
            }

            res.json({ success: true, authenticated: true, applied: jobs, message: 'applied jobs list' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/application/status/:jobId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const { jobId } = req.params

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const result = await queries.hasApplied(jobId, payload.candidateId)

            res.json({ success: true, authenticated: true, status: result.status, message: 'applied jobs list' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/add/application/:jobId', async (req, res) => {
    try {
        const token = req.cookies.jui
        const { jobId } = req.params

        if(token) {
            const payload = jwt.verify(token, 'secret')

            const queries = await db.getDbQueriesInstance()

            const applied = await queries.hasApplied(jobId, payload.candidateId)

            if(!applied.status && applied.length === 0) {
                const employerId = await queries.getEmployerId(jobId)
                const result = await queries.addAppliedJob(jobId, payload.candidateId, employerId)
            } else {
                const result = await queries.updateAppliedJob(jobId, payload.candidateId)
            }

            res.json({ success: true, authenticated: true, applied: 'result', message: 'applied status updated' })
        } else {
            res.json({ success: false, authenticated: false, message: 'user not authenticated' })
        }
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
})

router.get('/logout', (req, res) => {
    try {
        res.cookie('jui', '', {maxAge: 0})
        res.send({ success: true })
    } catch(e) {
        res.send({ success: false, message: e.message })
    }
})

module.exports = router;
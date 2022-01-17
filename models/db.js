const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

let instance = null

const connection  = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT 
})

connection.connect(err => {
    if(err) console.log(err)
    
    console.log('DB:', connection.state)
})

class DbQueries {
    static getDbQueriesInstance () {
        return instance? instance : new DbQueries() 
    }

    async createCandidate (name, email, password) {
        try {
            //
            //Look for existing email first
            //
            
            const createdAt = new Date()
            
            const query = 'INSERT INTO candidate (candidateName, candidateEmail, candidatePassword, dateOfCreatedAccount) VALUES (?, ?, ?, ?)'

            connection.query(query, [name, email, password, createdAt], (err, results) => {
                if(err) throw err
                return results
            })
        } catch (e) {
            console.log(e)
        }
    }

    async authenticateCandidate (email) {
        try {
            const auth = await new Promise((resolve, reject) => {
                const query = 'SELECT candidateId, candidatePassword FROM candidate WHERE candidateEmail = ?'

                connection.query(query, [email], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results.length === 0? 0 : results[0])
                })
            })
            return auth
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateCandidateInformation (id, { name, email, phone, introduction }) {
        try {
            /* const isPasswordEmpty = !payload.oldPassword && !payload2.newPassword */

            const query = `UPDATE candidate SET candidatePicture = ?, candidateName = ?, candidateEmail = ?, 
                candidatePhone = ?, introduction = ? WHERE candidateId = ?`
            
            const update = await new Promise((resolve, reject) => {
                connection.query(query, [email, name, email, phone, introduction, id], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            return update
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /* Update skills or insert skills */
    async updateCandidateSkills (candidateId, skillsId, data) {
        try {
            const query1 = `INSERT INTO skill (candidateId, listOfSkills) VALUES(?, ?)`
            const query2 = `UPDATE skill SET listOfSkills = ? WHERE candidateId = ?`
            
            const update = await new Promise((resolve, reject) => {
                connection.query(skillsId < 0? query1 : query2, skillsId < 0? [candidateId, data] : [data, candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return update
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /* Getters function to retrive data on user, education, work experience and project as well as skills */
    async getCandidate (candidateId) {
        try {
            const query = `SELECT * FROM candidate WHERE candidateId = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCandidateEducations (candidateId) {
        try {
            const query = `SELECT * FROM education WHERE candidatecandidateID = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCandidateExperiences (candidateId) {
        try {
            const query = `SELECT * FROM workexperience WHERE candidatecandidateID = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCandidateProjects (candidateId) {
        try {
            const query = `SELECT * FROM project WHERE candidatecandidateID = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCandidateSkills (candidateId) {
        try {
            const query = `SELECT * FROM skill WHERE candidateId = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /* Getters functions to access a specific data with unique id */
    async getEducation (educationId) {
        try {
            const query = `SELECT * FROM education WHERE educationId = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [educationId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getExperience (workId) {
        try {
            const query = `SELECT * FROM workexperience WHERE workId = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [workId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getProject (projectId) {
        try {
            const query = `SELECT * FROM project WHERE projectId = ?`
            
            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [projectId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /*  Update a specific data with unique id */
    async updateEducation (educationId, data) {
        try {
            const { schoolName, degreeEarned, major, location, startingDate, endingDate } = data
            const query = `UPDATE education SET schoolName = ?, degreeEarned = ?, major = ?, location = ?, startingDate = ?, endingDate = ? WHERE educationId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [schoolName, degreeEarned, major, location, startingDate, endingDate, educationId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateExperience (workId, data) {
        try {
            const { companyName, jobTitle, location, startingDate, endingDate, description } = data
            const query = `UPDATE workexperience SET companyName = ?, jobTitle = ?, location = ?, startingDate = ?, endingDate = ?, description = ? WHERE workId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [companyName, jobTitle, location, startingDate, endingDate, description, workId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateProject (projectId, data) {
        try {
            const { projectName, jobTitle, location, startingDate, endingDate, description } = data
            
            const query = `UPDATE project SET projectName = ?, jobTitle = ?, location = ?, startingDate = ?, endingDate = ?, description = ? WHERE projectId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [projectName, jobTitle, location, startingDate, endingDate, description, projectId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /* Add a section to table: education, workexperience and projects */
    async addEducation (candidateId, data) {
        try {
            const { schoolName, degreeEarned, major, location, startingDate, endingDate } = data

            const query = `INSERT INTO education (candidatecandidateId, schoolName, degreeEarned, major, location, startingDate, endingDate) VALUES (?, ?, ?, ?, ?, ?, ?)`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId, schoolName, degreeEarned, major, location, startingDate, endingDate], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async addExperience (candidateId, data) {
        try {
            const { companyName, jobTitle, location, startingDate, endingDate, description } = data
            
            const query = `INSERT INTO workexperience (candidatecandidateId, companyName, jobTitle, location, startingDate, endingDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId, companyName, jobTitle, location, startingDate, endingDate, description], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async addProject (candidateId, data) {
        try {
            const { projectName, jobTitle, location, startingDate, endingDate, description } = data
            
            const query = `INSERT INTO project (candidatecandidateId, projectName, jobTitle, location, startingDate, endingDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [candidateId, projectName, jobTitle, location, startingDate, endingDate, description], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async deleteEducation (educationId) {
        try {            
            const query = `DELETE FROM education WHERE educationId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [educationId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async deleteExperience (workId) {
        try {            
            const query = `DELETE FROM workexperience WHERE workId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [workId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async deleteProject (projectId) {
        try {            
            const query = `DELETE FROM project WHERE projectId = ?`

            const getData = await new Promise((resolve, reject) => {
                connection.query(query, [projectId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return getData
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /* ****************************************************************** */
    /* This section below is reservered for queries in Employers database */
    /* ****************************************************************** */

    async verifyEmployerEmail (email) {
        connection.query('SELECT employerEmail FROM employer WHERE employerEmail = ? ', [email], (err, results) => {
            if(err) throw err
            return results.length === 0
        })
    }

    async createEmployer (companyName, employerName, employerTitle, email, password) {
        try {
            const createdAt = new Date()
             
            const query = 'INSERT INTO employer (employerCompanyName, employerName, employerJobTitle, employerEmail, employerPassword, createdAt) VALUES (?, ?, ?, ?, ?, ?)'

            connection.query(query, [companyName, employerName, employerTitle, email, password, createdAt], (err, results) => {
                if(err) throw err
                return { valid: true, results: results }
            })
        } catch (e) {
            console.log(e)
        }
    }

    async authenticateEmployer (email) {
        try {
            const auth = await new Promise((resolve, reject) => {
                const query = 'SELECT employerId, employerPassword FROM employer WHERE employerEmail = ?'

                connection.query(query, [email], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results.length === 0? 0 : results[0])
                })
            })
            return auth
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getEmployerProfile (employerId) {
        try {
            const data = await new Promise((resolve, reject) => {
                const query = 'SELECT employerCompanyName, employerName, employerJobTitle, employerEmail, employerAbout FROM employer WHERE employerId = ?'

                connection.query(query, [employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })
            return data
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateEmployerProfile (employerId, updatedData) {
        try {
            const { companyName, title, name, email, address, city, country, about, currentPassword, newPassword } = updatedData

            const data = await new Promise((resolve, reject) => {
                const query = `UPDATE employer SET employerCompanyName = ?, employerName = ?,
                                            employerJobTitle = ?, employerEmail = ?, employerAbout = ? WHERE employerId = ?`

                connection.query(query, [companyName, name, title, email, about, employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            return data
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getEmployerCompanyName (employerId) {
        try {
            const data = await new Promise((resolve, reject) => {
                const query = `SELECT employerCompanyName, employerCompanyLogo FROM employer WHERE employerId = ?`

                connection.query(query, [employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    console.log(results[0])
                    resolve(results[0])
                })
            })
            return data
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async postJob (employerId, companyName, companyLogo, data) {
        try {
            const { title, jobType, address, city, country, degree, salary } = data

            const response = await new Promise((resolve, reject) => {
                const createdAt = new Date()

                const query = `INSERT INTO job (companyName, companyLogo, jobTitle, jobType, jobSalary, degree, 
                                    dateOfJobPosted, address, city, country, employerId) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

                const list = [companyName, companyLogo, title, jobType, salary, degree, createdAt, address, city, country, employerId]

                connection.query(query, list, async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            
            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getJobId (employerId) {
        try {
            const response = await new Promise((resolve, reject) => {

                const query = `SELECT jobID FROM job WHERE employerId = ?`

                connection.query(query, [employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[results.length - 1].jobID)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async setJobDescription (jobId, description, qualifications, experience) {
        try {
            const response = await new Promise((resolve, reject) => {

                const query = `INSERT INTO jobdescription (jobID, description, qualification, experience) VALUES(?, ?, ?, ?)`

                connection.query(query, [jobId, description, qualifications, experience], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async setCandidatePicture (candidateId, imageName) {
        try {
            const response = await new Promise((resolve, reject) => {

                const query = `UPDATE candidate SET candidatePicture = ? WHERE candidateID = ?`

                connection.query(query, [imageName, candidateId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async setCompanyIcon (employerId, imageName) {
        try {
            const response = await new Promise((resolve, reject) => {

                const query = `UPDATE employer SET employerCompanyLogo = ? WHERE employerId = ?`

                connection.query(query, [imageName, employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCompanyIcon (employerId) {
        try {
            const response = await new Promise((resolve, reject) => {

                const query = `SELECT employerCompanyLogo FROM employer WHERE employerId = ?`

                connection.query(query, [employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0].employerCompanyLogo)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getListOfJobs () {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM job`

                connection.query(query, async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getDecription (jobId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT job.companyName, job.companyLogo, job.jobTitle, job.jobType, job.jobSalary, job.city, job.country, job.dateOfJobPosted, jobdescription.* FROM job 
                    INNER JOIN jobdescription ON job.jobID = jobdescription.jobID
                    WHERE job.jobID = ?
                `

                connection.query(query, [jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0])
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getEmployerId (jobId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT employerId FROM job WHERE jobID = ?`

                connection.query(query, [jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0].employerId)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getLikes (jobId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT likes FROM job WHERE jobID = ?`

                connection.query(query, [jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results[0].likes)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateLikes (jobId, likes) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `UPDATE job SET likes = ? WHERE jobID = ?`

                connection.query(query, [likes, jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async employeeJobExist (jobId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT jobId FROM employeejobs WHERE jobID = ?`

                connection.query(query, [jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results.length !== 0)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async addFavoriteJob (jobId, employeeId, employerId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `INSERT INTO employeejobs (jobId, employeeId, favorite, employerId) VALUES(?, ?, ?)`

                connection.query(query, [jobId, employeeId, employerId, 1], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateFavoriteJob (jobId, liked) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `UPDATE employeejobs SET favorite = ? WHERE jobId = ?`

                connection.query(query, [liked, jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getFavoriteJob (candidateId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT jobId, createdAt FROM employeejobs WHERE employeeId = ? AND favorite = ?`

                connection.query(query, [candidateId, 1], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async isLikedJob (jobId, candidateId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT favorite FROM employeejobs WHERE employeeId = ? AND jobId = ?`

                connection.query(query, [candidateId, jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    if(results.length !== 0) resolve(results[0].favorite === 1)
                    else { resolve(false) }
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async hasApplied (jobId, candidateId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT applied FROM employeejobs WHERE employeeId = ? AND jobId = ?`

                connection.query(query, [candidateId, jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    if(results.length !== 0) resolve({status: results[0].applied === 1, length: results.length})
                    else { resolve({status: false, length: results.length}) }
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async addAppliedJob (jobId, employeeId, employerId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `INSERT INTO employeejobs (jobId, employeeId, applied, employerId) VALUES(?, ?, ?)`

                connection.query(query, [jobId, employeeId, employerId, 1], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async updateAppliedJob (jobId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `UPDATE employeejobs SET applied = ? WHERE jobId = ?`

                connection.query(query, [1, jobId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getAppliedJob (candidateId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM employeejobs WHERE employeeId = ? AND applied = ?`

                connection.query(query, [candidateId, 1], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getCandidates (employerId) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM employeejobs WHERE employerId = ?`

                connection.query(query, [employerId], async (err, results) => {
                    if(err) reject(new Error(err.message))
                    resolve(results)
                })
            })

            return response
        } catch (e) {
            console.log(e)
            return false
        }
    }

}

module.exports = DbQueries
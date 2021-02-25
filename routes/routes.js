'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const { authenticateUser } = require('../middleware/auth-user');
const { User, Course } = require('../models');

// ------------------------------------------
// EXPRESS ROUTER CONSCTRUCTOR
// ------------------------------------------
const router = express.Router();

// ------------------------------------------
// ↓↓↓↓↓↓↓↓↓↓ USERS ROUTES ↓↓↓↓↓↓↓↓↓↓
// ROUTE 1 : USERS GET /api/users 200
// Returns the currently authenticated user.
// ------------------------------------------

router.get('/users', authenticateUser, async (req, res) => {
    const user = req.currentUser;
    res.json({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        emailAddress: user.emailAddress,
    });
});

// ------------------------------------------
// ROUTE 2 : USERS POST /api/users 201 
// Creates a user, sets the Location header to "/", and returns no content.
// ------------------------------------------
router.post('/users', async (req, res, next) => {
    try {
        await User.create(req.body);

        res.location("/");
        res.status(201).end();
    } catch (err) {
        console.log("ERROR: ", err.name);

        if (
            err.name === "SequelizeValidationError" ||
            err.name === "SequelizeUniqueConstraintError"
        ) {
            const errors = err.errors.map((err) => err.message);
            res.status(400).json({ errors });
        } else {
            throw err;
        }
    }
});


// ------------------------------------------
// ↓↓↓↓↓↓↓↓↓↓ COURSES ROUTE ↓↓↓↓↓↓↓↓↓↓
// ROUTE 1 : GET /api/courses 200
// Returns a list of courses (including the user that owns each course).
// ------------------------------------------
router.get('/courses', async (req, res) => {
    try {

        const courses = await Course.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'emailAddress']
            }
        });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------
// ROUTE 2 : GET /api/courses/:id 200
// Returns the course (including the user that owns the course) for the provided course ID.
// ------------------------------------------
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        const user = await User.findByPk(course.userId);
        if (course) {
            res.status(200).json({ course: course, user: user.dataValues });
        } else {
            res.status(404).json({ "message": "This course does not exist." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------
// ROUTE 3 : POST /api/courses 201
// Creates a course, sets the Location header to the URI for the course, and returns no content.
// ------------------------------------------
router.post('/courses', authenticateUser, async (req, res, next) => {
    try {
        const newCourse = await Course.create(req.body);
        res.location('/api/courses/' + newCourse.id).status(201).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === "SequelizeUniqueConstraintError") {
            console.log("Fuck you BITCH");
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            next(error);
        }
    }
});

// ------------------------------------------
// ROUTE 4 : PUT /api/courses/:id 204
// Updates a course and returns no content.
// ------------------------------------------
router.put('/courses/:id', authenticateUser, async (req, res, next) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id, {
        include: User
    });

    try {
        // Check and update if the currentUser owns the requested course.
        if (user.emailAddress === course.User.emailAddress) {
            if (course) {
                await course.update(req.body);
                res.sendStatus(204);
            } else {
                res.sendStatus(404);
            }
        } else {
            // access not allowed.
            res.sendStatus(403);
        }
    } catch (error) {
        console.error('ERROR: ', error);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors })
        } else {
            throw error;
        }
    }
});

// ------------------------------------------
// ROUTE 5 : DELETE /api/courses/:id 204
// Deletes a course and returns no content.
// ------------------------------------------
router.delete('/courses/:id', authenticateUser, async (req, res) => {
    const user = req.currentUser;
    let course = await Course.findByPk(req.params.id, {
        include: User,
    });

    if (course) {
        // Delete only if auth. user === course user
        if (course.userId === user.id) {
            try {
                await course.destroy();
                res.status(204).end();
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            // access not allowed.
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(404);
    }

});

module.exports = router;
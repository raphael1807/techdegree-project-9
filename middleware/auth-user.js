"use strict";

const auth = require("basic-auth");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
    let message;

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    // If the user's credentials are available...
    if (credentials) {
        const user = await User.findOne({
            where: { emailAddress: credentials.name },
        });

        // If a user was successfully retrieved from the data store...
        if (user) {
            console.log("user.password", user.password);
            console.log("credentials.pass", credentials.pass);

            // Use the bcrypt npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);

            // If the passwords match...
            if (authenticated) {
                console.log(
                    `Authentication successful for username: ${user.emailAddress}`
                );
                // Store the retrieved user object on the request object so any middleware functions that follow this middleware function will have access to the user's information.
                req.currentUser = user;

                // If user retrieval fails
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
            // If credentials are not available
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
        // If there were any failures above ...
    } else {
        message = "Auth header not found";
    }
    // If error happens 
    if (message) {
        console.warn(message);
        res.status(401).json({ message: "Access Denied" });

        // Or if auth succeeds
    } else {

        // Call the next() method.
        next();
    }
};

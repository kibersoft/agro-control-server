const db = require("../models");
const config = require("../config/auth.config.js");
const User = db.user;
const Role = db.user.role;

const Op = db.Sequelize.Op;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        roleId: 1 // fix
    })
        // .then(user => {
        //     if(req.body.role) {
        //         Role.findOne({
        //             where: {
        //                 name: req.body.role                        
        //             }
        //         }).then(role => {
        //             user.setRole(role).then(() => {
        //                 res.send({
        //                     message: "User was registered successfully!"
        //                 });
        //             });
        //         });
        //     } else {
        //         // user role = 1
        //         user.setRole([1]).then(() => {
        //             res.send({
        //                 message: "User was registered successfully!"
        //             });
        //         });
        //     }
        // })
       
        .catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(user => {
        if(!user) {
            return res.status(404).send({ message: "User Not found."});
        }    

        let passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if(!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        let token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        let authorities = [];
        user.getRole().then(role => {
            // for(let i = 0; i < roles.length; i++) {
            //     authorities.push("ROLE_", + roles[i].name.toUpperCase());
            // }
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                role: role.name,
                accessToken: token
            });
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.verify = (req, res) => {
    res.status(200).send();
};
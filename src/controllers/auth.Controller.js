const User = require('../models/auth.model');
const expressJwt = require('express-jwt');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const nodeMailer = require('nodemailer');
const { property, has } = require('lodash');

module.exports.registerController = ((req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        User.findOne({ email }).exec((err, user) => {
            if (user)// if user exists
            {
                return res.status(400).json({
                    error: "Email is taken"
                })
            }
        })
    }
    const token = jwt.sign({
        name, email, password
    }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '1m' })
    //email data dending 
    const sendMail = (to, subject, htmlContent) => {
        // Khởi tạo một thằng transporter object sử dụng chuẩn giao thức truyền tải SMTP với các thông tin cấu hình ở trên.
        const transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
            auth: {
                user: process.env.EMAIL_FROM,
                pass: 'khongthequena1'
            }
        })
        const options = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: "Account activation link",
            html: `<h1 style="color:red"> plasse click link to activation </h1>
                   <p>${process.env.CLIENT_URL}/users/activation/${token}</p>
                   <p>This email contain sensetiva info</p>
                   <p>${process.env.CLIENT_URL}</p>`
        }
        return transporter.sendMail(options).then(() => {
            return res.json({
                message: `Email has beend sent to ${email}`
            })
        })
            .catch(err => {
                return res.status(400).json({ error: err.message })
            })
    }
    sendMail(email);

})

//activation and save to database
exports.activationController = (req, res) => {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: "Mã hết hạn, đăng ký lại"
                })
            }
            const { name, email, password } = decoded;
            User.findOne({ email }).exec((err, user) => {
                if (user)// if user exists
                {
                    return res.status(400).json({
                        error: `Email ${email} đã tồn tại !`
                    })
                }
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        return res.status(400).json({
                            error: err
                        })
                    }
                    const users = new User({
                        name, email, password: hash
                    })
                    users.save((err, user) => {
                        if (err) {
                            console.log("err" + err)
                            return res.status(401).json({
                                error: err,
                            })
                        }
                        return res.json({
                            success: true,
                            message: "ddang ky thanh cong"
                        })
                    })
                });

            })
        });
    }
    else {
        return res.json({
            message: "mời nhập mã để tiếp tục"
        })
    }

}
exports.loginController = (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        User.findOne({ email }).exec((err, user) => {
            if (!user || err)// if user exists
            {
                return res.status(401).json({
                    error: "email khong ton tai"
                })
            }
            bcrypt.compare(password, user.password).then(function (result) {
                if (!result) {
                    return res.status(404).json({
                        error: "password khong dung"
                    })
                }
                const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
                return res.json({
                    token,
                    user
                })
            });

        })
    }
}

exports.ForgetPasswod = (req, res) => {
    const { email } = req.body;
    console.log(email)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: "Email khoong ton tai!" })
        }
        const token = jwt.sign({
            _id: user._id
        }, process.env.JWT_SECRET, { expiresIn: '5m' })

        // send token to email
        const sendMail = (to, subject, htmlContent) => {
            // Khởi tạo một thằng transporter object sử dụng chuẩn giao thức truyền tải SMTP với các thông tin cấu hình ở trên.
            const transporter = nodeMailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // nếu các bạn dùng port 465 (smtps) thì để true, còn lại hãy để false cho tất cả các port khác
                auth: {
                    user: process.env.EMAIL_FROM,
                    pass: 'khongthequena1'
                }
            })
            const options = {
                from: process.env.EMAIL_FROM,
                to: to,
                subject: "Password reset link",
                html: `<h1 style="color:red"> plasse click link to activation </h1>
                       <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                       <p>This email contain sensetiva info</p>
                       <p>${process.env.CLIENT_URL}</p>`
            }
            return transporter.sendMail(options).then(() => {
                return res.json({
                    message: `Email has beend sent to ${email}`
                })
            })
                .catch(err => {
                    return res.status(400).json({ error: err.message })
                })
        }

        return user.updateOne({
            resetPasswordlink: token
        }, (err, result) => {
            if (err) {
                return res.status(401).json({ error: error })
            }
            else {
                sendMail(email);
            }
        })

    })
}
exports.PasswordReset = (req, res) => {
    const { password, resetPasswordlink } = req.body;
    if (resetPasswordlink) {
        jwt.verify(resetPasswordlink, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                return res.status(404).json({ error: "Ma da het han" })
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array().map(error => error.msg)[0]
                return res.status(403).json({
                    error: firstError
                })
            }
            User.findOne({ resetPasswordlink }).exec((err, user) => {
                if (err || !user) {
                    return res.status(401).json({ error: "Ma het han hoac khong dung. Xin thu lai" })
                }
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        return res.status(400).json({
                            error: err
                        })
                    }
                    const updateField = {
                        password: hash,
                        resetPasswordlink: ""
                    }
                    user = _.extend(user, updateField)
                    user.save((err, result) => {
                        if (err) {
                            return res.status(402).json({ error: "err resting password" })
                        }
                        return res.json({
                            message: "Thay doi password thanh cong hay login voi new password"
                        })
                    })

                });

            })
        })
    }
}
 
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:9000/auth/google/callback"
    }, 
        async (accessToken, refreshToken, profile, done) => { 
            const{name,email}=profile._json 
            // check if user already exists
            const currentUser = await User.findOne({ email });
            if (currentUser) {
              // already have the user -> return (login) 
              return done(null, currentUser);
            } else {
               
                let password=email+process.env.JWT_SECRET;
                const newUser = new User({ email, name,password})
                newUser.save((err,user)=>{
                    if(err)
                    {
                        return done(err, null);
                    } 
                    return done(null, user);
                }); 
            }
          } 
    ));
   

// check if Token exists on request Header and attach token to request as attribute
exports.checkTokenMW = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        req.token = bearerHeader.split(' ')[1];
        next();
    } else {
        res.Status(403).json({error:"Ma khong hop le"});
    }
};

// Verify Token validity and attach token data as request attribute
exports.verifyToken = (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
        if(err) {
            return res.status(405).json({error:err})
        } else {
          console.log(authData)
        }
    })
};

// Issue Token
exports.signToken = (req, res) => { 
     
    jwt.sign({_id: req.user._id}, process.env.JWT_SECRET, {expiresIn:'5 min'}, (err, token) => {
        if(err){
            res.sendStatus(500);
        } else { 
           
             res.redirect(`${process.env.CLIENT_URL}/main/${token}`)
        }
    });
}
exports.loginsuccess=(req,res)=>{
    res.json({message:"btn-outline-dark"})
}




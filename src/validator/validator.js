const {check} =require('express-validator');

exports.valiRegister=[
    check("name","Name is required").notEmpty().isLength({min:4,max:32}).withMessage('name must be between 4 to 32 charater'),
    check('email',"is email requred").notEmpty().isEmail().withMessage("dung kieu email"),
    check('password',"password required").notEmpty().isLength({min:6}).withMessage("password > 6 character")
    
]

exports.valiLogin=[
    check('email',"is email requred").notEmpty().isEmail().withMessage("dung kieu email"),
    check('password',"password required").notEmpty().isLength({min:6}).withMessage("password > 6 character")
     
]

//forget pass
exports.forgetPassword=[
    check('email',"is email requred").notEmpty().isEmail().withMessage("dung kieu email"),
]
// reser passt
exports.resetPassword=[
    check('password',"password required").notEmpty().isLength({min:6}).withMessage("password > 6 character")
     
]
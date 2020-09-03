const Router=require('express').Router();
const Controllers =require('../controllers/auth.Controller')
const {valiRegister,valiLogin,forgetPassword,resetPassword}=require('../validator/validator')
const passport=require('passport');

module.exports.initRouter=(app)=>{ 

    // config
    app.use(passport.initialize());
    app.use(passport.session()); 
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
       
            done(err, user);
        
    });

    Router.post("/register",valiRegister,Controllers.registerController); 
    Router.post("/activation",Controllers.activationController); 
    Router.post("/login",valiLogin,Controllers.loginController); 
    Router.put("/password/forget",forgetPassword,Controllers.ForgetPasswod)
    Router.put("/password/reset",resetPassword,Controllers.PasswordReset)
    Router.get("/getuse",Controllers.checkTokenMW,Controllers.verifyToken)
    Router.get("/auth/googles",(req,res)=>{
        console.log(req.query.q)
    })
    Router.get("/show",Controllers.loginsuccess)
    //login gooogle  ủy quyền
    Router.get("/auth/google",
    passport.authenticate ('google', {scope: ["profile", "email"] }))

    Router.get ('/auth/google/callback', 
        passport.authenticate ('google', {failRedirect: '/'}), // chuyeenr ddeen trang looi
        function (req, res) { 
            // Xác thực thành công, chuyển hướng về trang chủ.  
            Controllers.signToken(req,res); 
           
        });
// end 

    return app.use('/',Router);
}

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
 }
    export const errorMiddleware = (err, req, res, next) => { 
            err.message = err.message || "Internal Server Error";  
            err.statusCode = err.statusCode || 500;
            console.error("Backend error:", err);
           if(err.code===11000){
            const message=`Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
            err=new ErrorHandler(400,message);
           }

          if(err.name==='JsonWebTokenError'){
            const message='JSON Web Token is invalid, try again';
            err=new ErrorHandler(400,message)

          }
            if(err.name==='TokenExpiredError'){ 
            const message='JSON Web Token is expired, try again';
            err=new ErrorHandler(400,message)
              }


              const errorMassage=err.errors? Object.values(err.errors).map((val)=>val.message).join(', '):err.message;
              res.status(err.statusCode).json({
                success:false,
                error:errorMassage
              })

          }




 export default ErrorHandler;

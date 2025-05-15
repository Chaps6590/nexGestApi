    import { Request, Response, NextFunction } from "express";
    import jwt from "jsonwebtoken";    
    import { User } from "../types/express";


    export const requireAuth = (req: Request, res: Response, next:NextFunction) => {
        
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: "No Autorizado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) { 
            return res.status(401).json({ message: "No Autorizado" });
        } 

        jwt.verify( token, 'secret', (err, user ) => {
            if (err) {  
                return res.status(401).json({ message: "No Autorizado" });
            }   

            if (!user) {
                return res.status(401).json({ message: "No Autorizado" });
            }

            if (typeof user === 'object' && user !== null) {
                req.user = user as User;
            } else {
                return res.status(401).json({ message: "No Autorizado" });
            }
            
            next();
        });        
    }
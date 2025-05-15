import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import userDB from "../models/user";

export const loginHandler = async(req: Request, res: Response) => {
  try {    
    const { email, password } = req.body;
    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Buscar usuario por email
    const user = await userDB.findOne({ email });
    if (!user) {      
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generar token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    console.log("email-token",email,token)

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const profileHandler = (req: Request, res: Response) => {
  console.log(req.user)
  return res.json({
    profile :{
      data: req.user,
    },
      message: "Profile successful"    
  });
};


export const registerHandler = async(req: Request, res: Response) => {
  
  try {
      const { name, email, password } = req.body;
     
      // Validar datos básicos
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Revisar si el usuario ya existe
      const existingUser = await userDB.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = new userDB({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generar token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      res.status(201).json({ token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }  
};
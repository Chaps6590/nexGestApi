import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import userDB from "../models/user";
import crypto from "crypto";
import { Resend } from "resend";

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

    // ⚠️ Verificar si está verificado
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Account not verified. Please check your email.",
        needVerification: true,
      });
    }

    // Generar token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

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

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userDB.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const user = new userDB({
      name,
      email,
      password: hashedPassword,
      isVerified: false, // importante
      verificationCode, // podés guardar esto en la base
    });

    await user.save();

    // Enviar email
    await sendEmailWithCode(email, verificationCode);      

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const sendEmailWithCode = async (to: string, code: string) => {

  const resend = new Resend(process.env.RESEND_API_KEY!);

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: `${to}`,
    subject: `Verificá tu cuenta para comenzar 🚀` ,
    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center; border-radius: 10px;">
            <h2 style="color: #333;">🔐 Verificación de cuenta</h2>
            <p style="color: #555; font-size: 16px;">
              ¡Hola! 👋<br><br>
              Gracias por registrarte. Para completar tu registro, ingresá el siguiente código:
            </p>
            <div style="margin: 30px 0; font-size: 36px; font-weight: bold; color: #2e86de; background: #eaf3ff; padding: 20px; border-radius: 8px; display: inline-block;">
              ${code}
            </div>
            <p style="color: #777; font-size: 14px;">
              Si no solicitaste este código, podés ignorar este mensaje.<br>
              ¡Nos alegra tenerte con nosotros! 🎉
            </p>
            <p style="margin-top: 40px; font-size: 13px; color: #aaa;">
              © ${new Date().getFullYear()} TuApp. Todos los derechos reservados.
            </p>
          </div>`
  });

};


export const verifyHandler = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    


    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await userDB.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined; // eliminás el código
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const resendCodeHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es requerido" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // 1. Actualizar el código en la base de datos
    const user = await userDB.findOneAndUpdate(
      { email },
      {
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Enviar el correo
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `¿Necesitás otro código? Acá lo tenés 📨`,
      html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center; border-radius: 10px;">
              <h2 style="color: #333;">🔄 Reenvío de código de verificación</h2>
              <p style="color: #555; font-size: 16px;">
                ¡Hola de nuevo! 👋<br><br>
                Recibimos tu solicitud para reenviar el código. Ingresá este nuevo código para continuar con la verificación:
              </p>
              <div style="margin: 30px 0; font-size: 36px; font-weight: bold; color: #2e86de; background: #eaf3ff; padding: 20px; border-radius: 8px; display: inline-block;">
                ${verificationCode}
              </div>
              <p style="color: #777; font-size: 14px;">
                Si no pediste este código, simplemente podés ignorar este correo.<br>
                ¡Gracias por seguir con nosotros! 🚀
              </p>
              <p style="margin-top: 40px; font-size: 13px; color: #aaa;">
                © ${new Date().getFullYear()} TuApp. Todos los derechos reservados.
              </p>
            </div>`
    });

    return res.status(200).json({ message: "Código reenviado con éxito" });

  } catch (error) {
    console.error("Error reenviando código:", error);
    return res.status(500).json({ error: "Hubo un error al reenviar el código" });
  }
};




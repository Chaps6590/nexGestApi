import app from "./app";
import connectDB from "./db/connect";

const PORT = process.env.PORT || 5000;

// Usá esta variable para definir el dominio si estás en producción
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en ${DOMAIN}`);
  });
};

startServer();

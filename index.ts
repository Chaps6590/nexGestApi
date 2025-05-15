import app from "./app";
import connectDB from "./db/connect";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // 👈 conectar antes de levantar servidor

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
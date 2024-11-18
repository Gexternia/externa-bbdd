import 'dotenv/config';
import express from "express";
import OpenAI from "openai";
import bodyParser from "body-parser";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuración para recibir JSON en las solicitudes
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

// Ruta principal para realizar la búsqueda
app.post("/buscar", async (req, res) => {
  try {
    const query = req.body.query;
    console.log("Query recibida:", query); // Monitorea la query enviada

    // Crea un nuevo hilo para cada consulta
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log("Nuevo hilo creado con ID:", threadId);

    // Envía el mensaje del usuario al asistente
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: query,
    });

    // Ejecuta el asistente en el hilo y espera el resultado
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: "asst_L54zXNvxcWNkkUjUmtzDapLt"
    });

    if (run.status === 'completed') {
      // Obtiene los mensajes generados por el asistente
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const response = messages.data.reverse().find(msg => msg.role === "assistant");
      console.log("Respuesta del asistente:", response.content[0].text.value); // Monitorea la respuesta del asistente
      res.json({ respuesta: response.content[0].text.value });
    } else {
      console.log("Error: La ejecución no se completó correctamente. Estado:", run.status);
      res.status(500).json({ error: "La ejecución no se completó correctamente." });
    }
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ error: "Hubo un error en el servidor." });
  }
});

// Inicia el servidor en el puerto 3000
app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});

import OpenAI from "openai";
const openai = new OpenAI();

async function searchEventoplus(query) {
  // Crea un hilo de conversación
  const thread = await openai.beta.threads.create();

  // Añade el mensaje del usuario al hilo
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: query,
  });

  // Ejecuta el asistente en el hilo y espera el resultado
  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: "asst_L54zXNvxcWNkkUjUmtzDapLt"
  });

  // Verifica si la ejecución ha finalizado con éxito
  if (run.status === 'completed') {
    // Obtiene los mensajes generados por el asistente
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    const response = messages.data.reverse().find(msg => msg.role === "assistant");
    console.log(`Asistente > ${response.content[0].text.value}`);
    return response.content[0].text.value;
  } else {
    console.log(`Error: La ejecución no se completó. Estado: ${run.status}`);
    return null;
  }
}

// Ejemplo de uso
searchEventoplus("Busca información sobre el evento 'Congreso de Innovación 2024'.")
  .then(response => {
    if (response) {
      console.log("Respuesta del asistente:", response);
    } else {
      console.log("No se obtuvo respuesta del asistente.");
    }
  })
  .catch(error => console.error("Error en la búsqueda:", error));

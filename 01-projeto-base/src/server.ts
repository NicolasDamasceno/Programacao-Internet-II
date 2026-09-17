/**
 * ============================================================
 * Mini-Prontuario - Servidor HTTP
 * ============================================================
 * Monta o app e liga os routers. Roteamento, traducao HTTP e
 * regra de negocio vivem em src/routes, src/controllers e
 * src/services -- este arquivo so orquestra.
 */
import express from "express";
import { patientsRouter } from "./routes/patients.routes";
import { encountersRouter } from "./routes/encounters.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = 3000;

// ------------------------------------------------------------
// MIDDLEWARES - executam ANTES das rotas, em ordem
// ------------------------------------------------------------

// Le o corpo da requisicao quando o Content-Type e application/json
// e coloca o resultado em req.body.
app.use(express.json());

// Serve os arquivos de public/ como conteudo estatico.
app.use(express.static("public"));

// Serve as fotos de paciente enviadas por upload.
app.use("/uploads", express.static("uploads"));

// ------------------------------------------------------------
// ROTAS
// ------------------------------------------------------------

/** Rota de saude: serve para saber se o servidor esta de pe. */
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/patients/:id/encounters", encountersRouter);
app.use("/api/patients", patientsRouter);

// Middleware de erro: por ultimo, depois de todas as rotas. Todo
// erro lancado (throw) em qualquer rota/controller/service acaba aqui.
app.use(errorHandler);

// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Mini-Prontuario no ar em http://localhost:${PORT}`);
});

/**
 * ============================================================
 * Painel de Medicacao - Servidor HTTP
 * ============================================================
 * Monta o app e liga o router de medications. Roteamento, traducao
 * HTTP e regra de negocio vivem em src/routes, src/controllers e
 * src/services -- este arquivo so orquestra.
 */
import express from "express";
import { medicationsRouter } from "./routes/medications.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/medications", medicationsRouter);

// Middleware de erro: por ultimo, depois de todas as rotas. Todo
// erro lancado (throw) em qualquer rota/controller/service acaba aqui.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});

/**
 * TODO 12 -- Configuracao do multer.
 *
 * Duas decisoes de seguranca ficam por sua conta abaixo:
 *
 * 1) `filename` (dentro de diskStorage): o nome do arquivo salvo
 *    em disco NUNCA pode ser o nome original enviado pelo cliente.
 *    Um cliente mal-intencionado pode mandar um `filename` como
 *    "../../server.ts" (path traversal) ou colidir nomes com outro
 *    paciente. Gere um nome unico aqui (dica: `crypto.randomUUID()`
 *    do modulo nativo "node:crypto", + a extensao original tirada
 *    de `file.mimetype` ou de `file.originalname`).
 *
 * 2) `fileFilter`: so pode aceitar `image/jpeg` e `image/png`.
 *    Repare que o parametro que importa e `file.mimetype` (o
 *    Content-Type que o navegador declarou), NAO a extensao do
 *    nome do arquivo -- é isso que o "teste extra" do roteiro
 *    (renomear um .txt para .jpg) verifica.
 *
 * Assinatura de fileFilter (ja tipada pelo multer):
 *   (req, file, callback) => void
 *   - aceitar: callback(null, true)
 *   - rejeitar: callback(null, false)  // multer devolve 500 se
 *     voce passar um Error aqui dentro de um fileFilter sincrono;
 *     prefira `callback(null, false)` e trate a ausencia de arquivo
 *     no controller (TODO 13) com UnprocessableEntityError.
 */
import { randomUUID } from "node:crypto";
import multer from "multer";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// A extensao vem do mimetype (ja restrito pelo fileFilter abaixo),
// nunca do nome original enviado pelo cliente -- isso evita path
// traversal (ex.: um cliente mandando "../../src/server.ts").
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const storage = multer.diskStorage({
  destination: "uploads/",
  filename(_request, file, callback) {
    const extension = EXTENSION_BY_MIME_TYPE[file.mimetype] ?? "";
    callback(null, `${randomUUID()}${extension}`);
  },
});

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

function fileFilter(_request: unknown, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
}

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

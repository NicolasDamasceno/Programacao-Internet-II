
/**
 * Configuracao do multer para o upload de foto do paciente.
 *
 * Duas decisoes de seguranca:
 *
 * 1) `filename`: o nome do arquivo salvo em disco NUNCA e o nome
 *    original enviado pelo cliente. Um cliente mal-intencionado
 *    poderia mandar um nome como "../../server.ts" (path traversal)
 *    ou colidir nomes com outro paciente. Por isso geramos um nome
 *    unico com `crypto.randomUUID()`, com a extensao tirada do
 *    mimetype (nunca do nome original).
 *
 * 2) `fileFilter`: so aceita `image/jpeg` e `image/png`, olhando
 *    `file.mimetype` (o Content-Type declarado), nao a extensao do
 *    nome do arquivo -- e isso que barra um .txt renomeado para .jpg.
 */
import { randomUUID } from "node:crypto";
import multer from "multer";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

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

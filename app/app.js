require("dotenv").config();
const express = require(`express`);
const cors = require("cors");
const httpRequest = require("./services/httpRequest");
const multer = require("multer");
const crypto = require("crypto");
const app = express();
const path = require("path");
const FormData = require("form-data");
const fs = require("fs");

app.use(cors());
app.use(express.json());

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split(".")[1];

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = crypto.randomBytes(8).toString("hex");

    // Indica o novo nome do arquivo:
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`);
  },
});

const upload = multer({ storage });

app.get("/", (request, response) => {
  const port = process.env.PORT;
  return response.status(200).json({
    message: `Server running ${[port]}`,
  });
});

app.get("/folders", async (request, response) => {
  try {
    httpRequest
      .get("listfolder")
      .then((responseJson) => {
        let data = [];
        console.log(responseJson);
        responseJson.data.folders.map((filter) => data.push(filter.name));
        return response.json({
          message: "Lista de pastas",
          data,
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } catch (error) {
    return response.status(400).json({
      message: "Houve um erro ao tentar trazer as pastas.",
      error: error.message,
    });
  }
});

app.post("/folders", async (request, response) => {
  try {
    const { path } = request.body;
    httpRequest
      .post("createFolder", { path })
      .then((responseJson) => {
        console.log(responseJson);
        return response.json({
          message: "Pasta criada com sucesso.",
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } catch (error) {
    return response.status(400).json({
      message: "Houve um erro ao tentar trazer as pastas.",
      error: error.message,
    });
  }
});

app.post("/upload", upload.single("image"), async (request, response) => {
  try {
    const caminho = path.join(__dirname, "..", "tmp", request.file.filename);

    var form = new FormData();
    form.append("useFilename", "true");
    form.append("overwrite", "true");
    // form.append("path", "Barcellos");
    form.append("file", fs.createReadStream(caminho));

    httpRequest
      .post("uploadImage", form, {
        headers: {
          "Content-Type": `multipart/form-data;boundary=${form._boundary}`,
        },
      })
      .then((responseJson) => {
          console.log()
        return response.json({
          message: "Imagem hospedada com sucesso.",
          data: responseJson.data
          
        });
      })
      .catch((error) => {
        console.log(error.response.data);
        return response.status(400).json({
          message: "Houve um erro ao tentar trazer as pastas.",
          error: error.message,
          erros: error.response.data,
        });
      });
  } catch (error) {
    return response.status(400).json({
      message: "Houve um erro ao tentar trazer as pastas.",
      error: error.message,
    });
  }
});

module.exports = app;

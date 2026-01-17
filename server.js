const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const codigos = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vipcinebr@gmail.com",
    pass: "qlig purr hixe xwis"
  }
});

app.post("/api", async (req, res) => {
  const acao = req.body.acao || req.query.acao;
  const email = req.body.email || req.query.email;
  const codigo = req.body.codigo || req.query.codigo;

  if (!email) {
    return res.json({ status: "error", mensagem: "E-mail não informado" });
  }

  if (acao === "enviar") {
    const novoCodigo = gerarCodigo();
    codigos.set(email, novoCodigo);
    setTimeout(() => codigos.delete(email), 5 * 60 * 1000);

    try {
      await enviarEmailBonito(email, novoCodigo);
      return res.json({ status: "success", mensagem: "Código enviado para " + email });
    } catch (erro) {
      console.error(erro);
      return res.json({ status: "error", mensagem: "Erro ao enviar e-mail" });
    }
  }

  if (acao === "verificar") {
    const codigoSalvo = codigos.get(email);

    if (codigoSalvo === codigo) {
      codigos.delete(email);
      return res.json({ status: "success", mensagem: "Código correto" });
    } else {
      return res.json({ status: "error", mensagem: "Código incorreto" });
    }
  }

  return res.json({ status: "error", mensagem: "Ação inválida" });
});

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function enviarEmailBonito(destinatario, codigo) {
  const assunto = "Seu código de verificação - API CODE";

  const html = `
  <div style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: #ffffff; padding: 40px; font-family: 'Segoe UI', Arial, sans-serif;
  border-radius: 16px; max-width: 600px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.4); text-align: center;">
    
    <h1 style="color: #00e6ff; margin-bottom: 5px; letter-spacing: 2px;">API CODE</h1>
    <p style="color: #cccccc; margin-top: 0;">Sistema de Verificação Segura</p>

    <div style="margin: 30px 0;">
      <h2 style="margin-bottom: 10px;">Código de Verificação</h2>
      <p style="font-size: 16px; color: #dddddd;">
        Use o código abaixo para confirmar sua identidade:
      </p>

      <div style="font-size: 36px; background: #ffffff; color: #0f2027;
      font-weight: bold; padding: 18px 40px; display: inline-block;
      border-radius: 12px; margin: 20px 0; letter-spacing: 6px;">
        ${codigo}
      </div>

      <p style="margin-top: 10px; font-size: 14px; color: #bbbbbb;">
        Este código expira em 5 minutos.
      </p>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid rgba(255,255,255,0.2);">

    <p style="font-size: 13px; color: #aaaaaa;">
      Se você não solicitou este código, ignore este e-mail.
    </p>

    <p style="font-size: 11px; color: #888888;">
      Identificador de segurança: <code>#API_CODE_SECURE</code>
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"API CODE" <SEU_EMAIL@gmail.com>`,
    to: destinatario,
    subject: assunto,
    html: html
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});

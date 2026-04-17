const { Router } = require("express");
const { UserRecord } = require("../records/UserRecord");
const bcrypt = require("bcrypt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const generateContentWithRetry = require("../utils/autoResponseAi");
const removePolishMarks = require("../utils/removePolishMarks");

const registerRouter = new Router();

registerRouter.post("/", async (req, res) => {
  const { email, password, name, surname, phone } = req.body;
  let user = await UserRecord.findOneByEmail(email);
  if (user !== null) {
    return res
      .status(409)
      .json({ message: "Uzytkownik o takim emailu juz istnieje" });
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT),
  );

  user = await new UserRecord({
    email,
    password: hashedPassword,
    role: "user",
    name,
    surname,
    phone,
  });
  await user.insert();
  res.status(201).send(`Dodano użytkownika o numerze id: ${user.id}`);
});

//Rejestracja przez Gemini plik cv
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("TYP_PLIKU_NIEZGODNY"));
    }
  },
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
registerRouter.post("/registerAi/cv", async (req, res) => {
  const getFile = upload.single("cvFile");
  getFile(req, res, async function (err) {
    if (err) {
      if (err.message === "TYP_PLIKU_NIEZGODNY") {
        return res
          .status(400)
          .json({ message: "Błąd: Przesłany plik musi być formatem PDF!" });
      }
      return res
        .status(400)
        .json({ message: "Błąd podczas przesyłania pliku." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Nie wybrano żadnego pliku." });
    }
    try {
      const fileFormat = req.file.buffer.toString("base64");
      const daneDlaAI = {
        inlineData: {
          data: fileFormat,
          mimeType: "application/pdf",
        },
      };

      const requestAi = `Wyciągnij z tego CV imię, nazwisko, e-mail oraz numer telefonu. 
Zwróć dane WYŁĄCZNIE w formacie JSON z dokładnie takimi kluczami i bez żadnego dodatkowego tekstu:
{
  "name": "Imię (tylko pierwsza litera duża)",
  "surname": "Nazwisko (tylko pierwsza litera duża)",
  "email": "adres email",
  "phone": "numer telefonu"
}`;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" },
      });
      const wynik = await generateContentWithRetry(model, [
        requestAi,
        daneDlaAI,
      ]);
      const odpowiedzAI = wynik.response.text();
      const data = JSON.parse(odpowiedzAI);
      const cleanData = {
        name: removePolishMarks(data.name),
        surname: removePolishMarks(data.surname),
        email: data.email,
        phone: data.phone,
      };
      console.log(data);
      res.status(200).json({
        data: cleanData,
      });
    } catch (error) {
      console.error("Błąd Gemini:", error);
      res.status(500).json({
        message: "Sztuczna inteligencja miała problem z odczytem tego pliku.",
      });
    }
  });
});

module.exports = {
  registerRouter,
};

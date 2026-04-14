const express = require("express");
const { UserRecord } = require("../records/UserRecord");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginRouter = express.Router();

loginRouter.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserRecord.findOneByEmail(email);

  if (!user) {
    return res
      .status(401)
      .json({ message: "Wprowadzono niepoprawny adres email lub haslo" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ message: "Wprowadzono niepoprawny adres email lub haslo" });
  }

  const tokenPayload = { id: user.id, role: user.role };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res
    .cookie("token_auth", token, {
      httpOnly: true,
      maxAge: 2592000,
      sameSite: "strict",
    })

    .status(200)
    .json({
      message: "Zalogowano pomyślnie",
      user: { id: user.id, email: user.email, role: user.role, name: user.name, surname: user.surname, photo: user.photo },
    });
});


module.exports = {
  loginRouter,
};

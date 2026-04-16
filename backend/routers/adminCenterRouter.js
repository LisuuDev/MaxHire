const express = require("express");
const { UserRecord } = require("../records/UserRecord");
const tokenAuth = require("../guards/authGuard");
const authorizeRoles = require("../guards/authorizeRoles");
const { transporter } = require("../utils/gmailconfig");
const { mailOptions } = require("../utils/szablonPassword");
const { ValidationError } = require("../utils/handleErrors");
const { OfferRecord } = require("../records/OfferRecord");

const adminCenterRouter = express.Router();

//Panel administratora wyswietlanie wszystkich uzytkownikow

adminCenterRouter.get(
  "/userList",
  tokenAuth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const data = await UserRecord.findAll();
    const filterData = data
      .map((elem) => new UserRecord(elem))
      .filter((el) => el.id !== req.user.id);
    res.status(200).json(filterData);
  },
);

//Usuwanie usera
adminCenterRouter.delete(
  "/remove/:userId",
  tokenAuth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const selectedUser = await UserRecord.findById(req.params.userId);
    if (!selectedUser) {
      res
        .status(404)
        .json({ message: "Uzytkownik zostal juz wczesniej usuniety" });
    }
    if (selectedUser.id === req.user.id) {
      res
        .status(404)
        .json("nie mozesz usunac user na ktorym jestes zalogowany");
    }

    await selectedUser.delete();
    res.status(200);
    res.json({ message: `Uzytkownik: ${selectedUser.email} zostal usuniety` });
  },
);

// Wyswietlanie konkretnego usera wraz z jego ofertami.
adminCenterRouter.get(
  "/user/:id",
  tokenAuth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const selectedUser = await UserRecord.findById(req.params.id);
    if (!selectedUser) {
      res.status(404).json({ message: "uzytkownik nie istnieje" });
    }
    const selectedUserOffers = await OfferRecord.findOneByUserId(
      selectedUser.id,
    );
    res.status(200).json({
      selectedUser,
      offers: !selectedUserOffers ? [] : selectedUserOffers,
    });
  },
);

module.exports = {
  adminCenterRouter,
};

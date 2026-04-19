const express = require("express");
const { UserRecord } = require("../records/UserRecord");
const tokenAuth = require("../guards/authGuard");
const authorizeRoles = require("../guards/authorizeRoles");
const { transporter } = require("../utils/gmailconfig");
const { mailOptions } = require("../utils/szablonPassword");
const { ValidationError } = require("../utils/handleErrors");
const { OfferRecord } = require("../records/OfferRecord");
const multer = require("multer");
const storage = require("../utils/cloudinaryConfig");
const upload = multer({ storage: storage });

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

// Usuwanie ofert danego użytkownika
adminCenterRouter.delete(
  "/remove/offer/:id",
  tokenAuth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const offer_id = req.params.id;
    const findOffer = await OfferRecord.findOneByIdOffer(offer_id);

    if (!findOffer) {
      throw new ValidationError("Ogloszenie nie istnieje w bazie");
    }
    await findOffer.delete();
    res
      .status(200)
      .json({ message: `Zgloszenie o id: ${offer_id} zostalo usuniete` });
  },
);

// Edycja danych użytkownika
adminCenterRouter.patch(
  "/update/user/:userId",
  tokenAuth,
  authorizeRoles(["admin"]),
  upload.single("profilePhoto"),
  async (req, res) => {
    const findUser = await UserRecord.findById(req.params.userId);
    if (!findUser) res.status(404).json({ message: "uzytkownik nie istnieje" });
    if (req.file) {
      try {
        const photoUrl = req.file.path;
        await UserRecord.updateProfilePhoto(findUser.id, photoUrl.toString());
      } catch (err) {
        throw new ValidationError("Nie udalo sie zapisac zdjecia");
      }
    }
    const saveUser = await UserRecord.findById(req.params.userId);
    const changeUser = new UserRecord({
      ...saveUser,
      ...req.body,
      id: findUser.id,
    });
    try {
      await changeUser.update();
      res.status(200).json({
        message: `Dane uzytkownika ${findUser.email} zostały zaaktualizowane`,
      });
    } catch (error) {
      res.status(400).json({ message: "Błąd zmiany danych" });
    }
  },
);

//edycja zgłoszeń uzytkownika:

adminCenterRouter.patch(
  "/update/offer/:offerId",
  tokenAuth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    const findOffer = await OfferRecord.findOneByIdOffer(req.params.offerId);
    if (!findOffer) {
      res
        .status(404)
        .json({ message: "oferta nie istnieje lub zostala usunienta" });
    }
    const changeOffer = {
      ...findOffer,
      ...req.body,
    };
    const ownerOffer = await UserRecord.findById(findOffer.user_id);
    const data = await new OfferRecord(changeOffer);

    try {
      await data.update();
      return res.status(200).json({
        message: `Dane ogłoszenia  ${findOffer.title} , uzytkownika  ${ownerOffer.email} zostały zaaktualizowane`,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ message: "Wystąpił błąd podczas aktualizacji" });
    }
  },
);

module.exports = {
  adminCenterRouter,
};

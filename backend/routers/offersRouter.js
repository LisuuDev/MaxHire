const express = require("express");
const { OfferRecord } = require("../records/OfferRecord");
const { UserRecord } = require("../records/UserRecord");
const tokenAuth = require("../guards/authGuard");
const { ValidationError } = require("../utils/handleErrors");
const offersRouter = express.Router();

offersRouter.get("/", tokenAuth, async (req, res) => {
  const search = req.query.search || "";
  const limit = 7;
  const page = parseInt(req.query.page) || 1;
  const offset = (parseInt(page) - 1) * limit;

  const data = await OfferRecord.findAllFiltr(limit, offset, search);

  res.status(200).json(data);
});

//Edytowanie zgłoszeń zalogowanego usera

offersRouter.patch("/editOffer/:id", tokenAuth, async (req, res) => {
  const findoffer = await OfferRecord.findOneByIdOffer(req.params.id);

  if (!findoffer) {
    throw new ValidationError("Oferta nie istnieje");
  }

  if (findoffer.user_id !== req.user.id) {
    return res.status(403).json({ message: "Brak uprawnień do edycji tego ogłoszenia" });
  }

  const newOffer = new OfferRecord({
    ...findoffer,
    ...req.body,
  });

  try {
    await newOffer.update();
    return res.status(200).json({ message: "Dane ogłoszenia zostały zaaktualizowane" });
  } catch (error) {
    return res.status(400).json({ message: "Wystąpił błąd podczas aktualizacji" });
  }
});

//Usuwanie zgłoszeń zalogowanego usera

offersRouter.delete("/deleteOffer/:id", tokenAuth, async (req, res) => {
  const offer_id = req.params.id;
  const findOffer = await OfferRecord.findOneByIdOffer(offer_id);
  
  if (!findOffer) {
    throw new ValidationError("Ogloszenie nie istnieje w bazie");
  }
  const loginUser = req.user.id;

  if (findOffer.user_id !== loginUser) {
    throw new ValidationError(
      "Zgloszenie nie nalezy do ciebie, brak mozliwosci usuniecia tego zgloszenia !",
    );
  }

  await findOffer.delete();
  res
    .status(200)
    .json({ message: `Zgloszenie o id: ${offer_id} zostalo usuniete` });
});

module.exports = {
  offersRouter,
};

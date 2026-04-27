const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { urlencoded } = require("express");
const { registerRouter } = require("./routers/registerRouter");
const { handleError } = require("./utils/handleErrors");
const { loginRouter } = require("./routers/loginRouter");
const { adminCenterRouter } = require("./routers/adminCenterRouter");
const { logoutRouter } = require("./routers/logoutRouter");
const { addOfferRouter } = require("./routers/addOfferRouter");
const { offersRouter } = require("./routers/offersRouter");
const { photoUploadRouter } = require("./routers/photoUploadRouter");
const { offerRouter } = require("./routers/offerRouter");
const { editUserRouter } = require("./routers/editUserRouter");
const { profileRouter } = require("./routers/profileRouter");

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/admin", adminCenterRouter);
app.use("/edit/user", editUserRouter);
app.use("/logout", logoutRouter);
app.use("/addOffer", addOfferRouter);
app.use("/offers", offersRouter);
app.use("/offer", offerRouter);
app.use("/profile", profileRouter);
app.use("/upload", photoUploadRouter);
app.use(handleError);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on localhost");
});

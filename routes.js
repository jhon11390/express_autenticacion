const jwt = require("jsonwebtoken");
const User = require("./user");
const middleware = require("./middleware");
const express = require('express');
const router = express.Router();

router.use(middleware.setUser);

router.get("/", middleware.requireUser, async (req, res) => {
  const users = await User.find();
  res.render("index", { users: users });
});

router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };

  try {
    const user = await User.create(data);
  } catch (e) {
    console.error(e);
  }
  res.redirect("/");
});

router.get("/login", (req, res) => res.render("login"));

router.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.authenticate(email, password);
    if (user) {
      const token = jwt.sign({ userId: user._id }, "secretcode");
      res.cookie("token", token, { expires: new Date(Date.now() + 24*60*60*1000), httpOnly: true });
      return res.redirect("/");
    } else {
      res.render("login", { error: "Wrong email or password. Try again!" });
    }
  } catch (e) {
    return next(e);
  }
});

router.get("/logout", middleware.requireUser, (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
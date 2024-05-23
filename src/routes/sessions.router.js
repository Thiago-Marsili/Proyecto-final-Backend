import { Router } from "express";
import passport from "passport";
import {
  loginGithub,
  loginLocal,
  logout,
  registerLocal,
  resetPassword,
} from "../controllers/sessions.controller.js";
import { authorizationStrategy, authorizationRol, extractNonSensitiveUserInfo } from "../utils.js";

const router = Router();

// Register local
router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/register" }),
  registerLocal,
  (req, res) => {
    // Aquí deberías enviar un token en la respuesta si el registro es exitoso
    res.status(200).send({ token: req.user.token }); // Ajusta según cómo estés manejando los tokens en tu aplicación
  }
);

// Login local
router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  loginLocal,
  (req, res) => {
    // Aquí deberías enviar un token en la respuesta si el inicio de sesión es exitoso
    res.status(200).send({ token: req.user.token }); // Ajusta según cómo estés manejando los tokens en tu aplicación
  }
);

// Iniciar sesión Github
router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  loginGithub
);

// Cerrar sesión
router.get("/logout", logout);

// Reset password
router.post("/resetPassConfirm", resetPassword);

// Ruta datos de usuario logueado - Admin
router.get(
  "/current",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol("Admin"),
  (req, res) => {
    res.send({ status: "success", payload: req.user });
  }
);

// Ruta datos de usuario - Información no sensible
router.get(
  "/currentUser",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Admin", "Premium"]),
  extractNonSensitiveUserInfo,
  (req, res) => {
    if (req.nonSensitiveUserInfo && req.nonSensitiveUserInfo.email) {
      // Si la información del usuario no sensible está presente y tiene la propiedad "email"
      res.send({ status: "success", payload: req.nonSensitiveUserInfo });
    } else {
      // Si la información del usuario no está presente o falta la propiedad "email"
      res.status(401).send({ error: "No autorizado" });
    }
  }
);



export default router;

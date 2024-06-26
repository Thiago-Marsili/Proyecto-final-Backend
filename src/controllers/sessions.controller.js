import { generateToken } from "../utils.js";
import config from "../config/config.js";
import { userService } from "../services/index.js";
import bcrypt from "bcrypt";

export const registerLocal = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.body.email);
    const access_token = generateToken(user);

    res.cookie(config.secret_cookie, access_token, {
      maxAge: 60 * 60 * 10000,
      httpOnly: true,
    });
    res.redirect("/profile"); // Asegúrate de redirigir a la URL correcta después del registro
  } catch (error) {
    res.status(500).send("Error en el registro: " + error.message);
  }
};


export const loginLocal = async (req, res) => {
  try {
    if (!req.user)
      return res.status(400).json({ message: "Credenciales inválidas" });

    const user = req.user;
    user.last_connection = new Date().toLocaleString();
    await user.save();

    const access_token = generateToken(user);
    res.cookie("keyCookieForJWT", access_token, { 
      maxAge: 60 * 60 * 10000,
      httpOnly: true,
    });
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error en la autenticación: " + error.message);
  }
};

export const loginGithub = async (req, res) => {
  const user = req.user;
  user.last_connection = new Date().toLocaleString();
  await user.save();

  const access_token = generateToken(user);

  res
    .cookie("keyCookieForJWT", access_token, { 
      maxAge: 60 * 60 * 10000,
      httpOnly: true,
    })
    .redirect("/profile");
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getUserByEmail(email);

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const currentPassword = user.password;

      if (await bcrypt.compare(password, currentPassword)) {
        return res.status(400).json({
          message: "La nueva contraseña no puede ser igual a la actual",
        });
      }

      const updatedUser = { password: hashedPassword };
      await userService.updatedUserById(user.id, updatedUser);

      return res.redirect("/login");
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
};

export const logout = async (req, res) => {
  try {
    const user = req.user;
    user.last_connection = new Date().toLocaleString();
    await user.save();

    const session = req.session;

    session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
          error: err,
        });
      } else {
        res.clearCookie("keyCookieForJWT"); 
        res.redirect("/login");
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
      error: error,
    });
  }
};

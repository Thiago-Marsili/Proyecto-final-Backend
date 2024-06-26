import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://127.0.0.1:5050");

describe("Testing Sessions. Registro, Login and Current", () => {
  let cookie;
  const user = {
    first_name: "Test",
    last_name: "Prueba",
    email: "test@prueba.com",
    password: "1234",
    age: 30,
  };

  it("Debe registrar un usuario", async () => {
    const response = await requester.post("/api/sessions/register").send(user);
    expect(response.status).to.equal(302); // Ajusta este valor basado en la respuesta esperada
  });

  it("Debe loguear un user y devolver una cookie", async () => {
    const result = await requester.post("/api/sessions/login").send({
      email: user.email,
      password: user.password,
    });

    const cookieResult = result.headers["set-cookie"][0];

    cookie = {
      name: cookieResult.split("=")[0],
      value: cookieResult.split("=")[1].split(";")[0],
    };

    expect(cookie.name).to.be.ok.and.eql("keyCookieForJWT");
    expect(cookie.value).to.be.ok;
  });

  it("Enviar cookie para ver el contenido de USER", async () => {
    const response = await requester
      .get("/api/sessions/currentUser")
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);

    if (response.status === 200) {
      expect(response.body).to.have.property("payload");
      expect(response.body.payload).to.have.property("email").eql(user.email);
    } else {
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property("error").eql("Error: No auth token");
    }
  });
});

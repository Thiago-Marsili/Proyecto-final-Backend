// index.js
import { Product, Cart, User, Ticket } from "../Dao/factory.js";
import ProductRepository from "./product.repository.js";
import CartRepository from "./carts.repository.js";
import UserRepository from "./users.repository.js";
import TicketRepository from "./ticket.repository.js";
import PaymentRepository from "./payments.repository.js";

// Verificar si Product, Cart, User y Ticket son clases o instancias
const productInstance = typeof Product === 'function' ? new Product() : Product;
const cartInstance = typeof Cart === 'function' ? new Cart() : Cart;
const userInstance = typeof User === 'function' ? new User() : User;
const ticketInstance = typeof Ticket === 'function' ? new Ticket() : Ticket;

export const productService = new ProductRepository(productInstance);
export const cartService = new CartRepository(cartInstance);
export const userService = new UserRepository(userInstance);
export const ticketService = new TicketRepository(ticketInstance);
export const paymentService = new PaymentRepository();

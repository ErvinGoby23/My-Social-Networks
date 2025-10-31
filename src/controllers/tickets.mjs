import TicketTypeModel from "../models/ticketType.mjs";
import TicketModel from "../models/ticket.mjs";

const Tickets = class Tickets {
  constructor(app, connect) {
    this.app = app;
    this.TicketTypeModel = connect.model("TicketType", TicketTypeModel);
    this.TicketModel = connect.model("Ticket", TicketModel);
    this.run();
  }

  createTicketType() {
    this.app.post("/event/:id/ticketType", async (req, res) => {
      try {
        const { name, price, quantity, createdBy } = req.body;
        const ticketType = new this.TicketTypeModel({
          event: req.params.id,
          name,
          price,
          quantity,
          createdBy
        });

        const saved = await ticketType.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: "Validation Error", errors });
        }
        res.status(400).json({ code: 400, message: "Bad Request" });
      }
    });
  }

  buyTicket() {
    this.app.post("/ticketType/:id/buy", async (req, res) => {
      try {
        const { firstName, lastName, address } = req.body;
        const type = await this.TicketTypeModel.findById(req.params.id);

        if (!type || type.quantity <= 0) {
          return res.status(400).json({ message: "Plus de billets disponibles" });
        }

        const ticket = new this.TicketModel({
          ticketType: req.params.id,
          firstName,
          lastName,
          address
        });

        await ticket.save();
        type.quantity -= 1;
        await type.save();

        res.status(201).json(ticket);
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: "Validation Error", errors });
        }
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  getTicketTypes() {
    this.app.get("/event/:id/ticketTypes", async (req, res) => {
      try {
        const tickets = await this.TicketTypeModel.find({ event: req.params.id })
          .populate("createdBy", "firstname lastname");
        res.status(200).json(tickets);
      } catch (err) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  getTicketsByType() {
    this.app.get("/ticketType/:id/tickets", async (req, res) => {
      try {
        const list = await this.TicketModel.find({ ticketType: req.params.id });
        res.status(200).json(list);
      } catch (err) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
      }
    });
  }

  run() {
    this.createTicketType();
    this.buyTicket();
    this.getTicketTypes();
    this.getTicketsByType();
  }
};

export default Tickets;

import EventModel from '../models/event.mjs';

const Events = class Events {
  constructor(app, connect) {
    this.app = app;
    this.EventModel = connect.model('Event', EventModel);
    this.run();
  }

  /**
   * @swagger
   * /event:
   *   post:
   *     summary: Créer un nouvel événement
   *     description: Crée un événement avec ses informations principales.
   *     tags: [Events]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - startDate
   *               - endDate
   *               - location
   *             properties:
   *               name:
   *                 type: string
   *                 example: Conférence IA 2025
   *               description:
   *                 type: string
   *                 example: Une conférence sur l'intelligence artificielle et les innovations.
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 example: 2025-11-05T09:00:00Z
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 example: 2025-11-05T18:00:00Z
   *               location:
   *                 type: string
   *                 example: EFREI Paris
   *               coverPhoto:
   *                 type: string
   *                 example: ai_event.jpg
   *               isPrivate:
   *                 type: boolean
   *                 example: false
   *               organizers:
   *                 type: array
   *                 items:
   *                   type: string
   *                   example: 671f91b4b1a2c32f44d8a7e1
   *               participants:
   *                 type: array
   *                 items:
   *                   type: string
   *                   example: 671f91b4b1a2c32f44d8a7e9
   *     responses:
   *       201:
   *         description: Événement créé avec succès
   *       400:
   *         description: Données invalides
   */
  create() {
    this.app.post('/event', async (req, res) => {
      try {
        const event = new this.EventModel(req.body);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
      } catch (err) {
        console.error(`[ERROR] events/create -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /events:
   *   get:
   *     summary: Récupérer tous les événements
   *     description: Retourne la liste complète des événements enregistrés.
   *     tags: [Events]
   *     responses:
   *       200:
   *         description: Liste des événements
   *       500:
   *         description: Erreur interne du serveur
   */
  getAll() {
    this.app.get('/events', async (req, res) => {
      try {
        const events = await this.EventModel.find()
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');
        res.status(200).json(events);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}:
   *   get:
   *     summary: Récupérer un événement par ID
   *     description: Retourne les informations d’un événement spécifique.
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *           example: 671f91b4b1a2c32f44d8a7f2
   *     responses:
   *       200:
   *         description: Événement trouvé
   *       404:
   *         description: Événement introuvable
   */
  getById() {
    this.app.get('/event/:id', async (req, res) => {
      try {
        const event = await this.EventModel.findById(req.params.id)
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');

        if (!event) {
          return res.status(404).json({ code: 404, message: 'Event Not Found' });
        }

        res.status(200).json(event);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}:
   *   delete:
   *     summary: Supprimer un événement
   *     description: Supprime un événement existant à partir de son ID.
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Événement supprimé avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  deleteById() {
    this.app.delete('/event/:id', async (req, res) => {
      try {
        const deleted = await this.EventModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}/addParticipant:
   *   put:
   *     summary: Ajouter un participant à un événement
   *     description: Ajoute un utilisateur existant à la liste des participants d’un événement.
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: 671f91b4b1a2c32f44d8a7e9
   *     responses:
   *       200:
   *         description: Participant ajouté
   *       404:
   *         description: Événement introuvable
   */
  addParticipant() {
    this.app.put('/event/:id/addParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (!event.participants.includes(userId)) {
          event.participants.push(userId);
          await event.save();
        }

        res.status(200).json(event);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /event/{id}/removeParticipant:
   *   put:
   *     summary: Supprimer un participant d’un événement
   *     description: Retire un utilisateur de la liste des participants d’un événement.
   *     tags: [Events]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID de l'événement
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: 671f91b4b1a2c32f44d8a7e9
   *     responses:
   *       200:
   *         description: Participant supprimé
   *       404:
   *         description: Événement introuvable
   */
  removeParticipant() {
    this.app.put('/event/:id/removeParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.participants = event.participants.filter(id => id.toString() !== userId);
        await event.save();

        res.status(200).json(event);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.deleteById();
    this.addParticipant();
    this.removeParticipant();
  }
};

export default Events;

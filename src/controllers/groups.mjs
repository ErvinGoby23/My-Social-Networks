import GroupModel from '../models/group.mjs';
import UserModel from '../models/user.mjs';

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Gestion des groupes (publics, privés, secrets)
 */
const Groups = class Groups {
  constructor(app, connect) {
    this.app = app;
    this.GroupModel = connect.model('Group', GroupModel);
    this.UserModel = connect.model('User', UserModel);
    this.run();
  }

  /**
   * @swagger
   * /group:
   *   post:
   *     summary: Créer un groupe
   *     description: "Crée un nouveau groupe avec ses paramètres (type, description, admins, etc.)."
   *     tags: [Groups]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - admins
   *             properties:
   *               name:
   *                 type: string
   *                 example: Groupe Développeurs SNCF
   *               description:
   *                 type: string
   *                 example: Groupe de partage sur les technologies Angular et Node.js
   *               type:
   *                 type: string
   *                 enum: [public, private, secret]
   *                 example: public
   *               admins:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["67205f81c1f7baaf41d3d1b3"]
   *     responses:
   *       201:
   *         description: Groupe créé avec succès
   *       400:
   *         description: Erreur de validation ou mauvaise requête
   */
  create() {
    this.app.post('/group', async (req, res) => {
      try {
        const group = new this.GroupModel(req.body);
        const saved = await group.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /groups:
   *   get:
   *     summary: Récupérer tous les groupes
   *     description: "Retourne la liste de tous les groupes, y compris les admins et les membres."
   *     tags: [Groups]
   *     responses:
   *       200:
   *         description: Liste de tous les groupes
   *       500:
   *         description: Erreur interne du serveur
   */
  getAll() {
    this.app.get('/groups', async (req, res) => {
      try {
        const groups = await this.GroupModel.find()
          .populate('admins', 'firstname lastname email')
          .populate('members', 'firstname lastname email');
        res.status(200).json(groups);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  getById() {
    this.app.get('/group/:id', async (req, res) => {
      try {
        const group = await this.GroupModel.findById(req.params.id)
          .populate('admins', 'firstname lastname email')
          .populate('members', 'firstname lastname email');
        res.status(200).json(group || {});
      } catch {
        res.status(404).json({ code: 404, message: 'Group Not Found' });
      }
    });
  }

  addMember() {
    this.app.patch('/group/:id/addMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const userExists = await this.UserModel.findById(userId);
        if (!userExists) return res.status(404).json({ message: 'User not found' });

        if (!group.members.includes(userId)) {
          group.members.push(userId);
          await group.save();
        }

        res.status(200).json(group);
      } catch (err) {
        console.error(`[ERROR] addMember -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  removeMember() {
    this.app.patch('/group/:id/removeMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const userExists = await this.UserModel.findById(userId);
        if (!userExists) return res.status(404).json({ message: 'User not found' });

        group.members = group.members.filter(id => id.toString() !== userId);
        await group.save();

        res.status(200).json(group);
      } catch (err) {
        console.error(`[ERROR] removeMember -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  deleteById() {
    this.app.delete('/group/:id', async (req, res) => {
      try {
        const deleted = await this.GroupModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.addMember();
    this.removeMember();
    this.deleteById();
  }
};

export default Groups;

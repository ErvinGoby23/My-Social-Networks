import GroupModel from '../models/group.mjs';

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
    this.run();
  }

  /**
   * @swagger
   * /group:
   *   post:
   *     summary: Créer un groupe
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
   *                 example: EFREI Dev Team
   *               description:
   *                 type: string
   *                 example: Groupe des développeurs de la promo 2025
   *               icon:
   *                 type: string
   *                 example: "👨‍💻"
   *               type:
   *                 type: string
   *                 enum: [public, private, secret]
   *               admins:
   *                 type: array
   *                 items:
   *                   type: string
   *                   example: 671abc982b7f2c1d99d00f43
   *     responses:
   *       201:
   *         description: Groupe créé avec succès
   */
  create() {
    this.app.post('/group', async (req, res) => {
      try {
        const group = new this.GroupModel(req.body);
        const savedGroup = await group.save();
        res.status(201).json(savedGroup);
      } catch (err) {
        console.error(`[ERROR] groups/create -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /groups:
   *   get:
   *     summary: Récupérer tous les groupes
   *     tags: [Groups]
   *     responses:
   *       200:
   *         description: Liste de tous les groupes
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

  /**
   * @swagger
   * /group/{id}:
   *   get:
   *     summary: Récupérer un groupe par ID
   *     tags: [Groups]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Groupe trouvé
   *       404:
   *         description: Groupe introuvable
   */
  getById() {
    this.app.get('/group/:id', async (req, res) => {
      try {
        const group = await this.GroupModel.findById(req.params.id)
          .populate('admins', 'firstname lastname email')
          .populate('members', 'firstname lastname email');
        res.status(200).json(group || {});
      } catch (err) {
        res.status(404).json({ code: 404, message: 'Group Not Found' });
      }
    });
  }

  /**
   * @swagger
   * /group/{id}/addMember:
   *   put:
   *     summary: Ajouter un membre au groupe
   *     tags: [Groups]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 example: 671abc982b7f2c1d99d00f43
   *     responses:
   *       200:
   *         description: Membre ajouté avec succès
   */
  addMember() {
    this.app.put('/group/:id/addMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.includes(userId)) {
          group.members.push(userId);
          await group.save();
        }

        res.status(200).json(group);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /group/{id}/removeMember:
   *   put:
   *     summary: Retirer un membre du groupe
   *     tags: [Groups]
   */
  removeMember() {
    this.app.put('/group/:id/removeMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        group.members = group.members.filter(id => id.toString() !== userId);
        await group.save();

        res.status(200).json(group);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /group/{id}:
   *   delete:
   *     summary: Supprimer un groupe
   *     tags: [Groups]
   */
  deleteById() {
    this.app.delete('/group/:id', async (req, res) => {
      try {
        const deleted = await this.GroupModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
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

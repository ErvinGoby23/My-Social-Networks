import AlbumModel from '../models/album.mjs';
import PhotoModel from '../models/photo.mjs';

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Gestion des albums photos liés aux événements
 */
const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.run();
  }

  /**
   * @swagger
   * /album:
   *   post:
   *     summary: Créer un album photo pour un événement
   *     tags: [Albums]
   */
  createAlbum() {
    this.app.post('/album', async (req, res) => {
      try {
        const album = new this.AlbumModel(req.body);
        const saved = await album.save();
        res.status(201).json(saved);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  /**
   * @swagger
   * /album:
   *   get:
   *     summary: Récupérer tous les albums
   *     tags: [Albums]
   */
  getAllAlbums() {
    this.app.get('/album', async (req, res) => {
      const albums = await this.AlbumModel.find()
        .populate('event', 'name')
        .populate('createdBy', 'firstname lastname');
      res.status(200).json(albums);
    });
  }

  /**
   * @swagger
   * /album/{id}/photos:
   *   get:
   *     summary: Récupérer les photos d’un album
   *     tags: [Albums]
   */
  getPhotosByAlbum() {
    this.app.get('/album/:id/photos', async (req, res) => {
      try {
        const photos = await this.PhotoModel.find({ album: req.params.id })
          .populate('uploadedBy', 'firstname lastname');
        res.status(200).json(photos);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createAlbum();
    this.getAllAlbums();
    this.getPhotosByAlbum();
  }
};

export default Albums;

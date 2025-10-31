import AlbumModel from '../models/album.mjs';
import PhotoModel from '../models/photo.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.run();
  }

  createAlbum() {
    this.app.post('/album', async (req, res) => {
      try {
        const album = new this.AlbumModel(req.body);
        const saved = await album.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res
            .status(400)
            .json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  getAllAlbums() {
    this.app.get('/album', async (req, res) => {
      try {
        const albums = await this.AlbumModel.find()
          .populate('event', 'name')
          .populate('createdBy', 'firstname lastname');
        res.status(200).json(albums);
      } catch {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  getPhotosByAlbum() {
    this.app.get('/album/:id/photos', async (req, res) => {
      try {
        const photos = await this.PhotoModel.find({ album: req.params.id })
          .populate('uploadedBy', 'firstname lastname');
        res.status(200).json(photos);
      } catch {
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

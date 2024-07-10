const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet-controller');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

router.post('/create/:uid', authenticate, upload.single('url'), petController.newpet);

module.exports = router;

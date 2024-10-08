const previewhostService = require('../service/previewhostService');

exports.listPublishedHost = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const hosts = await previewhostService.listPublishedHosts(uid);
        res.status(200).json({
            status: 'success',
            data: hosts
        });
    } catch (err) {
        next(err);
    }
};

exports.listHostByID = async (req, res, next) => {
    try {
        const { hid } = req.params;
        const hosts = await previewhostService.listHostByID(hid);
        res.status(200).json({
            status: 'success',
            data: hosts
        });
    } catch (err) {
        next(err);
    }
};
const accommodationService = require("../service/accommodationService");
const { v4: uuidv4 } = require("uuid");
const cloudUpload = require("../utils/cloudUpload");

exports.createAccommodation = async (req, res, next) => {
    try {
        const {
            name,
            type,
            address,
            lat,
            long,
            description,
        } = req.body;
        const { uid } = req.params;

        if (!name || !type || !address || !lat || !long || !uid) {
            return res.status(400).json({ message: 'Name, type, address, latitude, longitude, and user ID are required.' });
        }
        
        const imagexPromiseArray = req.files.map((file) => cloudUpload(file.path));
        const imgUrlArray = await Promise.all(imagexPromiseArray);

        const id = uuidv4().replace(/-/g, '');
        const accommodationData = {
            id,
            name,
            type,
            address,
            lat,
            long,
            description,
            publish: false,
            userId: uid,
        };

        const hostdata = await accommodationService.createAccommodation(accommodationData);
        const images = imgUrlArray.map((imgUrl) => ({ url: imgUrl }));

        const hostId = hostdata.id;
        await accommodationService.createVerifyhost(hostId);
        await accommodationService.uploadPhotosHost({ images, hostId });

        res.status(201).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.listAccommodations = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const accommodations = await accommodationService.listAccommodationsWithImages(uid);

        res.status(200).json({
            status: 'success',
            data: accommodations,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateAccommodation = async (req, res, next) => {
    try {
        const { hid } = req.params;
        const {
            name,
            type,
            address,
            lat,
            long,
            description,
            publish
        } = req.body;

        const accommodation = await accommodationService.findAccommodationById(hid);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        const updatedData = {
            name: name !== undefined ? name : accommodation.name,
            type: type !== undefined ? type : accommodation.type,
            address: address !== undefined ? address : accommodation.address,
            lat: lat !== undefined ? lat : accommodation.lat,
            long: long !== undefined ? long : accommodation.long,
            description: description !== undefined ? description : accommodation.description,
            publish: publish !== undefined ? publish : accommodation.publish
        };

        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map(file => cloudUpload(file.path));
            const uploadedImageUrls = await Promise.all(imageUploadPromises);

            const newImages = uploadedImageUrls.map((url) => ({ url }));
            await accommodationService.uploadPhotosHost({ images: newImages, hostId: accommodation.id });
        }

        await accommodationService.updateAccommodation(hid, updatedData);

        res.status(200).json({
            message: "Accommodation updated successfully",
            accommodation: updatedData
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteAccommodation = async (req, res, next) => {
    try {
        const { hid } = req.params;

        const accommodation = await accommodationService.findAccommodationForDelete(hid);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        if (accommodation.rooms.length > 0) {
            return res.status(409).json({ message: "Cannot delete accommodation with rooms" });
        }

        await accommodationService.deleteAccommodationById(hid);

        res.status(200).json({
            status: "success",
            message: "Accommodation deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

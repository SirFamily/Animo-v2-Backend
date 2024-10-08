const userService = require("../service/userService");
const { v4: uuidv4 } = require("uuid");
const cloudUpload = require("../utils/cloudUpload");

exports.register = async (req, res, next) => {
    try {
        const {
            firstName, lastName, email, password, phone, birthday,
            address, subDistrict, district, province, postalCode, bio
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let url = null;
        if (req.file) {
            url = await cloudUpload(req.file.path);
        }

        const userExist = await userService.getUserByEmail(email);
        if (userExist) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const userId = uuidv4().replace(/-/g, '');
        const formattedBirthday = birthday ? new Date(birthday) : null;

        await userService.createUser({
            id: userId,
            firstName,
            lastName,
            email,
            password,
            phone,
            birthday: formattedBirthday,
            address,
            subDistrict,
            district,
            province,
            postalCode,
            bio,
            url,
        });

        res.status(201).json({ message: "Register success" });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const userExist = await userService.getUserByEmail(email);

        if (!userExist || userExist.password !== password) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        res.status(200).json({ message: "login success", data: userExist });
    } catch (err) {
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            birthday,
            address,
            subDistrict,
            district,
            province,
            postalCode,
            bio
        } = req.body;

        const user = await userService.findUserById(uid);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let url = user.url;
        if (req.file) {
            url = await cloudUpload(req.file.path);
        }

        const updatedData = {
            firstName: firstName !== undefined ? firstName : user.firstName,
            lastName: lastName !== undefined ? lastName : user.lastName,
            email: email !== undefined ? email : user.email,
            phone: phone !== undefined ? phone : user.phone,
            birthday: birthday !== undefined ? new Date(birthday) : user.birthday,
            address: address !== undefined ? address : user.address,
            subDistrict: subDistrict !== undefined ? subDistrict : user.subDistrict,
            district: district !== undefined ? district : user.district,
            province: province !== undefined ? province : user.province,
            postalCode: postalCode !== undefined ? postalCode : user.postalCode,
            bio: bio !== undefined ? bio : user.bio,
            url: url
        };
        await userService.updateUser(uid, updatedData);
        const updatedUser = await userService.findUserById(uid);

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        next(err);
    }
};

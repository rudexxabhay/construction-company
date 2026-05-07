const { Blob } = require("buffer");
const { getCloudinaryConfig, signUpload } = require("../config/cloudinary");

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required. Use the image field." });
    }

    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
    const timestamp = Math.round(Date.now() / 1000);
    const uploadParams = { folder, timestamp };
    const signature = signUpload(uploadParams, apiSecret);
    const formData = new FormData();

    formData.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status >= 500 ? 502 : 400).json({ message: data.error?.message || "Cloudinary upload failed." });
    }

    res.status(201).json({ url: data.secure_url, publicId: data.public_id });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };

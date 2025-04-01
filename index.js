const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
app.use(cors());

// Multer Memory Storage with File Size Limit (e.g., 5MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Health check route
app.get("/", (req, res) => {
    res.send("Image Crop API is running 🚀");
});

// Crop Route
app.post("/crop", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ error: "Only image files are allowed" });
        }

        const { x, y, width, height } = req.body;

        const cropX = parseInt(x);
        const cropY = parseInt(y);
        const cropWidth = parseInt(width);
        const cropHeight = parseInt(height);

        if (
            isNaN(cropX) || isNaN(cropY) ||
            isNaN(cropWidth) || isNaN(cropHeight) ||
            cropWidth <= 0 || cropHeight <= 0
        ) {
            return res.status(400).json({ error: "Invalid crop coordinates or dimensions" });
        }

        const croppedImageBuffer = await sharp(req.file.buffer)
            .extract({ left: cropX, top: cropY, width: cropWidth, height: cropHeight })
            .png() // Force PNG output (optional)
            .toBuffer();

        res.set("Content-Type", "image/png");
        res.send(croppedImageBuffer);
    } catch (error) {
        console.error("Error cropping image:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

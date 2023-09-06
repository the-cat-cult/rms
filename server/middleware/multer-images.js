import multer from "multer";
import * as fs from "fs";
import sharp from "sharp";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
    }
});

const upload = multer({storage: storage});

export default function (req, res, next) {
    upload.array('files', 5)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({error: err.message});
        }

        const files = req.files || [];
        const errors = [];

        if (!files || files.length === 0) {
            errors.push('No files uploaded');
        } else {
            for (const file of files) {
                const allowedTypes = ['image/jpeg', 'image/png'];
                //2mb nax file size

                if (!allowedTypes.includes(file.mimetype)) {
                    errors.push(`Invalid file type: ${file.originalname}`);
                }

                const targetFileSizeInBytes = 2 * 1024 * 1024; // 2MB

                if (file.size > targetFileSizeInBytes) {
                    let quality = 70;
                    let resizedImage = await sharp(file.buffer).resize(1200, 760);
                    let baseHeight = 760;
                    let baseWidth = 1200;
                    while (resizedImage.toBuffer().length > targetFileSizeInBytes) {
                        quality -= 5;
                        baseHeight -= 10;
                        baseWidth -= 10;
                        resizedImage = await sharp(file.buffer).resize(baseWidth, baseHeight).jpeg({quality});
                    }

                    await resizedImage.toFile(`uploads/${file.originalname}`);
                }
            }
        }

        if (errors.length > 0) {
            files.forEach((file) => {
                fs.unlinkSync(file.path);
            });

            return res.status(400).json({errors});
        }

        req.files = files;

        next();
    });
}

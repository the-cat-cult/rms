import multer from "multer";
import sharp from "sharp";
import path from "path";

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
        path.extname(file.originalname).toString()
    );
    const mimetype = filetypes.test(file.mimetype);

    console.log(path.extname(file.originalname).toString(), extname, mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({storage: multer.memoryStorage(), fileFilter});

export default function (req, res, next) {
    upload.array('files', 10)(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.status(400).json({error: err.message});
        }

        const files = req.files || [];
        const errors = [];

        if (!files || files.length === 0) {
            console.log("no files uploaded")
            return res.status(400).json({error: 'No valid files uploaded.'});
        } else {
            for (const file of files) {
                const allowedTypes = ['image/jpeg', 'image/png'];
                //2mb nax file size

                if (!allowedTypes.includes(file.mimetype)) {
                    errors.push(`Invalid file type: ${file.originalname}`);
                }

                const targetFileSizeInBytes = 1024 * 1024;

                if (file.size > targetFileSizeInBytes) {
                    let quality = 70;
                    let baseHeight = 480;
                    let baseWidth = 720;
                    let resizedImage = await sharp(file.buffer).resize({
                        height: baseHeight,
                        width: baseWidth,
                    }).jpeg({quality});

                    while (resizedImage.toBuffer().length > targetFileSizeInBytes) {
                        quality -= 5;
                        baseHeight -= 10;
                        baseWidth -= 10;

                        resizedImage = await sharp(file.buffer).resize({
                            height: baseHeight,
                            width: baseWidth,
                        }).jpeg({quality});

                    }

                    file.buffer = await resizedImage.toBuffer();
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        req.files = files;

        next();
    });
}

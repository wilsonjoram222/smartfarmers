const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Separate, NOT statically served directory for paid digital resources
// (PDFs sold on the storefront). Files here are only ever reachable through
// digitalResourceController.downloadResource, after a purchase is verified.
const privateResourceDir = path.join(__dirname, '../../private-uploads/resources');
if (!fs.existsSync(privateResourceDir)) {
    fs.mkdirSync(privateResourceDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const privateStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, privateResourceDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDF are allowed.'), false);
    }
};

const pdfOnlyFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for this upload.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

const uploadPrivate = multer({
    storage: privateStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: pdfOnlyFilter
});

const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadPrivatePDF = (fieldName) => uploadPrivate.single(fieldName);

module.exports = { uploadSingle, uploadMultiple, uploadPrivatePDF, privateResourceDir };
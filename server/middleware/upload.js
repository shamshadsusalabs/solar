// middleware/upload.js
import multer from "multer";

// Disk storage (save to /tmp for GCP App Engine compatibility)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // GCP App Engine compatible
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, filename);
  },
});

// File filter - only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf"
  ];

  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, PNG, GIF) and PDFs are allowed!"), false);
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// PDF-only filter
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// PDF upload middleware
export const uploadCompiledPDF = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("compiledFile");

export default upload;

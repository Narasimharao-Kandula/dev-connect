import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const imageFilter = (_req: any, file: any, cb: any) => {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
    return;
  }
  cb(null, true);
};

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".txt", ".zip", ".csv", ".json"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    cb(new Error(`File type ${ext} is not allowed`));
    return;
  }
  cb(null, true);
};

const avatarUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const messageUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
const projectUpload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter });

const router = Router();

router.post("/avatar", authenticate, avatarUpload.single("avatar"), async (req: any, res: any, next: any) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: avatarUrl },
      select: { id: true, avatar: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/message", authenticate, messageUpload.single("file"), async (req: any, res: any, next: any) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, name: req.file.originalname, size: req.file.size });
  } catch (err) {
    next(err);
  }
});

router.post("/project", authenticate, projectUpload.single("file"), async (req: any, res: any, next: any) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, name: req.file.originalname, size: req.file.size });
  } catch (err) {
    next(err);
  }
});

export default router;

const multer = require('multer');
const path = require('path');

let storageEngine;

// 1. Check for Cloudinary Config
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

// 2. Check for AWS S3 Config
const isS3Configured = 
    process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_BUCKET_NAME && 
    process.env.AWS_REGION;

if (isCloudinaryConfigured) {
    console.log("☁️ [Storage Utility] Cloudinary credentials detected. Initializing Cloudinary storage engine.");
    try {
        const cloudinary = require('cloudinary').v2;
        const { CloudinaryStorage } = require('multer-storage-cloudinary');
        
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        storageEngine = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'medicare_plus_uploads',
                allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'pdf'],
                public_id: (req, file) => {
                    const cleanName = file.originalname.replace(/\s+/g, '_').split('.')[0];
                    return `${Date.now()}-${cleanName}`;
                }
            }
        });
    } catch (err) {
        console.error("❌ [Storage Utility] Failed to load Cloudinary Storage. Falling back...", err.message);
    }
}

if (!storageEngine && isS3Configured) {
    console.log("☁️ [Storage Utility] AWS S3 credentials detected. Initializing AWS S3 storage engine.");
    try {
        const { S3Client } = require('@aws-sdk/client-s3');
        const multerS3 = require('multer-s3');
        
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        
        storageEngine = multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                cb(null, `medicare-plus/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
            }
        });
    } catch (err) {
        console.error("❌ [Storage Utility] Failed to load AWS S3 Storage. Falling back...", err.message);
    }
}

if (!storageEngine) {
    console.log("📂 [Storage Utility] No cloud storage credentials active. Using Local Disk Storage.");
    storageEngine = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
        }
    });
}

const upload = multer({ storage: storageEngine });

module.exports = upload;

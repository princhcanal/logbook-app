// let path = require('path');
// let crypto = require('crypto');
// let GridFsStorage = require('multer-gridfs-storage');
// let multer = require('multer');

// let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/logbook_app";

// // Create storage engine
// const storage = new GridFsStorage({
//     url: mongoURI,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//             crypto.randomBytes(16, (err, buf) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.originalname);
//                 const fileInfo = {
//                     filename: filename,
//                     bucketName: 'uploads'
//                 };
//                 resolve(fileInfo);
//             });
//         });
//     }
// });

// const upload = multer({
//     storage
// });

// module.exports = upload;
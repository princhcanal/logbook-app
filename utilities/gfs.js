// let mongoose = require('mongoose');
// // let Grid = require('gridfs-stream');

// let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/logbook_app";

// const conn = mongoose.createConnection(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
// });

// let gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db);

// let getGridFsBucket = async () => {
//     let gridFsBucket;
//     await conn.once('open', () => {
//         gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db);
//     });
//     return gridFsBucket;
// }

// // let getGfs = async () => {
// //     let gfs;
// //     await conn.once('open', () => {
// //         // Init stream
// //         gfs = Grid(conn.db, mongoose.mongo);
// //         gfs.collection('uploads');
// //     });
// //     return gfs;
// // }

// module.exports = getGridFsBucket;
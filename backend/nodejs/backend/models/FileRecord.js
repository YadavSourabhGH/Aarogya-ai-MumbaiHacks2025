const mongoose = require('mongoose');

const fileRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    tags: [{
        type: String,
    }],
    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, {
    timestamps: true,
});

const FileRecord = mongoose.model('FileRecord', fileRecordSchema);

module.exports = FileRecord;

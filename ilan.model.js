const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ilanSchema = new Schema({
    id: Schema.Types.ObjectId,
    ilanNo: {
        type: String,
        unique: true
    },
    baslik: String,
    model: String,
    yil: String,
    km: String,
    renk: String,
    fiyat: String,
    tarih: String,
    yer: String,
    link: String
});

module.exports = mongoose.model("ilanlar", ilanSchema);
const mongoose = require("mongoose");

const dynamic = mongoose.Schema({
  _id: String,
  value: {
    require: true,
    type: Array,
  },
});
module.exports = mongoose.model("DynamicFields", dynamic);

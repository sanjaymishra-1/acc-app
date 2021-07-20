const mongoose = require("mongoose");

const engineering_params = mongoose.Schema({
  document_id: String,
  created_at: {
    require: true,
    type: Number,
  },
  engineering_parameter1_value: {
    require: false,
    type: Number,
    default: 0,
  },
  engineering_parameter2_value: {
    require: false,
    type: Number,
    default: 0,
  },
  engineering_parameter3_value: {
    require: false,
    type: Number,
    default: 0,
  },
  engineering_parameter4_value: {
    require: false,
    type: Number,
    default: 0,
  },
  engineering_parameter5_value: {
    require: false,
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("EngineeringParams", engineering_params);

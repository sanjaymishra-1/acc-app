const dynamic = require("../models/dynamic");
const { createResponse } = require("../util/handler");

exports.getAllDynamicData = async (req, res, next) => {
  try {
    const dynamicData = await dynamic.find();
    var data = {};
    if (dynamicData) {
      dynamicData.forEach((item) => (data[item._id] = item.value));
      createResponse(res, data, { status: 1, message: "success" });
    } else {
      createResponse(res, [], {
        status: 0,
        message: "A server error occurred",
      });
    }
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};
exports.updateDynamicData = async (req, res, next) => {
  try {
    const dynamicData = await dynamic.findByIdAndUpdate(req.params.id, {
      value: req.body,
    });
    if (!dynamicData)
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
      });
    else createResponse(res, req.body, { status: 1, message: "success" });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};

exports.getDynamicDataById = async (req, res, next) => {
  try {
    const dynamicData = await dynamic.findById(req.params.id);
    console.log(dynamicData);
    if (!dynamicData)
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
      });
    else
      createResponse(res, dynamicData.value, { status: 1, message: "success" });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};

exports.addDynamicData = async (req, res, next) => {
  try {
    const existData = await dynamic.findById(req.body.id);
    if (existData) {
      createResponse(res, [], {
        status: 0,
        message: "Data already exist with id " + req.body.id,
      });
      return;
    }

    const dynamicData = await dynamic.create({
      _id: req.body.id,
      value: req.body.value,
    });
    if (!dynamicData)
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
      });
    else
      createResponse(res, req.body, {
        status: 1,
        message: "Data added successfully",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};

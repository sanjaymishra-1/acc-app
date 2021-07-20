const records = require("../models/records");
const { isNumber, getDate, createResponse } = require("../util/handler");
const { date_field } = require("../util/lists");
const { addNewParams } = require("./engineering_params");

exports.addData = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    //convert date field to millisecond
    data["last_edit_date"] = Date.now();
    date_field.forEach((item) =>
      data[item]
        ? isNumber(data[item])
          ? (data[item] = data[item])
          : (data[item] = getDate(data[item]))
        : 0
    );

    let record = await records.create(req.body);
    console.log(record, "value", record.value);
    if (record) {
      record = JSON.parse(JSON.stringify(record));
      record["id"] = record._id;
      delete record.__v;
      delete record._id;
      addNewParams({ id: record.id, ...data });
      createResponse(res, record, { status: 1, message: "success" });
    } else
      createResponse(res, [], {
        status: 0,
        message: "A server error occurred",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};
exports.updateData = async (req, res, next) => {
  try {
    const data = req.body;
    data["_id"] = req.params.id;
    //convert date field to millisecond
    data["last_edit_date"] = Date.now();
    date_field.forEach((item) =>
      data[item] && isNumber(data[item])
        ? (data[item] = data[item])
        : (data[item] = getDate(data[item]))
    );
    console.log("inside update", data, req.params.id);
    let found = await records.findById(req.params.id);
    if (!found)
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
      });
    else {
      let record = await records.findOneAndUpdate(
        { _id: { $eq: req.params.id } },
        { _id: req.params.id, ...data },
        { useFindAndModify: true }
      );
      console.log(record, "value", record.value);
      if (record) {
        //record = JSON.parse(JSON.stringify(record));
        //record["id"] = record._id;
        // delete record.__v;
        addNewParams(data);
        delete data["engineering_parameter_value_1"];
        delete data["engineering_parameter_value_2"];
        delete data["engineering_parameter_value_3"];
        delete data["engineering_parameter_value_4"];
        delete data["engineering_parameter_value_5"];
        delete req.body._id;

        createResponse(res, data, { status: 1, message: "success" });
      } else
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

exports.getData = async (req, res, next) => {
  try {
    const data = req.body;
    data["_id"] = req.params.id;
    let record = await records.findById(req.params.id);
    if (record) {
      record = JSON.parse(JSON.stringify(record));
      record["id"] = record._id;
      delete record.__v;
      delete record._id;
      createResponse(res, record, { status: 1, message: "success" });
    } else {
      console.log(error);
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
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
exports.deleteData = async (req, res, next) => {
  try {
    const data = req.body;
    data["_id"] = req.params.id;
    data["portfolio_status"] = "Closed";
    //convert date field to millisecond
    data["last_edit_date"] = Date.now();
    date_field.forEach((item) =>
      data[item] && isNumber(data[item])
        ? (data[item] = data[item])
        : (data[item] = getDate(data[item]))
    );
    console.log("inside update", data, req.params.id);
    let found = await records.findById(req.params.id);
    if (!found)
      createResponse(res, [], {
        status: 0,
        message: "Record not found",
      });
    else {
      let record = await records.findOneAndUpdate(
        { _id: { $eq: req.params.id } },
        { _id: req.params.id, ...data },
        { useFindAndModify: true }
      );
      console.log(record, "value", record.value);
      if (record) {
        createResponse(res, null, {
          status: 1,
          message: "Data deleted successfully",
        });
      } else
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

exports.executeSearch = async (req, res, next) => {
  try {
    let searchKey = req.body.searchKey;
    let parameters = req.body.parameters;
    if (!req.body.searchKey) {
      createResponse(res, [], {
        status: 0,
        message: "Search text not found",
      });
      return;
    }
    if (!req.body.parameters) {
      createResponse(res, [], {
        status: 0,
        message: "Search parameters not found",
      });
      return;
    }
    let record;
    let searchQuery = {};
    searchQuery[parameters] = { $regex: RegExp(searchKey, "i") };
    if (parameters === "all") {
      record = await records.find({
        $or: [
          { portfolio_anchor: { $regex: RegExp(searchKey, "i") } },
          { lob: { $regex: RegExp(searchKey, "i") } },
          { sub_lob: { $regex: RegExp(searchKey, "i") } },
          { rolled_up_sl: { $regex: RegExp(searchKey, "i") } },
          { portfolio_status: { $regex: RegExp(searchKey, "i") } },
          { master_project_code: { $regex: RegExp(searchKey, "i") } },
          { csg_anchor: { $regex: RegExp(searchKey, "i") } },
          { fsd_type: { $regex: RegExp(searchKey, "i") } },
          { contract_type: { $regex: RegExp(searchKey, "i") } },
          { type_of_work: { $regex: RegExp(searchKey, "i") } },
        ],
      });
    } else {
      if (parameters === "portfolio_status")
        record = await records.find(searchQuery);
      else {
        // {"$and": [{"key1": value1}, {"key2": value2}]}
        record = await records.find({
          $and: [{ portfolio_status: { $ne: "Closed" } }, { ...searchQuery }],
        });
      }
    }
    if (record) {
      var finalRecord = [];
      record.forEach((item) => {
        var tempJson = JSON.parse(JSON.stringify(item));
        tempJson["id"] = item._id;
        delete tempJson.__v;
        delete tempJson._id;
        finalRecord.push(tempJson);
      });
      createResponse(res, finalRecord, {
        status: 1,
        message: "success",
      });
    } else
      createResponse(res, [], {
        status: 0,
        message: "A server error occurred",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};

exports.getAllData = async (req, res, next) => {
  try {
    let record = await records.find({ portfolio_status: { $ne: "Closed" } });
    if (record) {
      var finalRecord = [];
      record.forEach((item) => {
        var tempJson = JSON.parse(JSON.stringify(item));
        delete tempJson.__v;
        delete tempJson._id;
        finalRecord.push(tempJson);
      });
      createResponse(res, finalRecord, {
        status: 1,
        message: "success",
      });
    } else
      createResponse(res, [], {
        status: 0,
        message: "A server error occurred",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "A server error occurred",
    });
  }
};

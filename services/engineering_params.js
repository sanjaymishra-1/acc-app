const engineering_params = require("../models/engineering_params");

exports.addNewParams = (data) => {
  let fields = {};
  fields["document_id"] = data.id;
  fields["engineering_parameter1_value"] = data.engineering_parameter_value_1;
  fields["engineering_parameter2_value"] = data.engineering_parameter_value_2;
  fields["engineering_parameter3_value"] = data.engineering_parameter_value_3;
  fields["engineering_parameter4_value"] = data.engineering_parameter_value_4;
  fields["engineering_parameter5_value"] = data.engineering_parameter_value_5;
  fields["created_at"] = Date.now();
  //if contains value in any field at to db
  if (
    fields.engineering_parameter1_value ||
    fields.engineering_parameter2_value ||
    fields.engineering_parameter3_value ||
    fields.engineering_parameter4_value ||
    fields.engineering_parameter5_value
  )
    engineering_params.create(fields);
};

exports.getParamsCodeByDocumentIdAndDate = async (documentId, dateJson) => {
  let record = await engineering_params
    .findOne({
      $and: [
        {
          created_at: {
            $gte: dateJson.from,
            $lte: dateJson.to,
          },
        },
        { document_id: { $eq: documentId } },
      ],
    })
    .sort({ created_at: -1 });
  return record;
};

exports.getDistinctDocumentIdsBetweenDate = async (from, to) => {
  console.log("from", from, "to", to);
  let record = await engineering_params.distinct("document_id", {
    created_at: { $gte: from, $lte: to },
  });
  console.log("record found ", record);
  return record;
};

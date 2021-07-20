const dynamic = require("../models/dynamic");
const records = require("../models/records");
const {
  createResponse,
  getDate,
  formatResultForReportResponse,
  formatResultForMeetingReport,
  generateMonthList,
  getDateFromMilli,
  convertJsonToKeyJson,
  formatEngineeringMatricesData,
} = require("../util/handler");
const { type_of_work } = require("../util/lists");
const {
  getParamsCodeByDocumentIdAndDate,
  getDistinctDocumentIdsBetweenDate,
} = require("./engineering_params");

exports.getRAGStatusReprotById = async (req, res, next) => {
  try {
    let id = req.params.id;
    console.log("id=", id);
    let finalResult = [];
    let ragList = ["rag_engagement", "rag_client_reporting", "rag_delivery"];
    if (id === "all") {
      for (const docId of ragList) {
        let rolledUpSL = await dynamic.findById("rolled_up_sl");
        console.log(rolledUpSL);
        let result = [];
        for (const doc of rolledUpSL.value) {
          let record = await records.aggregate([
            {
              $facet: {
                Red: [
                  {
                    $match: {
                      $and: [
                        { rolled_up_sl: { $eq: doc } },
                        { [docId]: { $eq: "Red" } },
                        { portfolio_status: { $ne: "Closed" } },
                      ],
                    },
                  },
                  { $count: "Red" },
                ],
                Amber: [
                  {
                    $match: {
                      $and: [
                        { rolled_up_sl: { $eq: doc } },
                        { [docId]: { $eq: "Amber" } },
                        { portfolio_status: { $ne: "Closed" } },
                      ],
                    },
                  },
                  { $count: "Amber" },
                ],
                Green: [
                  {
                    $match: {
                      $and: [
                        { rolled_up_sl: { $eq: doc } },
                        { [docId]: { $eq: "Green" } },
                        { portfolio_status: { $ne: "Closed" } },
                      ],
                    },
                  },
                  { $count: "Green" },
                ],
              },
            },
            {
              $project: {
                Red: { $arrayElemAt: ["$Red.Red", 0] },
                Amber: { $arrayElemAt: ["$Amber.Amber", 0] },
                Green: { $arrayElemAt: ["$Green.Green", 0] },
              },
            },
          ]);
          result.push({ [doc]: record });
        }
        finalResult.push({ docId, result });
      }
      finalResult = {
        htmlContent: `<div style='display: flex; justify-content: space-around' }}>
        <p></p>
        <p>RAG Status @Engagement</p>
        <p>RAG Status @Client Report</p>
        <p>RAG Status @Delivery</p>
      </div>`,
        ...formatResultForReportResponse(id, finalResult),
      };
    } else {
      const index = ragList.indexOf(id);
      if (index > -1) {
        ragList.splice(index, 1);
      }
      let fieldsList = {
        _id: 0,
        portfolio_name: 1,
        lob: 1,
        rolled_up_sl: 1,
        portfolio_anchor: 1,
        csg_anchor: 1,
        program_vp: 1,
        foreseen_risk: 1,
        risk_mitigation_plan: 1,
      };
      ragList.forEach((item) => (fieldsList[item] = 1));
      console.log(fieldsList);
      finalResult = await records.aggregate([
        {
          $match: {
            $and: [
              { [id]: { $in: ["Red", "Amber"] } },
              { portfolio_status: { $ne: "Closed" } },
            ],
          },
        },
        {
          $project: fieldsList,
        },
      ]);

      finalResult = {
        title: id + " (Reporting Red and Amber Programs)",
        ...formatResultForReportResponse(id, finalResult),
      };
    }
    console.log(finalResult);
    if (finalResult)
      createResponse(res, finalResult, {
        status: 1,
        message: "sucess",
      });
    else
      createResponse(res, [], {
        status: 0,
        message: "no result found",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "not found",
    });
  }
};

exports.getGovernanceMeetingByDate = async (req, res, next) => {
  try {
    console.log(req.body.from, req.body.to);
    let fromDate = getDate(req.body.from);
    let endDate = getDate(req.body.to);
    // let finalResult = [];
    let rolledUpSL = await dynamic.findById("lob");
    console.log(rolledUpSL);
    let result = [];
    for (const doc of rolledUpSL.value) {
      //let doc = "CIB";
      let record = await records.aggregate([
        {
          $facet: {
            meeting_with_md: [
              {
                $match: {
                  $and: [
                    { lob: { $eq: doc } },
                    { last_meeting_date_md: { $gte: fromDate, $lte: endDate } },
                    //{ portfolio_status: { $ne: "Closed" } },
                  ],
                },
              },
              { $count: "meeting_with_md" },
            ],
            meeting_with_director: [
              {
                $match: {
                  $and: [
                    { lob: { $eq: doc } },
                    {
                      last_meeting_date_director: {
                        $gte: fromDate,
                        $lte: endDate,
                      },
                    },
                    //{ portfolio_status: { $ne: "Closed" } },
                  ],
                },
              },
              { $count: "meeting_with_director" },
            ],
            meeting_with_vp: [
              {
                $match: {
                  $and: [
                    { lob: { $eq: doc } },
                    { last_meeting_date_vp: { $gte: fromDate, $lte: endDate } },
                    //{ portfolio_status: { $ne: "Closed" } },
                  ],
                },
              },
              { $count: "meeting_with_vp" },
            ],
          },
        },
        {
          $project: {
            meeting_with_md: {
              $arrayElemAt: ["$meeting_with_md.meeting_with_md", 0],
            },
            meeting_with_director: {
              $arrayElemAt: ["$meeting_with_director.meeting_with_director", 0],
            },
            meeting_with_vp: {
              $arrayElemAt: ["$meeting_with_vp.meeting_with_vp", 0],
            },
          },
        },
      ]);
      console.log(record);
      result.push({ [doc]: record });
    }

    console.log("finalResult", result);
    if (result)
      createResponse(res, formatResultForMeetingReport(result), {
        status: 1,
        message: "sucess",
      });
    else
      createResponse(res, [], {
        status: 0,
        message: "no result found",
      });
  } catch (error) {
    console.log(error);
    createResponse(res, [], {
      status: 0,
      message: "not found",
    });
  }
};

exports.getEngineeringMatrices = async (req, res, next) => {
  try {
    let typeOfWork = req.body.key;
    if (!typeOfWork) {
      createResponse(res, [], { status: 0, message: "type of work not found" });
      return;
    }
    typeOfWork = typeOfWork.replace("-", "/");
    console.log(typeOfWork);
    let result = {};
    let monthList = generateMonthList(req.body.from, req.body.to);
    var documentList = await getDistinctDocumentIdsBetweenDate(
      monthList[0].from,
      monthList[monthList.length - 1].to
    );
    if (documentList) {
      if (typeOfWork.toLowerCase() === "all") {
        for (let i = 0; i < type_of_work.length; i++) {
          let type = type_of_work[i];
          let list = await getEngineeringMatricesAnalysisResult(
            monthList,
            documentList,
            type
          );
          if (i === 0) result = addNewColumn("Type of work", type, list);
          else
            result.rows.push(...addNewColumn("Type of work", type, list).rows);
        }
      } else
        result = await getEngineeringMatricesAnalysisResult(
          monthList,
          documentList,
          typeOfWork
        );
    }
    createResponse(res, result, {
      status: 1,
      message: "success",
    });
  } catch (error) {
    console.log(error);
    createResponse(res, [], { status: 0, message: "not found" });
  }
};
const addNewColumn = (Colname, rowName, data) => {
  if (Colname) data.columns.unshift(Colname);
  let rows = [];
  data.rows.forEach((item, index) => {
    if (index === 0) item.unshift(rowName);
    else {
      //if last then add two spaces so that we get border in table column name at top
      if (index === data.rows.length - 1) item.unshift("");
      else item.unshift("  ");
    }
    rows.push(item);
  });
  data.rows = rows;
  return data;
};
const getEngineeringMatricesAnalysisResult = async (
  monthList,
  documentList,
  typeOfWork
) => {
  let result = {};
  for (let time of monthList) {
    let section = {};
    for (var i = 0; i < documentList.length; i++) {
      let docId = documentList[i];
      var engParams = await getParamsCodeByDocumentIdAndDate(docId, {
        from: time.from,
        to: time.to,
      });
      if (engParams) {
        let record = await records.findOne({ _id: docId });
        if (record && record.type_of_work === typeOfWork) {
          let json = {};
          if (record.engineering_parameter_1)
            json[record.engineering_parameter_1] =
              engParams.engineering_parameter1_value
                ? engParams.engineering_parameter1_value
                : 0;
          if (record.engineering_parameter_2)
            json[record.engineering_parameter_2] =
              engParams.engineering_parameter2_value
                ? engParams.engineering_parameter2_value
                : 0;

          if (record.engineering_parameter_3)
            json[record.engineering_parameter_3] =
              engParams.engineering_parameter3_value
                ? engParams.engineering_parameter3_value
                : 0;
          if (record.engineering_parameter_4)
            json[record.engineering_parameter_4] =
              engParams.engineering_parameter4_value
                ? engParams.engineering_parameter4_value
                : 0;
          if (record.engineering_parameter_5)
            json[record.engineering_parameter_5] =
              engParams.engineering_parameter5_value
                ? engParams.engineering_parameter5_value
                : 0;
          section[docId] = json;
        }
      }
    }
    result[getDateFromMilli(time.from)] = convertJsonToKeyJson(section);
  }
  return formatEngineeringMatricesData(result);
};

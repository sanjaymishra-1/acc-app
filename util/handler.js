const createResponse = (res, data, params) => {
  const json = {
    status: params.status,
    message: params.message,
    data: data,
  };
  if (params.status === 0) res.status(500).json(json);
  else res.json(json);
};
const isNumber = (text) => {
  if (typeof text === "number") return true;
  return /^\d+$/.test(text);
};
const getDate = (text) => {
  var date2 = new Date(text);
  return date2.getTime();
};
const formatResultForReportResponse = (id, data) => {
  let result = {};
  let parentColumn = [];
  let columns = [];
  let rows = [];
  if (id === "all") {
    data.forEach((item) => {
      let id = item.docId;
      let arr = [];
      item.result.forEach((doc) => {
        let colors = Object.values(doc)[0][0];
        arr.push([
          colors.Red ? colors.Red : 0,
          colors.Amber ? colors.Amber : 0,
          colors.Green ? colors.Green : 0,
        ]);
        if (!parentColumn.includes(Object.keys(doc)[0]))
          parentColumn.push(Object.keys(doc)[0]);
      });
      result[id] = arr;
    });

    columns = [
      "Rolled up SL",
      "Red",
      "Amber",
      "Green",
      "Red",
      "Amber",
      "Green",
      "Red",
      "Amber",
      "Green",
    ];
    let totalIndex = columns.length;
    //let counter=0;
    let keys = Object.keys(result);
    for (let i = 0; i < 7; i++) {
      let eng = result[keys[0]];
      //console.log(eng[i]);
      rows.push([
        parentColumn[i],
        ...result.rag_engagement[i],
        ...result.rag_client_reporting[i],
        ...result.rag_delivery[i],
      ]);
    }
    //calculate sum
    let sum = [...rows[0]];
    rows.forEach((item, index) => {
      if (index !== 0) {
        item.forEach((item2, i) => {
          if (i !== 0) {
            sum[i] += item2;
          }
        });
      }
    });
    sum[0] = "Grand Total";
    rows.push(sum);
  } else {
    console.log(data);
    columns = Object.keys(data[0]);
    data.forEach((item) => {
      rows.push(Object.values(item));
    });
  }
  console.log(columns, rows);
  return { columns, rows };
};
const formatResultForMeetingReport = (data) => {
  let rows = [];
  data.forEach((item) => {
    let docId = Object.keys(item)[0];
    let doc = item[docId][0];
    //table.push([]);
    rows.push([
      docId,
      doc.meeting_with_vp ? doc.meeting_with_vp : 0,
      doc.meeting_with_director ? doc.meeting_with_director : 0,
      doc.meeting_with_md ? doc.meeting_with_md : 0,
    ]);
  });
  return {
    columns: [
      "LOB Name",
      "Meetings with VPs",
      "Meetings with Director",
      "Meetings with MDs",
    ],
    rows,
  };
};

const formatEngineeringMatricesData = (data) => {
  let rows = [];
  let columns = Object.keys(data);
  let engParams = [];
  //fetch Eng params
  Object.keys(data).forEach((item) => {
    let itemList = Object.keys(data[item]);
    if (itemList.length) {
      itemList.forEach((doc) => {
        if (!engParams.includes(doc)) engParams.push(doc);
      });
    }
  });
  // console.log("final ", engParams, "columns", columns);
  //creation of rows
  engParams.forEach((param) => {
    let rec = [param];
    columns.forEach((item) => {
      console.log(data[item][param]);
      rec.push(
        data[item][param]
          ? data[item][param].sum / data[item][param].count + "%"
          : 0
      );
    });
    rows.push(rec);
  });
  columns.unshift("Engineering Parameters");
  return { columns, rows };
};

const generateMonthList = (startDate, endDate) => {
  let lastDate = new Date(endDate);
  lastDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1, 1));
  var theyear = lastDate.getFullYear();
  var themonth = lastDate.getMonth() + 1;
  var thetoday = lastDate.getDate();
  endDate = theyear + "-" + themonth + "-" + thetoday;

  var start = startDate.split("-");
  var end = endDate.split("-");
  var startYear = parseInt(start[0]);
  var endYear = parseInt(end[0]);
  var dates = [];
  let result = [];
  for (var i = startYear; i <= endYear; i++) {
    var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
    var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
    for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
      var month = j + 1;
      var displayMonth = month < 10 ? "0" + month : month;
      dates.push([i, displayMonth, "01"].join("-"));
    }
  }
  dates.forEach((item, index) => {
    if (index < dates.length - 1)
      result.push({
        from: new Date(item + "T00:00:01").getTime(),
        to: new Date(dates[index + 1] + "T00:00:00").getTime(),
      });
  });
  return result;
};
const convertJsonToKeyJson = (data) => {
  let parentJson = {};
  Object.keys(data).forEach((doc) => {
    //console.log(data[doc])
    Object.keys(data[doc]).forEach((item) => {
      let value = data[doc][item];
      console.log();
      if (parentJson.hasOwnProperty(item)) {
        //console.log(doc[item]);
        parentJson[item].sum += value;
        parentJson[item].count += 1;
      } else parentJson[item] = { sum: value, count: 1 };
    });
  });
  return parentJson;
};
const getDateFromMilli = (milli) => {
  var d = new Date(milli);
  return (
    d.toLocaleString("en-IN", { month: "long" }).substr(0, 3) +
    "-" +
    d.getFullYear()
  );
};

module.exports = {
  createResponse,
  isNumber,
  getDate,
  formatResultForReportResponse,
  formatResultForMeetingReport,
  generateMonthList,
  convertJsonToKeyJson,
  getDateFromMilli,
  formatEngineeringMatricesData,
};

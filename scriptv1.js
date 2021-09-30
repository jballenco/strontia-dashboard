"use strict";

const reservoir = {
  name: "Strontia Reservoir",
  abbrev: "STRRESCO",
  coordinates: { lat: 39.557148, lng: -105.062949 },
  link: "https://dwr.state.co.us/tools/stations/STRRESCO",
};
function addRow(tableID, tabArr) {
  let tableRef = document.getElementById(tableID);
  let newRow = tableRef.insertRow();
  for (let i = 0; i < 5; i++) {
    let newCell = newRow.insertCell();
    let newText = document.createTextNode(tabArr[i]);
    newCell.appendChild(newText);
  }
}

let labels;
let data;
let currentElev;

const timeIntArr = [4, 8, 12, 24];
const elevChange = [],
  ftPerHour = [],
  ftPerDay = [];

const connStr =
  "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeseriesraw/?format=json&dateFormat=spaceSepToMinutes&fields=measDateTime%2CmeasValue&abbrev=";

const connGageLink = "https://dwr.state.co.us/tools/stations/";

let request = new XMLHttpRequest();
request.open(
  "GET",
  connStr +
    reservoir.abbrev +
    "&includeThirdParty=true&parameter=ELEV&startDate=" +
    moment().subtract(4, "days").format("MM/DD/YYYY")
);
request.onload = function () {
  let responseStr = request.response;
  let respObj = JSON.parse(request.response);
  console.log(respObj);
  for (let i = 0; i < 4; i++) {
    //code to calculate rate change
    let x1 =
      respObj.ResultList[respObj.ResultCount - (1 + timeIntArr[i] * 4)]
        .measDateTime;
    let x2 = respObj.ResultList[respObj.ResultCount - 1].measDateTime;
    let y1 =
      respObj.ResultList[respObj.ResultCount - (1 + timeIntArr[i] * 4)]
        .measValue;
    let y2 = respObj.ResultList[respObj.ResultCount - 1].measValue;

    let deltaTime =
      moment(x2, "YYYY-MM-DD HH:mm").diff(
        moment(x1, "YYYY-MM-DD HH:mm"),
        "minutes"
      ) / 60; //hours
    let deltaElev = y2 - y1;
    elevChange.push(deltaElev.toFixed(2));
    ftPerHour.push((deltaElev / deltaTime).toFixed(2));
    ftPerDay.push((deltaElev / (deltaTime / 24)).toFixed(2));
    addRow("StrontiaTable", [
      `${timeIntArr[i]} hours`,
      elevChange[i],
      ftPerHour[i],
      ftPerDay[i],
      (Number(ftPerDay[i]) + y2).toFixed(2),
    ]);
  }
  reservoir["DataSet"] = respObj.ResultList;
  // reservoir["ElevationChange"] = elevChange;
  // reservoir["FPH"] = ftPerHour;
  // reservoir["FPD"] = ftPerDay;
  // console.log(reservoir);
  labels = reservoir.DataSet.map(function (e) {
    return moment(e.measDateTime).format("M/D/YY HH:mm");
  });
  data = reservoir.DataSet.map(function (e) {
    return e.measValue;
  });

  new Chart(document.getElementById("StrontiaChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "elevation (ft)",
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: data,
        },
      ],
    },
    options: {
      legend: {
        labels: {
          display: false,
          fontColor: "black",
        },
      },
      scales: {
        xAxes: [
          {
            type: "time",
            ticks: {
              maxRotation: 90,
              minRotation: 900,
              autoSkip: false,
              maxTicksLimit: 10,
              stepSize: 2,
            },
          },
        ],
      },
    },
  });
};

request.send();
// window.onload;

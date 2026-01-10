let allData = [];

d3.text("violations_by_street.csv", function(data) {
    allData = d3.csv.parseRows(data);
    
    console.log("Data loaded:", allData.length, "rows");
    console.log("First row:", allData[0]);
    
    // Initial render
    renderTable();
});

function renderTable() {
    console.log("Rendering table...");
    
    d3.select("#parking_table").html("");
    
    var container = d3.select("#parking_table")
        .append("table");
    
    container.selectAll("tr")
        .data(allData).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
    
    console.log("Table rendered");
}

let allData = [];
let selectedViolation = "all";

d3.text("violations_by_street.csv", function(data) {
    allData = d3.csv.parseRows(data);
    
    // Populate dropdown with violation types
    var headers = allData[0];
    var violationTypes = headers.slice(1);
    
    d3.select("#violation-select")
        .selectAll("option.violation-option")
        .data(violationTypes)
        .enter()
        .append("option")
        .attr("class", "violation-option")
        .attr("value", d => d)
        .text(d => d);
    
    // Listen for dropdown changes
    d3.select("#violation-select").on("change", function() {
        selectedViolation = this.value;
        renderTable();
    });
    
    // Initial render
    renderTable();
});

function renderTable() {
    d3.select("#parking_table").html("");
    
    var container = d3.select("#parking_table").append("table");
    
    if (selectedViolation === "all") {
        container.selectAll("tr")
            .data(allData).enter()
            .append("tr")
            .selectAll("td")
            .data(function(d) { return d; }).enter()
            .append("td")
            .text(function(d) { return d; });
    } 
}
else {
        var headers = allData[0]

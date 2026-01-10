let allData = [];
let selectedViolations = []; // Track which violations are selected

d3.text("violations_by_street.csv", function(data) {
    allData = d3.csv.parseRows(data);
    
    // Get headers (violation types)
    var headers = allData[0];
    var violationTypes = headers.slice(1); // All columns except street_name
    
    // Create checkboxes for each violation type
    var checkboxContainer = d3.select("#violation-checkboxes");
    
    violationTypes.forEach(function(violation) {
        var label = checkboxContainer.append("label")
            .style("display", "block")
            .style("margin", "5px 0");
        
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", violation)
            .attr("class", "violation-checkbox")
            .property("checked", true); // All checked by default
        
        label.append("span")
            .text(" " + violation);
    });
    
    // Apply filter button
    d3.select("#apply-filter").on("click", function() {
        selectedViolations = [];
        d3.selectAll(".violation-checkbox:checked").each(function() {
            selectedViolations.push(this.value);
        });
        renderTable();
    });
    
    // Reset button - show all violations
    d3.select("#reset-filter").on("click", function() {
        d3.selectAll(".violation-checkbox").property("checked", true);
        selectedViolations = [];
        renderTable();
    });
    
    // Initial render with all data
    renderTable();
});

function renderTable() {
    d3.select("#parking_table").html("");
    
    var headers = allData[0];
    var displayData;
    
    if (selectedViolations.length === 0) {
        // Show all columns
        displayData = allData;
    } else {
        // Show only selected violation columns + street name
        var columnIndices = [0]; // Always include street_name (first column)
        
        selectedViolations.forEach(function(violation) {
            var index = headers.indexOf(violation);
            if (index !== -1) {
                columnIndices.push(index);
            }
        });
        
        // Filter data to only include selected columns
        displayData = allData.map(function(row) {
            return columnIndices.map(function(i) {
                return row[i];
            });
        });
    }
    
    var container = d3.select("#parking_table")
        .append("table");
    
    container.selectAll("tr")
        .data(displayData).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

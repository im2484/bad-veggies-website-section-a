let allData = [];
let selectedViolations = [];
let dropdownOpen = false;
let searchQuery = ""; // NEW: Track search query

d3.text("violations_by_street.csv", function(data) {
    allData = d3.csv.parseRows(data);
    
    var headers = allData[0];
    var violationTypes = headers.slice(1);
    
    // Create checkboxes
    var checkboxContainer = d3.select("#violation-checkboxes");
    
    violationTypes.forEach(function(violation) {
        var label = checkboxContainer.append("label")
            .style("display", "block")
            .style("margin", "5px 0");
        
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", violation)
            .attr("class", "violation-checkbox")
            .property("checked", true);
        
        label.append("span")
            .text(" " + violation);
    });
    
    // Toggle dropdown
    d3.select("#dropdown-toggle").on("click", function() {
        dropdownOpen = !dropdownOpen;
        var menu = d3.select("#dropdown-menu");
        
        if (dropdownOpen) {
            menu.classed("dropdown-hidden", false)
                .classed("dropdown-visible", true);
            d3.select("#dropdown-toggle").text("Select Violations ▲");
        } else {
            menu.classed("dropdown-visible", false)
                .classed("dropdown-hidden", true);
            d3.select("#dropdown-toggle").text("Select Violations ▼");
        }
    });
    
    // Apply filter
    d3.select("#apply-filter").on("click", function() {
        selectedViolations = [];
        d3.selectAll(".violation-checkbox:checked").each(function() {
            selectedViolations.push(this.value);
        });
        renderTable();
    });
    
    // Reset violations
    d3.select("#reset-filter").on("click", function() {
        d3.selectAll(".violation-checkbox").property("checked", true);
        selectedViolations = [];
        renderTable();
    });
    
    // NEW: Search input listener
    d3.select("#street-search").on("input", function() {
        searchQuery = this.value.toLowerCase().trim();
        renderTable();
    });
    
    // NEW: Clear search button
    d3.select("#clear-search").on("click", function() {
        d3.select("#street-search").property("value", "");
        searchQuery = "";
        renderTable();
    });
    
    // Initial render
    renderTable();
});

function renderTable() {
    d3.select("#parking_table").html("");
    
    var headers = allData[0];
    var displayData;
    
    // Filter by selected violations
    if (selectedViolations.length === 0) {
        displayData = allData;
    } else {
        var columnIndices = [0];
        
        selectedViolations.forEach(function(violation) {
            var index = headers.indexOf(violation);
            if (index !== -1) {
                columnIndices.push(index);
            }
        });
        
        displayData = allData.map(function(row) {
            return columnIndices.map(function(i) {
                return row[i];
            });
        });
    }
    
    // NEW: Filter by search query
    if (searchQuery !== "") {
        displayData = displayData.filter(function(row, index) {
            if (index === 0) return true; // Keep header row
            var streetName = row[0].toLowerCase();
            return streetName.includes(searchQuery);
        });
    }
    
    var container = d3.select("#parking_table").append("table");
    
    container.selectAll("tr")
        .data(displayData).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

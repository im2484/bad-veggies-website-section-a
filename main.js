let allData = [];
let selectedViolations = [];
let dropdownOpen = false;
let searchQuery = "";
let sortDirection = {}; // ADD THIS - needed for sorting

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
    
    // Search input listener
    d3.select("#street-search").on("input", function() {
        searchQuery = this.value.toLowerCase().trim();
        renderTable();
    });
    
    // Clear search button
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
    
    // Filter by search query
    if (searchQuery !== "") {
        displayData = displayData.filter(function(row, index) {
            if (index === 0) return true;
            var streetName = row[0].toLowerCase();
            return streetName.includes(searchQuery);
        });
    }
    
    var container = d3.select("#parking_table").append("table");
    
    // Create header row with sort icons
    var headerRow = displayData[0];
    var thead = container.append("thead").append("tr");
    
    thead.selectAll("th")
        .data(headerRow)
        .enter()
        .append("th")
        .html(function(d, i) {
            if (i > 0) {
                return d + ' <span class="sort-icon" data-column="' + i + '">⇅</span>';
            }
            return d;
        })
        .on("click", function(event, d) {
            var target = event.target;
            var columnIndex;
            
            if (target.classList && target.classList.contains("sort-icon")) {
                columnIndex = parseInt(target.getAttribute("data-column"));
                sortTable(columnIndex, displayData);
            } else {
                var sortIcon = d3.select(target).select(".sort-icon");
                columnIndex = sortIcon.attr("data-column");
                if (columnIndex) {
                    sortTable(parseInt(columnIndex), displayData);
                }
            }
        });
    
    // Create body rows
    var tbody = container.append("tbody");
    tbody.selectAll("tr")
        .data(displayData.slice(1)).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

function sortTable(columnIndex, displayData) {
    if (!sortDirection[columnIndex]) {
        sortDirection[columnIndex] = "desc";
    } else if (sortDirection[columnIndex] === "desc") {
        sortDirection[columnIndex] = "asc";
    } else {
        sortDirection[columnIndex] = "desc";
    }
    
    var headers = displayData[0];
    var dataRows = displayData.slice(1);
    
    dataRows.sort(function(a, b) {
        var aVal = parseFloat(a[columnIndex]) || 0;
        var bVal = parseFloat(b[columnIndex]) || 0;
        
        if (sortDirection[columnIndex] === "desc") {
            return bVal - aVal;
        } else {
            return aVal - bVal;
        }
    });
    
    var sortedData = [headers].concat(dataRows);
    
    d3.select("#parking_table").html("");
    var container = d3.select("#parking_table").append("table");
    
    var thead = container.append("thead").append("tr");
    thead.selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .html(function(d, i) {
            if (i > 0) {
                var icon = "⇅";
                if (sortDirection[i] === "desc") {
                    icon = "▼";
                } else if (sortDirection[i] === "asc") {
                    icon = "▲";
                }
                return d + ' <span class="sort-icon" data-column="' + i + '">' + icon + '</span>';
            }
            return d;
        })
        .on("click", function(event, d) {
            var target = event.target;
            var colIndex;
            
            if (target.classList && target.classList.contains("sort-icon")) {
                colIndex = parseInt(target.getAttribute("data-column"));
                sortTable(colIndex, sortedData);
            } else {
                var sortIcon = d3.select(target).select(".sort-icon");
                colIndex = sortIcon.attr("data-column");
                if (colIndex) {
                    sortTable(parseInt(colIndex), sortedData);
                }
            }
        });
    
    var tbody = container.append("tbody");
    tbody.selectAll("tr")
        .data(dataRows).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

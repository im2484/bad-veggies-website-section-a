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
            if (index === 0) return true; // Keep header row
            var streetName = row[0].toLowerCase();
            return streetName.includes(searchQuery);
        });
    }
    
    var container = d3.select("#parking_table").append("table");
    
    // NEW: Create header row with sort icons
    var headerRow = displayData[0];
    var thead = container.append("thead").append("tr");
    
    thead.selectAll("th")
        .data(headerRow)
        .enter()
        .append("th")
        .html(function(d, i) {
            // Add sort icon for numeric columns (all except first column which is street_name)
            if (i > 0) {
                return d + ' <span class="sort-icon" data-column="' + i + '">⇅</span>';
            }
            return d;
        })
        .on("click", function(event, d) {
            var columnIndex = d3.select(event.target).select(".sort-icon").attr("data-column");
            if (columnIndex) {
                sortTable(parseInt(columnIndex), displayData);
            }
        });
    
    // Create body rows (skip header)
    var tbody = container.append("tbody");
    tbody.selectAll("tr")
        .data(displayData.slice(1)).enter()  // Skip first row (headers)
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

// NEW: Sort function
let sortDirection = {}; // Track sort direction for each column

function sortTable(columnIndex, displayData) {
    // Toggle sort direction
    if (!sortDirection[columnIndex]) {
        sortDirection[columnIndex] = "desc";
    } else if (sortDirection[columnIndex] === "desc") {
        sortDirection[columnIndex] = "asc";
    } else {
        sortDirection[columnIndex] = "desc";
    }
    
    var headers = displayData[0];
    var dataRows = displayData.slice(1); // Get all rows except header
    
    // Sort the data
    dataRows.sort(function(a, b) {
        var aVal = parseFloat(a[columnIndex]) || 0;
        var bVal = parseFloat(b[columnIndex]) || 0;
        
        if (sortDirection[columnIndex] === "desc") {
            return bVal - aVal;
        } else {
            return aVal - bVal;
        }
    });
    
    // Rebuild displayData with sorted rows
    var sortedData = [headers].concat(dataRows);
    
    // Re-render table with sorted data
    d3.select("#parking_table").html("");
    var container = d3.select("#parking_table").append("table");
    
    // Recreate header with sort icons
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
            if (target.classList.contains("sort-icon")) {
                var colIndex = parseInt(target.getAttribute("data-column"));
                sortTable(colIndex, sortedData);
            } else {
                var sortIcon = d3.select(target).select(".sort-icon");
                var colIndex = sortIcon.attr("data-column");
                if (colIndex) {
                    sortTable(parseInt(colIndex), sortedData);
                }
            }
        });
    
    // Recreate body
    var tbody = container.append("tbody");
    tbody.selectAll("tr")
        .data(dataRows).enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; }).enter()
        .append("td")
        .text(function(d) { return d; });
}

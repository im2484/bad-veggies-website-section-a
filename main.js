d3.text("violations_by_street.csv", function(data) {
    var parsedCSV = d3.csv.parseRows(data);

    var container = d3.select("#parking_table")
        .append("table")

        .selectAll("tr")
            .data(parsedCSV).enter()
            .append("tr")

        .selectAll("td")
            .data(function(d) { return d; }).enter()
            .append("td")
            .text(function(d) { return d; });
});

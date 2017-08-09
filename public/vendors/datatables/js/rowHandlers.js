function addRowHandlers() {
    var table = document.getElementById("example");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        var createClickHandler = 
            function(row) {
                return function() { 
	                var cell_id = row.getElementsByTagName("td")[0];
	                var id = cell_id.innerHTML;
	                alert("id: " + id);
	            };
            };
        currentRow.onclick = createClickHandler(currentRow);
    }
}
window.onload = addRowHandlers();
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
                    //Add clicked cell text to html page name t_id
                    document.getElementById("t_id").innerHTML = id;
                    //Send row clicked id to edit html page
                    document.getElementById("tableID").submit();
                };
            };
        currentRow.onclick = createClickHandler(currentRow);
        }
    }
    window.onload = addRowHandlers();
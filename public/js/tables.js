$('#example').dataTable( {
    "columnDefs": [
        { "sType": "date-uk", "targets": 5 }
      ],
        "aaSorting": [[ 5, "desc" ]] // column #7 sorted (zero indexed)
    } );
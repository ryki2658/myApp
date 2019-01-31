
module.exports = {
	formatDate: function formatDate(date) {
		date = new Date();
	  	var monthNames = [
	    	"JAN", "FEB", "MAR",
	    	"APR", "MAY", "JUN", "JUL",
	    	"AUG", "SEP", "OCT",
	    	"NOV", "DEC"
	  	];

	  	var day = date.getDate();
	  	var monthIndex = date.getMonth();
		  var year = date.getFullYear();

	  	return day + '-' + monthNames[monthIndex] + '-' + year;
	}
};

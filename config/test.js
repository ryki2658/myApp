
module.exports = {
	formatDate: function formatDate(date) {
		var date = new Date();
	  	var monthNames = [
	    	"Jan", "Feb", "Mar",
	    	"Apr", "May", "Jun", "Jul",
	    	"Aug", "Sep", "Oct",
	    	"Nov", "Dec"
	  	];

	  	var day = date.getDate();
	  	var monthIndex = date.getMonth();
	  	var year = date.getFullYear();

	  	return monthNames[monthIndex] + '/' + day + '/' + year;
	}
};

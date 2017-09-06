$(document).ready(function() {

  $("#native").bootstrapSwitch();
  $("#native").on('switchChange.bootstrapSwitch', function(event, state) {
    var nativeLanguage = $("#native").bootstrapSwitch('state');
    if (nativeLanguage) {
      $('#level').select2('enable',false);
      $('#level').select2('val', '');
    } else {
      $('#level').select2('enable',true);
    }
  });
  
  var table = $("#langTable");
  $("#languagePanel").hide();

  $('#language').select2({
    placeholder: "select a new language...",
    width: '200px',
    cache: true,
    ajax: {
      url: 'language.json',
      dataType: 'json',
      quietMillis: 100,
      results: function(data) {
        var dataResults = [];
        $.each(data, function(index, item) {
          dataResults.push({
            id: item.id,
            text: item.language
          });
        });
        return {
          results: dataResults
        };
      }
    },
    initSelection: function(element, callback) {
      var data = {
        id: element.id,
        text: element.language
      };
      callback(data);
    }
  });

  $('#level').select2({
    placeholder: "your language level...",
    width: '200px',
    cache: true,
    ajax: {
      url: 'level.json',
      dataType: 'json',
      quietMillis: 100,
      results: function(data) {
        var dataResults = [];
        $.each(data, function(index, item) {
          dataResults.push({
            id: item.id,
            text: item.level
          });
        });
        return {
          results: dataResults
        };
      }
    }
  });

  $('#lookingFor').select2({
    placeholder: "you're looking for...",
    width: '250px',
    multiple: true,
    cache: true,
    ajax: {
      url: 'looking.json',
      dataType: 'json',
      quietMillis: 100,
      results: function(data) {
        var dataResults = [];
        $.each(data, function(index, item) {
          dataResults.push({
            id: item.id,
            text: item.role
          });
        });
        return {
          results: dataResults
        };
      }
    }
  });

  table.bootstrapTable();
  table.on('load-success.bs.table', function(event, data) {
    $(this).bootstrapTable('hideColumn', 'id');
  });

  $("#addAction").click(function(event) {
    $("#languagePanel").show(750);
    
    var panelData = {
                      language: {
                        id: 0, 
                        text: ''
                      },
                      native: false,
                      level: {
                        id: '0',
                        text: ''
                      }
                    };
    setLanguageForm(panelData);
  });

  $("#editAddPanel-cancel").click(function(event) {
    $("#languagePanel").hide(750);
  });

  $("#editAddPanel-send").on('click', function(event) {
    var lookingData = $("#lookingFor").select2('data');
    var lookingForValueArray = [];
    $.each(lookingData, function (index, item) {
      lookingForValueArray.push(item.text);
    });
    var lookingForValue = lookingForValueArray.join();
    var nativeLan = $("#native").bootstrapSwitch('state');
    var levelLan = "Native";
    if (!native) {
      levelLan = $("#level").select2('data').text;
    }
    var row = {
      id: $("#language").select2('val'),
      language: $("#language").select2('data').text,
      native: nativeLan,
      level: levelLan,
      looking: lookingForValue
    };
    table.bootstrapTable('append', row);
    $("#languagePanel").hide(750);
  });


});

function formatNativeItem(value, row, index) {
  if (value) {
    return ['<i class="fa fa-check fa-2x" style="color: green;"></i>'];
  } else {
    return ['<i class="fa fa-remove fa-2x" style="color: red;"></i>'];
  }
}

function operateFormatter(value, row, index) {
  return ['<a class="lan-remove" href="javascript:void(0);" title="Remove">',
    '<i class="fa fa-trash fa-2x pull-right" style="margin-right:5px"></i>',
    '</a>',
    '<a class="lan-edit" href="javascript:void(0);" title="Edit">',
    '<i class="fa fa-pencil-square-o fa-2x pull-right"></i>',
    '</a>'].join(' ');
}

function setLanguageForm(panelData) {
  $("#language").select2('data', panelData.language);
  $("#native").bootstrapSwitch('state', panelData.native);
  $("#level").select2('data', panelData.level);
  $("#lookingFor").select2('data', panelData.looking);
}

window.operateEvents = {
  "click .lan-remove": function(event, value, row, index) {
    var table = $("#langTable");
    var arrayIds = [];
    arrayIds.push(row.id);
    table.bootstrapTable('remove', {
      field: 'id',
      values: arrayIds
    });
  },
  "click .lan-edit": function(event, value, row, index) {
    $("#languagePanel").show(750);
    var lookingData = row.looking.split(',');
    var lookingJSON = [];
    $.each(lookingData, function(index, chunk) {
      var lookingItem = { id: index, text: chunk };
      lookingJSON.push(lookingItem);
    });
    var panelData = {
                      language: {
                        id: row.id, 
                        text: row.language
                      },
                      native: row.native,
                      level: {
                        id: '0',
                        text: row.level
                      },
                      looking: lookingJSON
                    };
    setLanguageForm(panelData);
    $('html, body').animate({
      scrollTop: $("#languagePanel").offset().top
    }, 500);
  }
};
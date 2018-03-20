var datefield = $('#datefield');
var extendedOrOvernight = $('#extendedOrOvernight');

var formBuilder = (function() {

    var locations = ['2', '3', '13', '4', '1', '6', '7', '8', '9', '10', '11'];

    var fullLocations = {
        '2': 'Computer Workstations',
        '3': 'First Floor Work Tables',
        '13': 'Mezzanine Work Tables',
        '4': 'Soft Seating',
        '1': 'Stacks',
        '6': 'Room 100C',
        '7': 'Room 100D',
        '8': 'Room 100E',
        '9': 'Room 239',
        '10': 'Room 240',
        '11': 'Room 241'
    };

    var timesBySchedule = {
        'nineToEleven': ['09:00', '11:00', '12:00', '13:00', '15:00', '17:00', '19:00', '21:00', '22:00', '23:00'],
        'nineToFour': ['09:00', '11:00', '12:00', '13:00', '15:00','16:00'],
        'elevenToFive': ['11:00', '12:00', '13:00',  '15:00', '16:00', '17:00'],
        'threeToEleven': ['15:00', '17:00', '19:00', '21:00', '22:00', '23:00'],
        'overnight': ['00:00', '02:00', '04:00', '06:00', '08:00'],
        'extended': ['18:00', '19:00', '20:00'],
        'sundayExtended': ['11:00', '12:00', '13:00']
    };

    var getDayOfWeek = function () {
        return datefield.val().split(' ')[0];
    };

    var newRow = function() {
        var row = document.createElement('div');
        row.className = 'col-md-12';
        return row;
    };

    var hr = function() {
        return '<hr class="col-md-12">';
    };

    var submitButton = function() {
        return '<input type="submit" value="Submit" class="btn btn-success">';
    };

    var convertTime = function(time) {
        var parsedTime = parseInt(time.substring(0,2));
        if (parsedTime > 12) {
            return String(parsedTime - 12) + ':00 pm';
        } else if (parsedTime === 12) {
            return 'Noon';
        } else if (parsedTime === 0) {
            return 'Midnight';
        } else {
            return time + ' am';
        }
    };

    var labelText = function(text) {
        return '<p class="col-md-1">'+text+'</p>';
    };

    var makeHeaderElements = function(schedule) {
        return [labelText('Locations')].concat(
            schedule.map(function(time) {
                return labelText(convertTime(time));
            })).join('');
    };

    var header = function(schedule) {
        var container = newRow();
        container.innerHTML = makeHeaderElements(schedule);
        return container.outerHTML;
    };

    var makeRowElements = function(times, location) {
        return [labelText(fullLocations[location])].concat(
            times.map(function(time) {
                return '<input type="text" class="col-md-1" data-recordtime="'+time+'" data-recordlocation="'+location+'">';
            })).join('');
    };

    var formRow = function(times, location) {
        var row = newRow();
        row.innerHTML = makeRowElements(times, location);
        return row.outerHTML + hr();
    };

    var makeRows = function(schedule) {
        return locations.map(function(location) {
            return formRow(schedule, location);
        });
    };

    var allFormRows = function(schedule) {
        var rows = makeRows(schedule).join('');
        if (extendedOrOvernight.val() === 'overnight') {
            rows += header(timesBySchedule.overnight) + makeRows(timesBySchedule.overnight).join('');
        }
        return rows;
    };

    var createSchedule = function(scheduleType) {
        var schedule = timesBySchedule[scheduleType];
        if (extendedOrOvernight.val() === 'extended') {
            if (getDayOfWeek() === 'Sunday') {
                schedule = timesBySchedule.sundayExtended.concat(schedule);
            } else if (getDayOfWeek() === 'Saturday') {
                schedule = schedule.concat(timesBySchedule.extended.slice(1)); 
            } else {
               schedule = schedule.concat(timesBySchedule.extended);
            }
        }
        return schedule;
    };

    var makeForm = function(scheduleType) {
        var schedule = createSchedule(scheduleType);
        return header(schedule) + allFormRows(schedule) + submitButton();
    };

    return {header: header,
            allFormRows: allFormRows,
            makeForm: makeForm};
})();

var datePicker = (function() {

    var datePickerDiv = $('#datepicker');
    var options = {
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        altField: '#datefield',
        altFormat: 'DD yy-mm-dd',
        onSelect: function() {
            displayForm.setForm();
        }
    };

    var display = function() {
        datePickerDiv.datepicker(options);
    };

    var nextDay = function() {
        var date = datePickerDiv.datepicker('getDate');
        date.setTime(date.getTime() + (1000*60*60*24));
        datePickerDiv.datepicker("setDate", date);
    };

    return {display: display,
            nextDay: nextDay};
})();

var displayForm = (function() {

    var days = {
        'Monday': 'nineToEleven',
        'Tuesday': 'nineToEleven',
        'Wednesday': 'nineToEleven',
        'Thursday': 'nineToEleven',
        'Friday': 'nineToFour',
        'Saturday': 'elevenToFive',
        'Sunday': 'threeToEleven'
    };

    var getDayOfWeek = function () {
        return datefield.val().split(' ')[0];
    };

    var getSchedule = function () {
        return days[getDayOfWeek()];
    };

    var setForm = function() {
        $('#libinsightInput').html(formBuilder.makeForm(getSchedule()));
        setFocus();
    };

    var setFocus = function() {
        $('#libinsightInput input').first().focus();
    };

    return {setForm: setForm};
})();


var submitToLibinsight = (function() {

    var getDate = function() {
        return datefield.val().split(' ')[1];
    };

    var date = function(val) {
        return getDate() + ' ' + val.dataset.recordtime;
    };

    var gate_id = function(val) {
        return val.dataset.recordlocation;
    };

    var gate_start = function(val) {
        return parseInt(val.value);
    };

    var createObject = function(val) {
        return {date: date(val), gate_id: gate_id(val), gate_start: gate_start(val)};
    };

    var filledFieldsOnly = function(index, value) {
        return value.value;
    };

    var allHourEntries = function(submittedForm) {
        return $.map(
            submittedForm.find('input[type="text"]').filter(filledFieldsOnly),
            createObject);
    };

    var sendData = function(data) {
        return $.ajax({
                url: 'https://legacy.lib.westfield.ma.edu/oclc_records/libinsightUpdate.php',
                method: 'POST',
                data: {'data': data}
        });
    };

    return {allHourEntries: allHourEntries,
            sendData: sendData};

})();

var reporting = (function() {

    var messageContainer = document.getElementById('messageContainer');

    var successMessage = function() {
        return '<p class="success">Succesful add</p>';
    };

    var errorMessage = function() {
        return '<p class="error">Operation failed. Please let Ed know.</p>';
    };

    var nothingEntered = function () {
        messageContainer.innerHTML = '<p class="error">Please enter at least 1 value</p>';
    };

    var serverError = function () {
        messageContainer.innerHTML = '<p class="error">An error occured on the server. Let Ed know.</p>';
    };

    var afterSubmit = function(data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            serverError();
            return;
        }
        var message = data.response === 1 ? successMessage() : errorMessage();
        messageContainer.innerHTML = message;
    };

    return {afterSubmit: afterSubmit,
            nothingEntered: nothingEntered,
            serverError: serverError};
})();

var resetForNextInput = function () {
    datePicker.nextDay();
    displayForm.setForm();
};

datePicker.display();
displayForm.setForm();

$('#libinsightInput').on('submit', function(e) { 
    e.preventDefault();

    var toSend = submitToLibinsight.allHourEntries($(this));
    if (toSend.length) {
        submitToLibinsight.sendData(toSend)
        .then(reporting.afterSubmit, reporting.serverError)
        .then(resetForNextInput);
    } else {
        reporting.nothingEntered();
    }
});

extendedOrOvernight.on('change', function() {
    displayForm.setForm();
});

$(document).ready(function(){
	
	// function for testing is a string is blank
	function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}

	var storage_key = 'goalslist';

	// display goals entered previously
	if (localStorage && storage_key in localStorage){
		var stored_goals = localStorage.getItem(storage_key);

		if (stored_goals !== 'undefined'){
			$('#goals').html(stored_goals);
		}

		getSettings();
		displaySettings();
	}

	// enable click outside to create new goal
	$('#new-goal').focusout(function(){
		createGoal(this);
	});

	// enable press enter to create new goal
	$('#new-goal').keyup(function(e){
		if(e.keyCode == 13){
			createGoal(this);
		}	
	});

	function createGoal(input_node){
		var new_goal = $(input_node).val();

		if (!isBlank(new_goal)){
			// add the goal to the list
			var delete_button = '<a href="" class="delete">x</a>'
			$('#goals').append('<div class="goal"><h3>' + new_goal + '</h3>' + delete_button + '</div>');

			// clear the text input box
			$(input_node).val("");

			setStorage(storage_key, '#goals');
		}
	}

	$('.delete').click(function(){
		$(this).parent().remove();
		setStorage(storage_key, '#goals');
	});

	function setStorage(key, selector){
		localStorage.setItem(key, $(selector).html());
	}

	/* APPLY SETTINGS --------------------------------------------------------------- */
	var settings;

	$('#settings-form').submit(function(){
		settings = {
						'title-year': $('#year').val(),
						'year-theme': $('#theme').val(),
						'cat-title-1': $('#cat-1').val(),
						'cat-title-2': $('#cat-2').val(),
						'cat-title-3': $('#cat-3').val(),
						'cat-title-4': $('#cat-4').val()
					}
		
		localStorage.setItem('settings', JSON.stringify(settings));

		displaySettings();
		return false;
	});

	function getSettings(){
		settings = JSON.parse(localStorage.getItem('settings'));
	}

	function displaySettings(){
		if (settings){
			for (key in settings){
				(settings[key] && !isBlank(settings[key]) && settings[key] !== "undefined") ? $('#' + key).text(settings[key]) : "";
			}
		}
	}
});
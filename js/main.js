$(document).ready(function(){
	var storage_key = 'goalslist';
	var goals = {},
		settings = {};

	// function for testing is a string is blank
	function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}

	// display goals entered previously
	if (localStorage && storage_key in localStorage){
		var stored_goals = JSON.parse(localStorage.getItem(storage_key));

		if (stored_goals){
			for (key in stored_goals){
				(stored_goals[key] && !isBlank(stored_goals[key]) && stored_goals[key] !== "undefined") ? 
					$('#' + key + ' .goals').html(stored_goals[key]) : "";
			}
		}

		getSettings();
		displaySettings();
	}

	// enable click outside to create new goal
	$('.new-goal').focusout(function(){
		createGoal(this, $(this).parent());
	});

	// enable press enter to create new goal
	$('.new-goal').keyup(function(e){
		if(e.keyCode == 13){
			createGoal(this, $(this).parent());
		}	
	});

	function createGoal(input_node, parent_node){
		var new_goal = $(input_node).val();

		if (!isBlank(new_goal)){
			// add the goal to the list
			var delete_button = '<a href="" class="delete">x</a>'
			var parent = $(parent_node).attr('id');
			$('#' + parent + ' .goals').append('<div class="goal"><h3>' + new_goal + '</h3>' + delete_button + '</div>');

			// clear the text input box
			$(input_node).val("");

			goals = {
							'cat-section-1': $('#cat-section-1 .goals').html(),
							'cat-section-2': $('#cat-section-2 .goals').html(),
							'cat-section-3': $('#cat-section-3 .goals').html(),
							'cat-section-4': $('#cat-section-4 .goals').html()
						}

			localStorage.setItem(storage_key, JSON.stringify(goals));
		}
	}

	$('.delete').click(function(){
		$(this).parent().remove();
		setStorage[storage_key] = JSON.stringify(goals);
	});

	/* APPLY SETTINGS --------------------------------------------------------------- */

	// show-hide settings form
	$('#settings-toggle').click(function(){
		$('#settings-form').toggle();
	});

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
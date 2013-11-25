$(document).ready(function(){
	var storageKey = 'goalslist';
	var goals = {};
	var goalTemplate = Handlebars.compile($('#goal-template').html());

	displaySettings();
	displayStoredGoals();

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

	function createGoal(inputNode, parentNode){
		var newGoal = $(inputNode).val();

		if (!isBlank(newGoal)){
			// add the goal to the list
			var parentID = $(parentNode).attr('id');
			$('#' + parentID + ' .goals').append(goalTemplate({goal : newGoal}));

			// clear the text input box
			$(inputNode).val("");

			localStorage.setItem(storageKey, JSON.stringify(setGoals()));
			location.reload(true); // so can delete goal
		}
	}

	function setGoals(){
		return {	
					'cat-section-1': $('#cat-section-1 .goals').html(),
					'cat-section-2': $('#cat-section-2 .goals').html(),
					'cat-section-3': $('#cat-section-3 .goals').html(),
					'cat-section-4': $('#cat-section-4 .goals').html()
				};
	}

	// delete goal
	$('.delete').click(function(){
		$(this).parent().remove();
		localStorage.setItem(storageKey, JSON.stringify(setGoals()));
	});

	function displayStoredGoals(){
		if (localStorage && storageKey in localStorage){
			var storedGoals = JSON.parse(localStorage.getItem(storageKey));
			
			if (storedGoals){
				for (key in storedGoals){
					(storedGoals[key] && !isBlank(storedGoals[key]) && storedGoals[key] !== "undefined") ? $('#' + key + ' .goals').html(storedGoals[key]) : "";
				}
			}
		}
	}

	// show-hide settings form
	$('#settings-toggle').click(function(){
		$('#settings-form').toggle(function(){
			$('#settings-toggle').text($(this).is(':visible') ? "Hide Settings" : "Show Settings");
		});
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

	function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}

	function displaySettings(){
		if (localStorage && 'settings' in localStorage){
			var settings = JSON.parse(localStorage.getItem('settings'));

			if (settings){
				for (key in settings){
					if (settings[key] && !isBlank(settings[key]) && settings[key] !== "undefined"){
						$('#' + key).text(settings[key]);
					}
				}
			}
		}
	}
});
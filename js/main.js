 $(document).ready(function(){
	var STORAGE_KEY = 'goalslist';

	var goalTemplate = Handlebars.compile($('#goal-template').html()),
		categoryTemplate = Handlebars.compile($('#category-template').html());
	var categoryCount = 0, 
		startingCatCount = 4;


	/* INIT ----------------------------------------------------*/

	if (localStorage && 'settings' in localStorage){
		var settings = JSON.parse(localStorage.getItem('settings'));
		if (settings && settings['categoryCount'] !== undefined){
			startingCatCount = settings['categoryCount'];
		}
	}

	createDefaultCategories();
	displaySettings();
	displayStoredGoals();

	function createDefaultCategories(){
		for (var i = 1; i <= startingCatCount; i++){
			categoryCount++;
			addCategoryFormField();
			addCategory();
		}
	}

	function addCategoryFormField(){
		// add category input field to settings form
		$('#form-categories').append('<label for="cat-' + categoryCount + '"">Goal Category ' + categoryCount + '</label>' + 
                '<input type="text" name="cat-' + categoryCount + '" id="cat-' + categoryCount + '" placeholder="e.g. Health, Career, Finances" />');
	}

	function addCategory(){
		$('#categories').append(categoryTemplate({
			sectionID: 'cat-section-' + categoryCount,
			titleID: 'cat-title-' + categoryCount,
			categoryName: 'Category ' + categoryCount
		}));
	}

	function displaySettings(){
		// get settings from local storage and display
		if (localStorage && 'settings' in localStorage){
			var settings = JSON.parse(localStorage.getItem('settings'));

			if (settings){
				var i = 0;
				for (key in settings){
					if (settings[key] && !isBlank(settings[key]) && settings[key] !== "undefined"){
						$('#' + key).text(settings[key]);
					}
				}
			}
			
			// clear goals category select menu
			$('#category-select').html("");

			for (var i = 1; i <= categoryCount; i++){
				var catTitle = $('#cat-title-' + i).text();

				// add category to the goals category select menu
				$('#category-select').append('<option value="cat-section-' + i + '">' + catTitle + '</option>');
				// populate the settings form input field for the category with the category name
				$('#cat-' + i).val(catTitle);
			}
			// populate the remaining settings form input fields with stored data
			$('#year').val(settings['review-year']);
			$('#theme').val(settings['review-theme']);
		}
	}

	function displayStoredGoals(){
		if (localStorage && STORAGE_KEY in localStorage){
			var storedGoals = JSON.parse(localStorage.getItem(STORAGE_KEY));
			
			if (storedGoals){
				for (key in storedGoals){
					(storedGoals[key] && !isBlank(storedGoals[key]) && storedGoals[key] !== "undefined") ? $('#' + key + ' .goals').html(storedGoals[key]) : "";
				}
			}
		}
	}

	/* ADD/REMOVE GOALS -----------------------------------------------*/

	// show-hide settings form
	$('.goals-toggle').click(function(){
		$('#goal-form').toggle("slow");
	});

	$('#goal-form .cancel').click(function(){
		$('#goal-form').hide("slow");
	})

	// add a new goal to a category
	$('#goal-form').submit(function(){
		var newGoal = $('#new-goal').val(),
			deadline = $('#deadline-input').val(),
			notes = $('#goal-notes').val(),
			categorySection = $('#category-select option:selected').val();

		var loggingEnabled = $('#enable-logging').prop('checked');
		var runningTotalEnabled = $('#keep-running-total').prop('checked');

		if (!isBlank(newGoal)){ //TODO error checking for blank category and blank new goals on submit
			// append goal to selected category
			var goalsContainer = $('#' + categorySection + ' .goals')
			goalsContainer.append(goalTemplate({
												goal: newGoal,
												deadline: deadline,
												notes: notes,
												loggingEnabled: loggingEnabled
											}));

			// clear the text input boxes
			$('#new-goal').val("");
			$('#deadline-input').val("");
			$('#goal-notes').val("");

			localStorage.setItem(STORAGE_KEY, JSON.stringify(setGoals()));
			
			$('#goal-form').hide("slow");
		}

		return false;
	});

	function setGoals(){
		var goals = {};
		for (var i = 1; i <= categoryCount; i++){
			goals['cat-section-' + i] = $('#cat-section-' + i + ' .goals').html();
		}
		return goals;
	}

	// delete goal
	$(document).on('click', '.delete', function(){
		$(this).parent().remove();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(setGoals()));
	});

	$(document).on('click', '.deadline, .goal-title, .notes', function(){
		var fieldClass = $(this).attr('class');
		var currentValue = $(this).text();

		if (fieldClass === 'notes'){
			$(this).replaceWith('<textarea id="new-' + fieldClass + '" autofocus>' + currentValue + '</textarea>');
		} else {
			$(this).replaceWith("<input type='text' name='new-" + fieldClass + "' id='new-" + fieldClass + "' value='" + currentValue + "' autofocus/>");
		}
	});

	$(document).on('blur', '#new-deadline, #new-goal-title, #new-notes', function(){
		var newVal = $(this).val(),
			inputID = $(this).attr('id');

		if (inputID === 'new-deadline'){
			// replace with the original html
			$(this).replaceWith('<div class="deadline">' + newVal + '</div>');
		} else if (inputID === 'new-goal-title'){
			$(this).replaceWith('<h3 class="goal-title">' + newVal + '</h3>');
		} else if (inputID === 'new-notes'){
			$(this).replaceWith('<p class="notes">' + newVal + '</p>');
		}

		// save edits
		localStorage.setItem(STORAGE_KEY, JSON.stringify(setGoals()));
	});

	/* SETTINGS FORM ------------------------------------------*/

	// show-hide settings form
	$('.settings-toggle').click(function(){
		$('#settings-form').toggle("slow");
	});

	$('#settings-form .cancel').click(function(){
		$('#settings-form').hide("slow");
	})

	// Add category to settings form
	$('#add-cat').click(function(){
		categoryCount++;
		addCategoryFormField();
	})

	// submit settings form changes
	$('#settings-form').submit(function(){
		settings = {
						'review-year': $('#year').val(),
						'review-theme': $('#theme').val()
					}
		
		// create any added categories
		for (var i = startingCatCount; i < categoryCount; i++){
			addCategory();
			startingCatCount = categoryCount;
		}

		// add all categories to settings object
		for (var i = 1; i <= categoryCount; i++){
			settings['cat-title-' + i] = $('#cat-' + i).val();
		}

		// add total number of categories to settings object
		settings['categoryCount'] = categoryCount;

		// save settings object
		localStorage.setItem('settings', JSON.stringify(settings));
		displaySettings();

		$('#settings-form').hide("slow");

		return false;
	});

	/* DELETE CATEGORIES ------------------------------------------*/

	/* HELPER METHODS ---------------------------------------------*/

	function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}

});
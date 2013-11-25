$(document).ready(function(){
	var STORAGE_KEY = 'goalslist';

	var goalTemplate = Handlebars.compile($('#goal-template').html()),
		categoryTemplate = Handlebars.compile($('#category-template').html());
	var categoryCount = 0, 
		defaultCatCount = 4;


	/* INIT ----------------------------------------------------*/

	if (localStorage && 'settings' in localStorage){
		var settings = JSON.parse(localStorage.getItem('settings'));
		if (settings && settings['categoryCount'] !== undefined){
			defaultCatCount = settings['categoryCount'];
			console.log(defaultCatCount);
		}
	}

	createDefaultCategories();
	displaySettings();
	displayStoredGoals();

	function createDefaultCategories(){
		for (var i = 1; i <= defaultCatCount; i++){
			addCategoryFormField();
			addCategory();
			categoryCount++;
		}
	}

	function addCategoryFormField(){
		var catNum = categoryCount+1;

		// add category input field to settings form
		$('#form-categories').append('<label for="cat-' + catNum + '"">Category ' + catNum + '</label>' + 
                '<input type="text" name="cat-' + catNum + '" id="cat-' + catNum + '" placeholder="e.g. Health, Career, Finances" />');
	}

	function addCategory(){
		var catNum = categoryCount+1;

		$('#categories').append(categoryTemplate({
			sectionID: 'cat-section-' + catNum,
			titleID: 'cat-title-' + catNum,
			categoryName: 'Category ' + catNum
		}));
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

	/* ADD/REMOVE GOALS -----------------------------------------------*/

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

			localStorage.setItem(STORAGE_KEY, JSON.stringify(setGoals()));
			location.reload(true); // so can delete goal
		}
	}

	function setGoals(){
		var goals = {};
		for (var i = 1; i <= categoryCount; i++){
			goals['cat-section-' + i] = $('#cat-section-' + i + ' .goals').html();
		}
		console.log(goals);
		return goals;
	}

	// delete goal
	$('.delete').click(function(){
		$(this).parent().remove();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(setGoals()));
	});

	/* SETTINGS FORM ------------------------------------------*/

	// show-hide settings form
	$('#settings-toggle').click(function(){
		$('#settings-form').toggle(function(){
			$('#settings-toggle').text($(this).is(':visible') ? "Hide Settings" : "Display Settings");
		});
	});

	// Add category to settings form
	$('#add-cat').click(function(){
		addCategoryFormField();	
	})

	// submit settings form changes
	$('#settings-form').submit(function(){
		settings = {
						'title-year': $('#year').val(),
						'year-theme': $('#theme').val()
					}
		
		for (var i = defaultCatCount-1; i < categoryCount; i++){
			addCategory();
		}

		for (var i = 1; i <= categoryCount; i++){
			console.log(i);
			settings['cat-title-' + i] = $('#cat-' + i).val();
		}

		settings['categoryCount'] = categoryCount+1;

		localStorage.setItem('settings', JSON.stringify(settings));
		displaySettings();

		return false;
	});

	/* DELETE CATEGORIES ------------------------------------------*/

	/* HELPER METHODS ---------------------------------------------*/

	function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}

});
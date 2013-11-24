$(document).ready(function(){
	var storage_key = 'goalslist';

	// display goals entered previously
	if (localStorage && storage_key in localStorage){
		var stored_goals = localStorage.getItem(storage_key);

		if (stored_goals !== 'undefined'){
			$('#goals').html(stored_goals);
		}
	}

	// add new goals on submission of form
	$('#goal-form').submit(function(){
		var new_goal = $('#goal-input').val();

		// add the goal to the list
		var delete_button = '<a href="" class="delete">x</a>'
		$('#goals').append('<div class="goal"><h3>' + new_goal + '</h3>' + delete_button + '</div>');

		// clear the text input box
		$('#goal-input').val("");

		setStorage();
	});

	$('.delete').click(function(){
		$(this).parent().remove();
		setStorage();
	});

	function setStorage(){
		localStorage[storage_key] = $('#goals').html();
	}
});
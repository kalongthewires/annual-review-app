$(document).ready(function(){
    "use strict";

    var GOALS_KEY = 'goals',
        LOG_KEY = 'log',
        SETTINGS_KEY = 'settings';

    // COMPILE HANDLEBARS HTML TEMPLATES
    var goalTemplate = Handlebars.compile($('#goal-template').html()),
        logEntryTemplate = Handlebars.compile($('#log-entry-template').html()),
        logGoalTemplate = Handlebars.compile($('#log-goal-template').html()),
        logListEntryTemplate =
            Handlebars.compile($('#log-list-entry-template').html()),
        categoryInputTemplate =
            Handlebars.compile($('#category-input-template').html()),
        categoryTemplate = Handlebars.compile($('#category-template').html());

    var goalsIndex = 0,
        goalsCompleted = 0,
        categoryCount = 0,
        startingCatCount = 4;


/* INIT -------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

    /* DISPLAY SETTINGS
     * Get the settings from local storage and display them.
     */
    (function displaySettings(){
        var settings;
        if (localStorage && SETTINGS_KEY in localStorage){
            settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));

            setCategoryCount(settings);
        }

        // on webpage reload, create starting categories
        // avoid creating extra categories when settings form is submitted, etc.
        if (categoryCount === 0){
            createStartingCategories();
        }
        
        renderSavedSettings(settings);
        populateFormValues();
    })();

    /* SET CATEGORY COUNT
     * If a total number of goal categories is stored in local storage,
     * sets the startingCatCount variable to the saved value.
     */
    function setCategoryCount(settings){
        if (settings && settings['categoryCount'] !== undefined){
            startingCatCount = settings['categoryCount'];
        }
    }

    /* CREATE STARTING CATEGORIES
     * Create the number of goal categories specified by the startingCatCount
     * variable.
     */
    function createStartingCategories(){
        for (var i = 1; i <= startingCatCount; i++){
            createNewCategory();
        }
    }

    /* CREATE NEW CATEGORY
     * Generates a single new goal category and increments the categoryCount.
     */
    function createNewCategory(){
        categoryCount++;
        addCategoryFormField();
        renderCategory();
    }

    /* ADD CATEGORY FORM FIELD
     * Create a category input field in the settings form.
     */
    function addCategoryFormField(){
        $('#form-categories')
            .append(categoryInputTemplate({ categoryCount: categoryCount }));
    }

    /* RENDER CATEGORY
     * Render a new category in the #categories section.
     */
    function renderCategory(){
        $('#categories').append(categoryTemplate({
            sectionID: 'cat-section-' + categoryCount,
            titleID: 'cat-title-' + categoryCount,
            categoryName: 'Category ' + categoryCount
        }));
    }

    /* RENDER SAVED SETTINGS
     * Display the theme, annual review year, category names, etc. saved in
     * the settings form in their corresponding locations on the webpage.
     */
    function renderSavedSettings(settings){
        if (settings){
            var value;

            for (var key in settings){
                value = settings[key];
                if (value && !isBlank(value) && value !== "undefined"){
                    $('#' + key).text(value);
                }
            }
        }
    }

    /* POPULATE FORM VALUES
     * Add category names to the goals form category select menu, and set the
     * values for each input field in the settings form.
     */
    function populateFormValues(){
        var $selectMenu = $('#category-select'),
            catTitle;
        
        // clear categories in the category select menu
        $selectMenu.html("");
        
        for (var i = 1; i <= categoryCount; i++){
            catTitle = $('#cat-title-' + i).text();

            // add each category to the goals form category select menu
            $selectMenu.append('<option value="cat-section-' + i + '">' +
                catTitle + '</option>');
            
            // populate the settings form input field for the category with
            // the category name
            $('#cat-' + i).val(catTitle);
        }
        
        // populate the remaining settings form input fields with saved values
        $('#year').val($('#review-year').text());
        $('#theme').val($('#review-theme').text());
    }

    /* DISPLAY STORED GOALS
     * Show each goal saved in local storage in its corresponding goal section.
     * Set numCompleted to the saved number of completed goals and goalsIndex
     * to the saved total number of goals.
     */
    (function displayStoredGoals(){
        if (localStorage && GOALS_KEY in localStorage){
            var storedGoals = JSON.parse(localStorage.getItem(GOALS_KEY)),
                value;
            
            if (storedGoals){
                for (var key in storedGoals){
                    value = storedGoals[key];

                    if (value && !isBlank(value) && value !== "undefined"){
                        if (key === 'index'){
                            goalsIndex = value;
                        } else if (key === 'numCompleted'){
                            goalsCompleted = value;
                        } else { // add goal to its corresponding goal section
                            $('#' + key + ' .goals').html(value);
                        }
                    }
                }
            }
        }
    })();

    /* DISPLAY LOG
     * Show saved log entries and statistics (e.g. total # goals completed).
     */
    (function displayLog(){
        // display saved log entries
        if (localStorage && LOG_KEY in localStorage){
            $('#log-entries').html(localStorage.getItem(LOG_KEY));
        }

        // show total # goals completed
        $('#total-completed').html(goalsCompleted);

        // show log entry counts for each goal with logging enabled
        displayLogEntryCounts();
        displaySums();
    })();

    /* DISPLAY LOG ENTRY COUNTS
     * Counts the number of log entries for each log goal and displays the total
     * count at the top of the corresponding log goal.
     */
    function displayLogEntryCounts(){
        $('.log-goal').each(function(){
            var numEntries = 0;

            // count the number of log entries
            $('li', this).each(function(){
                numEntries++;
            });

            $('.total-logged', this).text('Total logged: ' + numEntries);
        });
    }

    /* DISPLAY SUMS
     * Sums the numeric log entries for log goals with "sum entries" enabled.
     * Shows the sum at the top of the log goals.
     */
    function displaySums(){
        $('.log-goal').each(function(){
            if ($(this).hasClass('sum-entries')){
                var sum = 0,
                    unit;

                // calculate the sum
                $('li', this).each(function(){
                    sum += parseInt($(this).text(), 10);
                });

                // display the sum with correct units
                unit = $(this).attr('data-unit');
                $('.sum', this).text('Total ' + unit + ' completed: ' + sum);
            }
        });
    }

/* ADD/REMOVE GOALS -------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

    /* SHOW UNITS INPUT FIELD
     * Display the units input field if "Sum Log Entries" is checked
     */
    $('#sum-entries').change(function(){
        $('#unit-container').toggle();

        if ($(this).prop('checked')){
            // enable logging is automatically checked because it is required 
            // to use sum entries tracking
            $('#enable-logging').prop('checked', true);
        }
    });

    /* DISPLAY AND SAVE SUBMITTED GOALS FORM DATA
     * Create the new goal and, if logging is enabled, add it to the log section.
     */
    $('#goal-form').submit(function(){
        var newGoal = stripHTML($('#new-goal').val()),
            deadline = stripHTML($('#deadline-input').val()),
            notes = stripHTML($('#goal-notes').val()) || "Click to add notes",
            categorySection = $('#category-select option:selected').val(),
            loggingEnabled = $('#enable-logging').prop('checked'),
            sumEntriesEnabled= $('#sum-entries').prop('checked'),
            unit = sumEntriesEnabled ? stripHTML($('#unit').val()) : "",
            hasErrors = false;

        clearErrors('#goal-form');
        hasErrors = checkGoalFormInputs(newGoal, sumEntriesEnabled,
                            loggingEnabled, unit);

        if (!hasErrors){
            createNewGoal(newGoal, deadline, notes, categorySection,
                loggingEnabled, unit);

            // add the goal title to the log section, if logging enabled
            if (loggingEnabled){
                addGoalToLog(newGoal, sumEntriesEnabled, unit);
            }

            // clear all form fields and checkboxes 
            $('input[type="text"], textarea', this).each(function(){
                $(this).val("");
            });

            $('input[type="checkbox"]', this).each(function(){
                $(this).prop("checked", false);
            });

            $('#unit-container').hide();
            $(this).hide("slow");
        }

        return false;
    });

    /* CHECK GOAL FORM INPUTS
     * Tests for goal form input errors and return true if errors are found.
     * Otherwise returns false.
     */
    function checkGoalFormInputs(newGoal, sumEntriesEnabled,
                loggingEnabled, unit){
        var $goalTitleError = $('.error', $('#new-goal').parent('div')),
            $sumEntriesError = $('#additional-tracking > .error'),
            $unitError = $('.error', $('#unit-container')),
            hasErrors = false;

        if (isBlank(newGoal)){
            $goalTitleError.text("You must enter a goal!");
            hasErrors = true;
        }

        if (sumEntriesEnabled && !loggingEnabled){
            $sumEntriesError.text('Enable Logging must be checked to enable ' +
                'Sum Entries.');
            hasErrors = true;
        }

        if (sumEntriesEnabled && isBlank(unit)){
            $unitError.text('A measurement unit is required.');
            hasErrors = true;
        }

        return hasErrors;
    }

    /* CREATE NEW GOAL
     * Renders a new goal with the specified parameters to the page and saves
     * the goal to local storage.
     */
    function createNewGoal(newGoal, deadline, notes, categorySection,
            loggingEnabled, unit){
        goalsIndex++;

        // append goal to selected category
        var $goalsContainer = $('#' + categorySection + ' .goals');

        $goalsContainer
            .append(goalTemplate({
                goal: newGoal,
                deadline: deadline,
                notes: notes,
                loggingEnabled: loggingEnabled,
                index: goalsIndex,
                unit: unit
            }));

        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    }

    /* SET GOALS
     * Sets the goals object to be saved for local storage. Adds all goals to 
     * the object, as well as, the current goalsIndex and goalsCompleted values.
     */
    function setGoals(){
        var goals = {};

        // add the goals section html for each category to the goals object
        for (var i = 1; i <= categoryCount; i++){
            goals['cat-section-' + i] =
                $('#cat-section-' + i + ' .goals').html();
        }

        goals['index'] = goalsIndex;
        goals['numCompleted'] = goalsCompleted;
        return goals;
    }

    /* ADD GOAL TO LOG
     * Displays the new goal title with corresponding log entry count and sum
     * if sum entries is enabled.
     */
    function addGoalToLog(newGoal, sumEntriesEnabled, unit){
        $('#log-entries').append(logGoalTemplate({
            goal: newGoal,
            index: goalsIndex,
            sumEntriesEnabled: sumEntriesEnabled,
            unit: unit
        }));

        // save the log
        localStorage.setItem(LOG_KEY, $('#log-entries').html());

        // display initial logged entries count
        displayLogEntryCounts();

        // display initial sum of entered log values
        if (sumEntriesEnabled){
            displaySums();
        }
    }

    /* TOGGLE NOTES
     * Show/hide goal notes when the View Notes link is clicked.
     */
    $(document).on('click', '.view-notes, .hide-notes', function(){
        var actionClass = $(this).attr('class'),
            $parentGoal = $(this).parent().parent(),
            $notes = $parentGoal.find('.notes');

        $notes.toggleClass("hidden");

        if (actionClass === 'view-notes'){
            $(this).text('Hide Notes');
        } else if (actionClass === 'hide-notes'){
            $(this).text('View Notes');
        }

        $(this).toggleClass("view-notes");
        $(this).toggleClass("hide-notes");
        return false;
    });

    /* DELETE GOAL ON DELETE
     * Delete goal when the delete button is pushed and save the changes.
     */
    $(document).on('click', '.delete', function(){
        $(this).parent().remove();
        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    });

    /* EDIT GOAL INFO
     * When a goal's deadline, title, or notes are clicked, display an input
     * field or textarea that allows the user to edit the clicked info.
     */
    $(document).on('click', '.deadline, .goal-title, .notes', function(){
        var fieldClass = $(this).attr('class'),
            $fieldToReplace = fieldClass === 'deadline' ?
                $('.deadline-time', this) : $(this),
            currentValue = $fieldToReplace.text(),
            $goalTitle = $(this).parent().find('.goal-title');

        // prevent completed goals from being edited
        if ($goalTitle.css('text-decoration') === 'line-through'){
            return;
        }

        if (fieldClass === 'notes'){
            $(this).replaceWith('<textarea id="new-' + fieldClass +
                '" autofocus>' + currentValue + '</textarea>');
        } else {
            $fieldToReplace.replaceWith("<input type='text' name='new-" +
                fieldClass + "' id='new-" + fieldClass + "' value='" +
                currentValue + "' autofocus/>");
        }
    });

    /* SAVE UPDATED GOAL INFORMATION
     * On blur, display and save the edited goal information.
     */
    $(document).on('blur', '#new-deadline, #new-goal-title, #new-notes',
            function(){
        var newVal = stripHTML($(this).val()),
            inputID = $(this).attr('id'),
            $parentGoal = $(this).parent();

        // replace input/textarea with the original html
        if (inputID === 'new-deadline'){
            $(this).replaceWith('<span class="deadline-time">' + newVal +
                '</span>');
        } else if (inputID === 'new-goal-title'){
            $(this).replaceWith('<h3 class="goal-title">' + newVal + '</h3>');
            updateLogGoalTitle($parentGoal, newVal);
        } else if (inputID === 'new-notes'){
            $(this).replaceWith('<p class="notes">' + newVal + '</p>');
        }

        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    });

    /* UPDATE LOG GOAL TITLE
     * Updates the log when a goal is edited so that the log also reflects the
     * updated goal title.
     */
    function updateLogGoalTitle($parentGoal, newGoalTitle){
        var parentGoalID = $parentGoal.attr('id'),
            $loggingEnabled = $parentGoal.find('.add-log-entry'),
            $logGoal = $('#log-' + parentGoalID);

        // update log entry if logging enabled
        if ($loggingEnabled){
            if ($logGoal){
                $logGoal.find('h3').text(newGoalTitle);

                localStorage.setItem(LOG_KEY, $('#log-entries').html());
            }
        }
    }

/* GOAL LOGGING ------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

    /* ADD GOAL LOG ENTRY */
    $(document).on('click', '.add-log-entry', function(e){
        var $parentGoal = $(this).parent().parent(),
            currentDate = new Date(),
            dd = currentDate.getDate(),
            mm = currentDate.getMonth()+1,
            yyyy = currentDate.getFullYear(),
            $loggingSection = $parentGoal.find('.logging'),
            unit;

        // prevent add-log-entry actions from occurring twice
        if(!$.trim($loggingSection.html()).length){
            unit = $parentGoal.attr('data-unit');

            // create input box and save button
            $loggingSection.append(logEntryTemplate({unit: unit}));

            // set today's date as default
            $parentGoal.find('.entry-date').val(mm + '/' + dd + '/' + yyyy);
        }

        return false;
    });

    /* CANCEL LOG ENTRY */
    $(document).on('click', '#cancel-logging', function(){
        removeLogInputField($(this).parent());
        return false;
    });

    /* SAVE LOG ENTRY */
    $(document).on('click', '.save-log-entry', function(){
        var $loggingSection = $(this).parent(),
            parentGoalID = $loggingSection.parent().attr('id'),
            parentGoalIndex = parentGoalID.substring(5),
            $logGoal = $('#log-goal-' + parentGoalIndex),
            logEntryText = stripHTML($loggingSection.find('.log-input').val()),
            entryDate = stripHTML($loggingSection.find('.entry-date').val()),
            dataUnit = $('#' + parentGoalID).attr('data-unit'),
            unit = !isBlank(dataUnit) ? dataUnit : "",
            hasErrors = false;

        clearErrors('#' + parentGoalID);
        hasErrors = checkSaveLogInputs($loggingSection, logEntryText,
                            entryDate, unit);

        if (!hasErrors){
            $logGoal.find('.log-list').append(logListEntryTemplate({
                    logEntryText: logEntryText,
                        entryDate: entryDate,
                        unit: unit
                })
            );

            // save the log
            localStorage.setItem(LOG_KEY, $('#log-entries').html());
            removeLogInputField($loggingSection);

            // update log entry count for the goal
            displayLogEntryCounts();

            // update log entry sum if "Sum Log Entries" is enabled
            if ($logGoal.hasClass("sum-entries")){
                displaySums();
            }
        }
    });

    function checkSaveLogInputs($loggingSection, logEntryText, entryDate, unit){
        var hasErrors = false,
            $errorSection = $loggingSection.find('.error');

        if (isBlank(logEntryText) || isBlank(entryDate)){
            $errorSection.text("All fields are required!");
            hasErrors = true;
        } else if (!isBlank(unit) && !$.isNumeric(logEntryText)){
            $errorSection.text('You chose to enable sum entries so ' +
                'your log entry must be a number.');
            hasErrors = true;
        }

        return hasErrors;
    }

    /* REMOVE LOG ENTRY INPUT FIELD
     * Remove add log entry input field and associated save button, etc.
     */
    function removeLogInputField(parent){
        $(parent).children().each(function(){
            $(this).remove();
        });
    }

/* SETTINGS FORM ------------------------------------------------------------ */
/* -------------------------------------------------------------------------- */

    /* ADD NEW CATEGORY INPUT TO SETTINGS FORM */
    $(document).on('click', '#add-cat', function(){
        categoryCount++;
        addCategoryFormField();
        return false;
    });

    /* DISPLAY SUBMITTED SETTINGS FORM CHANGES
     * Show the values submitted through the settings form in their respective
     * locations on the page. Save the submitted settings.
     */
    $('#settings-form').submit(function(){
        var settings = {
                            'review-year': stripHTML($('#year').val()),
                            'review-theme': stripHTML($('#theme').val()),
                            'categoryCount' : categoryCount
                        };
        
        renderAddedCategories();

        // add all categories to settings object
        for (var i = 1; i <= categoryCount; i++){
            settings['cat-title-' + i] = stripHTML($('#cat-' + i).val());
        }

        // save and display
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        displaySettings();

        $('#settings-form').hide("slow");

        return false;
    });

    /* RENDER ADDED CATEGORIES
     * Create a category in the #categories section for each added category
     * input field on the settings form.
     */
    function renderAddedCategories(){
        for (var i = startingCatCount; i < categoryCount; i++){
            renderCategory();
            startingCatCount = categoryCount;
        }
    }

    /* COMPLETE A GOAL
     * When completed button clicked, show the current date for the completed
     * goal and mark it as completed. Increment goalsCompleted and save all the
     * changes.
     */
    $(document).on('click', '.complete', function(){
        // get current date to display
        var currentDate = new Date(),
            dd = currentDate.getDate(),
            mm = currentDate.getMonth()+1,
            yyyy = currentDate.getFullYear(),
            $parentGoal = $(this).parent(),
            $completedDate = $parentGoal.find('.completed-date');

        // strike out the goal title
        $parentGoal.find('.goal-title').css('text-decoration', 'line-through');
        
        // avoid displaying the date of completion twice
        if (isBlank($completedDate.text())){
            // display date completed
            $completedDate.text('Completed: ' + mm + '/' + dd + '/' + yyyy);
        }

        // change the button class
        $(this).addClass('undo-complete');
        $(this).removeClass('complete');

        // display new total completed in log panel
        goalsCompleted++;
        $('#total-completed').html(goalsCompleted);

        // save changes
        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    });

    /* UNDO GOAL COMPLETION
     * If the completed button is clicked a second time, undo goal completion
     * and save the changes.
     */
    $(document).on('click', '.undo-complete', function(){
        var $parentGoal = $(this).parent();

        // remove strikethrough line
        $parentGoal.find('.goal-title').css('text-decoration', 'none');

        // remove date completed
        $parentGoal.find('.completed-date').text("");

        // change the button class
        $(this).removeClass('undo-complete');
        $(this).addClass('complete');

        // display new total completed in log panel
        goalsCompleted--;
        $('#total-completed').html(goalsCompleted);

        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    });

/* LOG SECTION -------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

    /* REMOVE LOG GOAL
     * Delete a goal from the log. If the goal hasn't been deleted from the
     * #categories section, then removes logging ability from the goal. Saves 
     * the changes to the log and the goal.
     */
    $(document).on('click', '.remove-log-goal', function(){
        var $logGoal = $(this).parent(),
            logID = $logGoal.attr('id'),
            goalID = '#' + logID.substring(4), // remove the "log-" prefix
            $goal = $(goalID);
        
        $logGoal.remove();

        // if goal still exists, disable logging
        if ($goal){
            $('.add-log-entry', $goal).remove();
            $('.logging', $goal).remove();
        }

        localStorage.setItem(LOG_KEY, $('#log-entries').html());
        localStorage.setItem(GOALS_KEY, JSON.stringify(setGoals()));
    });

    /* EDIT LOG ENTRY DATE
     * Click a log entry date to edit it.
     */
    $(document).on('click', '.log-date', function(){
        var currentLogDate = $(this).text();

        $(this).replaceWith('<input type="text" name="new-log-date"' +
            'id="new-log-date" value="' + currentLogDate + '" autofocus/>');
    });

    /* EDIT LOG ENTRY ITEM 
     * Click a log entry to edit it.
     */
    $(document).on('click', '.log-item', function(){
        var currentLogItem = $('.log-entry-text', this).text();

        $(this).find('.log-entry-text').replaceWith('<input type="text"' +
            'name="new-log-item" id="new-log-item" value="' + currentLogItem +
            '" autofocus/>');
    });

    /* SAVE EDITED LOG DATE */
    $(document).on('focusout', '#new-log-date', function(){
        var newDate = stripHTML($(this).val());

        if (!isBlank(newDate)){
            $(this).replaceWith('<span class="log-date">' + newDate + '</span>');
            localStorage.setItem(LOG_KEY, $('#log-entries').html());
        }
    });

    /* SAVE EDITED LOG ITEM
     * Save the edited log item and update the entry sum if sum entries enabled.
     */
    $(document).on('focusout', '#new-log-item', function(){
        var newLogItem = stripHTML($(this).val());

        if (!isBlank(newLogItem)){
            $(this).replaceWith('<span class="log-entry-text">' +
                newLogItem + '</span>');

            localStorage.setItem(LOG_KEY, $('#log-entries').html());
            displaySums();
        }
    });

    $(document).on('click', '.log-goal .delete', function(){
        var $logEntry = $(this).parent();
        $logEntry.remove();

        localStorage.setItem(LOG_KEY, $('#log-entries').html());
        displaySums();
        displayLogEntryCounts();
    });

/* CLEAR/SAVE REVIEW -------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

    /* CLEAR ANNUAL REVIEW
     * Deletes all saved data and clears the Annual Review template.
     * Displays a dialog box to ensure the user definitely wants to complete the
     * clear review action.
     */
    $(function(){
        var $dialog = $('#dialog');
        $dialog.dialog({
            autoOpen : false,
            closeText: 'x',
            modal : true,
            buttons: [
                { text: 'Yes', click: function() {
                        $(this).dialog('close');
                        localStorage.clear();
                        location.reload(true);
                    } },
                { text: 'No', click: function() { $(this).dialog('close'); } }
            ]
        });

        $('#clear-review').click(function() {
            $dialog.dialog('open');
            return false;
        });
    });

/* GENERAL LISTENERS -------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

    /* TOGGLE PANNEL */
    $('#log-toggle, #goals-toggle, #settings-toggle').click(function(){
        togglePanel($(this));
    });

    /* NAV TOGGLE PANEL */
    $('#nav-log-toggle, #nav-goals-toggle, #nav-settings-toggle').click(function(){
        var selector = $(this).attr('id').substring(4);
        $('#' + selector).trigger('click');
    });

    function togglePanel($toggleClicked){
        var $iconSpan = $toggleClicked.find('.icon-arrow'),
            $contentToToggle = $toggleClicked.next();

        $contentToToggle.toggle("slow");
        $iconSpan.toggleClass('icon-arrow-up');
        $iconSpan.toggleClass('icon-arrow-down');
    }

    /* CLOSE PANEL */
    $(document).on('click', '#log-cancel, #goals-cancel, #settings-cancel',
            function(){
        $(this).parent().hide('slow');
    });

/* HELPER METHODS ----------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
    
    /* CHECK IF STRING IS BLANK
     * Regex source: 
     * http://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript
     */
    function isBlank(str){
        return (!str || /^\s*$/.test(str));
    }

    /* STRIP HTML
     * Regex from CSS Tricks: 
     * http://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
     */
    function stripHTML(str){
        return str.replace(/(<([^>]+)>)/ig,"");
    }

    /* CLEAR ERRORS
     * Clears all errors contained within the selector.
     */
    function clearErrors(selector){
        $('.error', $(selector)).text("");
    }
});
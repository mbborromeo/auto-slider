/*
 * Project: Automatic Slider for Portfolio
 * Description: Make the slider go to the next project automatically.
 *              Once at the end, rewind to first project and pause there.
 * Technology: jQuery
 * Author: Michael Borromeo
 * Date: 2013
 */

var currentIndex = 0;
var autoScrollIsRunning = true; //set to false if you don't want to automatically scroll
var autoScrollIntervalID = 0;
var PIXELS_PER_SECOND = 608;


//Get project details from JSON file
$(document).ready( function(){
	renderSlider(); //initial calculation of slideshow thumbnail fit

	//fade Next/Previous buttons in once project thumbnails are loaded
	$("#btn_nextProj").fadeIn();
	$("#btn_prevProj").fadeIn();

	/* Only start slider if initially user has not pressed Next/Previous buttons within 4 seconds */
	setTimeout(tryToStartSlider, 4000);

	$(window).on("resize", renderSlider); //calculate slideshow thumbnail fit whenever the window is resized			
});


// Data
function offsetSlider(amount) {		
	var newIndex = currentIndex + amount;
	if( amount <= 0 ) {
		newIndex = Math.max(0, newIndex); //returns max of two params
	} else {
		var maxIndex = getCurrentMaxIndex();
		newIndex = Math.min(maxIndex, newIndex); //returns min of two params
	}

	currentIndex = newIndex;
	renderSlider();
}

function userActionOffsetSlider(amount) {
	stopAutoScroll();	
	offsetSlider(amount);
}

function rewindSlider() {
	currentIndex = 0;
	renderSlider();
}

function getCurrentMaxIndex() {
	var slideshowHolderWidth = $("#slideshow-holder").width();
	var noOfProjects = $("#slideshow .feature").length; //count the number of features
	var NO_OF_PROJECTS_THAT_FIT = Math.round(slideshowHolderWidth / getFeatureWidth());
	
	//limit to zero, as can actually incorrectly become negative, ie. 2 projects fitting into the slideshow space that fits 3.
	var maxCurrentIndex = noOfProjects - NO_OF_PROJECTS_THAT_FIT; 
	maxCurrentIndex = Math.max(0, maxCurrentIndex);

	return maxCurrentIndex;
}

function getFeatureWidth() {
	var feature = $( $("#slideshow .feature").get(0) );
	return feature.outerWidth(true); //current computed outer width including margin
}

function tryToStartSlider(){
	if( autoScrollIsRunning ){	
		autoScrollIntervalID = setInterval(function(){
			offsetSlider(1);
		}, 2000); //return value is an ID number of the timer that was set, so you can use clearInterval() to cancel that specific timer.
	}
}

function stopAutoScroll() {
	autoScrollIsRunning = false;
	clearInterval(autoScrollIntervalID); //stop auto slider
}


// Display
function renderSlider() {	
	var sliderOffset = -(getFeatureWidth() * currentIndex);	
	var slidersLeftPosition = parseInt($("#slideshow").css("left"));
	
	if( isNaN(slidersLeftPosition) ){
		slidersLeftPosition = 0;
	}
	
	var distanceToMove = Math.abs(sliderOffset - slidersLeftPosition);
	var timeToGetThere = 1000 * distanceToMove / PIXELS_PER_SECOND;

	$("#slideshow").stop().animate({"left" : sliderOffset + "px"}, timeToGetThere);
	
	decideToDisableButtons();
}

function decideToDisableButtons() {
	if( currentIndex >= 1 ){
		setButtonEnabled("#btn_prevProj", true);
	} else {
		setButtonEnabled("#btn_prevProj", false);
	}	
	
	if( currentIndex < getCurrentMaxIndex() ){
		setButtonEnabled("#btn_nextProj", true);
	} else {
		setButtonEnabled("#btn_nextProj", false);
		
		//if auto scroll is running and has reached last slide, then stop and rewind.
		if( autoScrollIsRunning ){ 
			stopAutoScroll();
			setTimeout(rewindSlider, 1500);
		}
	}	
}

function setButtonEnabled(buttonSelector, enabled) {
	if( enabled ) {
		$(buttonSelector).removeClass("greyedOut");
	} else {
		$(buttonSelector).addClass("greyedOut");
	}
}


// Inputs
$("#btn_prevProj").on("click", function(){ 
	userActionOffsetSlider(-1); //go back one slide
	return false;
});

$("#btn_nextProj").on("click", function(){
	userActionOffsetSlider(1); //go forward one slide
	return false;
});		

$(window).on("keyup", function(event){
	if( event.which==39 ) { //right arrows on keyboard, up event.which==38
		userActionOffsetSlider(1); //go forward one slide
	}
	if( event.which==37 ) { //left arrows on keyboard, down event.which==40
		userActionOffsetSlider(-1); //go back one slide
	}
});
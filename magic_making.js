$(document).ready(function(){

	var hi_there_this_is_where_the_magic_happencils_so_it_is_probably_better_to_watch_a_youtube_video_or_go_to_the_apple_store_than_view_this_little_ugly_file_sorry;
	var xp, yp, zp, timer;
	if (typeof localStorage['settings'] == 'undefined') install(event);
	settings = localStorage['settings'].split(',');
	number = 0;
	total = 0;
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	show = new Array();
	hide = new Array();
	stroke = -1;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context.strokeStyle = getPencilColor();
	context.lineWidth = getPencilSize();
	context.lineCap = 'square';
	pane = '';
	title = '';
	$('#shortcut_'+settings[0]).attr('checked', 'checked');
	$('#export_'+settings[1]).attr('checked', 'checked');
	for (var count = 0; count < localStorage.length - 2; count++) {
		if (typeof localStorage[count] != "undefined") array = localStorage[count].split(',');
		if (typeof array[2] != "undefined") {
			title = array[2];
			pane = '<li id="'+count+'_li"><a href="#" title="Double-click to edit title" class="link" id="'+count+'_link">'+formatTitle(title)+'</a><input type="text" class="hidden edit" id="'+count+'_edit" title="Press enter to save" value="'+title+'" /></li>'+pane;
			number++;
			total++;
		}
	}
	if (total == 0) total = 1;
	last = count;
	if (count != 0) {
		last = last - 1;
		number = number - 1;
		$('.pane ul').html(pane);
	}
	else {
		slidePaneOut(event);
		$('.edit').focus();
	}
	if (localStorage['last'] && localStorage[localStorage['last']] && localStorage[localStorage['last']] != 'null') switchDocument(event, '#'+localStorage['last']+'_link');
	resizePane(event);
	$('#pencil').attr('checked', 'checked');
	$(window).resize(resizePane);
	$('#'+localStorage['last']+'_link').addClass('white');
	$('#canvas').mousedown(mouseDown);
	$('#new').click(newDocument);
	$('#undo').click(undo);
	$('#redo').click(redo);
	$('#delete').click(deleteDocument);
	$('#export').click(exportDocument);
	$('#settings').click(openSettings);
	$('#help').click(openHelp);
	$('.pane input:radio').change(changePencil);
	$('.overlay input').change(saveSettings);
	$('.export input').change(export);
	executeShortcuts(event, settings[0]);
	$('.pane').mouseenter(function(event) { slidePaneOut(event); $('.pane').addClass('mouseover'); });
	$('.pane').mouseleave(function(event) { slidePaneIn(event); $('.pane').removeClass('mouseover'); });
	$('.link').live('dblclick', function(event) { editOpen(event, this); });
	$('.edit').live('blur', function(event) { editSave(event, this, title, number); });
	$('.link').live('click', function(event) { switchDocument(event, this); });
	$('.edit').live('keydown', function(event) {
		if (event.keyCode == 13) {
			$(this).blur();
			editSave(event, this, title, number);
		}
	});
	$('#export, #settings, #help').overlay({
		speed: 0,
		top: 'center',
		left: 'center',
		mask: {
			color: 'rgba(32, 32, 32, 0.95)',
			loadSpeed: 0
		},
		onLoad: function(event) {
			$('.overlay').addClass('selected');
		},
		onClose: function(event) {
			$('.overlay').removeClass('selected');
			context.clearRect(0, 0, canvas.width, canvas.height);
			draw(show);
		}
	});

});

function executeShortcuts(event, setting) {

	var timer;
	if (setting == 1)  {
		$(document).bind('keypress', 'z', function(event) { $('#undo').trigger('click'); });
	    $(document).bind('keypress', 'r', function(event) { $('#redo').trigger('click'); });
	    $(document).bind('keypress', 'w', function(event) { $('#delete').trigger('click'); });
	    $(document).bind('keypress', 's', function(event) { $('#export').trigger('click'); });
	    $(document).bind('keypress', 'o', function(event) { $('#settings').trigger('click'); });
	    $(document).bind('keypress', 'h', function(event) { $('#help').trigger('click'); });
	    $(document).bind('keypress', 'n', function(event) {
	    	$('#new').trigger('click');
	    	$('.pane').trigger('mouseover');
	    	return false;
	    });
	    $(document).bind('keypress', 'e', function(event) {
	    	$('#'+localStorage['last']+'_link').trigger('dblclick');
	    	slidePaneOut(event);
	    	return false;
	    });
	    $(document).bind('keydown', 'up', function(event) {
	    	$('#'+$('#'+localStorage['last']+'_li').prev().attr('id').replace('_li', '_link')).trigger('click');
	    	slidePaneOut(event);
	    	clearTimeout(timer);
	    	timer = setTimeout("slidePaneIn(event, 1)", 4000);
	    });
	    $(document).bind('keydown', 'down', function(event) {
	    	$('#'+$('#'+localStorage['last']+'_li').next().attr('id').replace('_li', '_link')).trigger('click');
	    	slidePaneOut(event);
	    	clearTimeout(timer);
	    	timer = setTimeout("slidePaneIn(event, 1)", 4000);
	    });
	    $(document).bind('keydown', 'left right', function(event) {
	    	checked = $('input[name=color]:checked').val();
	    	$('#pencil, #eraser').removeAttr('checked');
	    	if (checked == '000000') $('#eraser').attr('checked', 'checked');
	    	else $('#pencil').attr('checked', 'checked');
	    	changePencil(event);
	    	slidePaneOut(event);
	    	clearTimeout(timer);
	    	timer = setTimeout("slidePaneIn(event, 1)", 4000);
	    });
	    $(document).bind('keydown', 'esc return', function(event) {
	    	if ($('.overlay').hasClass('selected')) $('.close').trigger('click');
	    	else if ($('.pane').css('left') == '-5px') slidePaneIn(event);
	    	else slidePaneOut(event);
	    });
	}

}

function modifyDatabase(event) {

	for (var count_modify = 0; count_modify < localStorage.length - 1; count_modify++) {
		show_modified = new Array();
		hide_modified = new Array();
		if (typeof localStorage[count_modify] != "undefined" && localStorage[count_modify] != 'null') {
			array_modify = localStorage[count_modify].split(',');
			show_modify = splitArrayModify(array_modify[0]);
			hide_modify = splitArrayModify(array_modify[1]);
			for (var count_show = 0; count_show < show_modify.length; count_show++) {
				temp = show_modify[count_show];
				if (show_modify.length > 0) temp.unshift('#000000');
				show_modified[count_show] = temp;
			}
			for (var count_hide = 0; count_hide < hide_modify.length; count_hide++) {
				temp = hide_modify[count_hide];
				if (hide_modify.length > 0) temp.unshift('#000000');
				hide_modified[count_hide] = temp;
			}
			localStorage[count_modify] = new Array([joinArray(show_modified), joinArray(hide_modified), array_modify[2], array_modify[3], array_modify[4]]);
		}
	}

}

function splitArrayModify(element) {

	if (element == '') return new Array();
	element = element.split('c');
	for (xp in element) {
		element[xp] = element[xp].split('b');
		for (yp in element[xp]) element[xp][yp] = element[xp][yp].split('a');
	}
	return element;
}

function joinArrayModify(element) {

	re = '';
	for (xp in element) {
		for (yp in element[xp]) {
			for (zp in element[xp][yp]) {
				re += element[xp][yp][zp];
				if (zp != element[xp][yp].length - 1) re += 'a';
			}
			if (yp != element[xp].length - 1) re += 'b';
		}
		if (xp != element.length - 1) re += 'c';
	}
	return re;

}

function saveSettings(event) {

	localStorage['settings'] = $('input[name=shortcut]:checked').val()+','+$('input[name=export]:checked').val();
	settings = localStorage['settings'].split(',');
	executeShortcuts(event, settings[0]);
	
}

function openSettings(event) {

	$('.settings').removeClass('hidden');
	$('.export').addClass('hidden');
	$('.help').addClass('hidden');

}

function openHelp(event) {

	$('.help').removeClass('hidden');
	$('.export').addClass('hidden');
	$('.settings').addClass('hidden');

}

function exportDocument(event) {

	$('.export').removeClass('hidden');
	$('.settings').addClass('hidden');
	$('.help').addClass('hidden');
	export(event);

}

function export(event) {

	context.fillStyle = '#FFF';
	context.fillRect(0, 0, canvas.width, canvas.height);
	draw(show);
	base = canvas.toDataURL('image/'+settings[1]);
	$('#preview').attr('src', base);
	$('#preview').attr('width', canvas.width / 2);
	$('#preview').attr('height', canvas.height / 2);

}

function editOpen(event, current) {

	element = '#'+$(current).attr('id').replace('_link', '')+'_edit';
	$(current).addClass('hidden');
	$(element).removeClass('hidden');
	resizePane(event);
	$(element).focus();

}

function editSave(event, current, title, number) {

	element = '#'+$(current).attr('id').replace('_edit', '')+'_link';
	val = $(current).val();
	if (val != '') {
		$(current).addClass('hidden');
		$(element).removeClass('hidden');
		$(element).addClass('white');
		$(element).html(formatTitle(val));
		if (number == 0 && !localStorage[number]) timer = setTimeout("slidePaneIn()", 1000);
		if (!localStorage[number]) {
			if (val != 'Untitled' || number != 0 || show.length != 0 || hide.length != 0) {
				localStorage['last'] = number;
				save('', '', number);
			}
		}
		else localStorage[number] = localStorage[number].replace(','+title+',', ','+val.replace(/,/g, '.')+',');
	}
	resizePane(event);

}

function switchDocument(event, current) {

	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	number = $(current).attr('id').replace('_link', '');
	array = localStorage[number].split(',');
	title = array[2];
	show = splitArray(array[0]);
	stroke = show.length - 1;
	hide = splitArray(array[1]);
	$('#'+$(current).attr('id').replace('_link', '')+'_edit').addClass('hidden');
	$('.pane ul li a').removeClass('white');
	$(current).addClass('white');
	localStorage['last'] = number;
	draw(show);
	if ($('.overlay').hasClass('selected')) exportDocument(event);
	
}

function undo(event) {

	if (show.length > 0) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		hide.push(show.pop());
		draw(show);
		save(show, hide, number);
		stroke = stroke - 1;
	}

}

function redo(event) {

	if (hide.length > 0) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		show.push(hide.pop());
		draw(show);
		save(show, hide, number);
		stroke = stroke + 1;
	}

}

function newDocument(event) {

	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	if ($('#'+number+'_edit').val() == 'Untitled' && show == '' && hide == '') save('', '', number);
	show = new Array();
	hide = new Array();
	stroke = -1;
	total++;
	last++;
	number = last;
	$('.pane ul').prepend('<li id="'+number+'_li"><a href="#" class="hidden link" title="Double-click to edit title" id="'+number+'_link">Untitled</a><input type="text" class="edit" id="'+number+'_edit" title="Press enter to save" value="Untitled" /></li>');
	$('.pane ul li a').removeClass('white');
	resizePane(event);
	$('#'+number+'_edit').focus();

}

function deleteDocument(event) {

	if (confirm('Are you sure? You can\'t undo this.') && total > 0) {
		context.clearRect(0, 0, window.innerWidth, window.innerHeight);
		show = new Array();
		hide = new Array();
		stroke = -1;
		$('#'+number+'_li').remove();
		if (localStorage[number]) localStorage[number] = null;
		number = number - 1;
		total = total - 1;
		resizePane(event);
		localStorage['last'] = $('.pane ul li:first-child').attr('id').replace('_li', '');
		$('.pane ul li:first-child .link').trigger('click');
		title = $('.pane ul li:first-child .link').html();
	}

}

function resizePane(event) {

	margin = ($(window).height() - ($('.pane .inner').height() + 32)) / 2;
	$('.pane').css('top', margin+'px');
	$('.pane').css('bottom', margin+'px');

}

function slidePaneIn(event, mouseover) {

	if (typeof mouseover == 'undefined') mouseover = 0;
	if (typeof $('input[type=text]:focus').val() == 'undefined' && (mouseover != 1 || !$('.pane').hasClass('mouseover'))) slidePane(event, 77);

}

function slidePaneOut(event) {

	slidePane(event, 5);

}

function slidePane(event, number) {

	$('.pane').animate({left: '-'+number+'px'}, 75);
		
}

function mouseDown(event) {
	
	stroke++;
	context.strokeStyle = getPencilColor();
	context.lineWidth = getPencilSize();
	canvas.addEventListener('mousemove', mouseMove, false);
	canvas.addEventListener('mouseup', mouseUp, false);
	canvas.addEventListener('mouseout', mouseUp, false);
	context.beginPath();
	context.moveTo(event.pageX, event.pageY);
	show.push(new Array(context.strokeStyle));
	show[stroke].push(new Array(event.pageX, event.pageY));
	x_position = event.pageX;
	y_position = event.pageY;
	if (event.shiftKey) holdStraight(event);
	$(window).keyup(releaseStraight);

}

function mouseMove(event) {
	
	context.lineTo(event.pageX, event.pageY);
	show[stroke].push(new Array(event.pageX, event.pageY));
	context.stroke();
	context.beginPath();
	context.moveTo(event.pageX, event.pageY);
	if (event.shiftKey) holdStraight(event);

}

function mouseUp(event) {

	if (x_position == event.pageX && y_position == event.pageY) {
		context.lineTo(event.pageX + 1, event.pageY + getPencilSize());
		show[stroke].push(new Array(event.pageX + 1, event.pageY + getPencilSize()));
	}
	else {
		context.lineTo(event.pageX, event.pageY);
		show[stroke].push(new Array(event.pageX, event.pageY));
	}
	context.stroke();
	canvas.removeEventListener('mousemove', mouseMove, false);
	canvas.removeEventListener('mouseup', mouseUp, false);
	canvas.removeEventListener('mouseout', mouseUp, false);
	if (event.shiftKey) holdStraight(event);
	$(window).keyup(releaseStraight);
	save(show, hide, number);

}

function releaseStraight(event) {

	if (event.keyCode == 16) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		draw(hold_show);
	}

}

function holdStraight(event) {

	if (settings[0] == 1) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		hold_show = show;
		start_x = hold_show[hold_show.length - 1][1][0];
		start_y = hold_show[hold_show.length - 1][1][1];
		color = hold_show[hold_show.length - 1][0];
		hold_show[hold_show.length - 1] = new Array();
		hold_show[hold_show.length - 1].push(String(color));
		hold_show[hold_show.length - 1].push(new Array(start_x, start_y));
		hold_show[hold_show.length - 1].push(new Array(event.pageX, event.pageY));
		draw(hold_show);
	}

}

function save(show, hide, number) {

	created = Math.round(((new Date()).getTime() - Date.UTC(1970, 0, 1)) / 1000);
	if (localStorage[number]) {
		array = localStorage[number].split(',');
		created = array[3];
	}
	updated = Math.round(((new Date()).getTime() - Date.UTC(1970, 0, 1)) / 1000);
	localStorage[number] = new Array([joinArray(show), joinArray(hide), $('#'+number+'_edit').val().replace(/,/g, '.'), created, updated]);
	
}

function splitArray(element) {

	if (element == '') return new Array();
	element = element.split('c');
	for (xp in element) {
		element[xp] = element[xp].split('b');
		for (yp in element[xp]) element[xp][yp] = element[xp][yp].split('a');
	}
	return element;
}

function joinArray(element) {

	re = '';
	for (xp in element) {
		yp_count = 0;
		for (yp in element[xp]) {
			for (zp in element[xp][yp]) {
				re += element[xp][yp][zp];
				if (zp != element[xp][yp].length - 1 && yp_count != 0) re += 'a';
			}
			if (yp != element[xp].length - 1) re += 'b';
			yp_count++;
		}
		if (xp != element.length - 1 && yp_count != 0) re += 'c';
	}
	return re.replace(new RegExp("[c]+$", "g"), "").replace(new RegExp("^[c]+", "g"), "");

}

function draw(show) {

	for (xp in show) {
		zp = -1;
		for (yp in show[xp]) {
			if (zp == -1) color = String(show[xp][yp]);
			if (zp == 0) {
				context.strokeStyle = color;
				if (color == '#ffffff') context.lineWidth = 10;
				else context.lineWidth = 3;
				context.beginPath();
				context.moveTo(show[xp][yp][0], show[xp][yp][1]);
			}
			if (zp != 0 && zp != show[xp].length - 1) {
				context.lineTo(show[xp][yp][0], show[xp][yp][1]);
				context.stroke();
				context.beginPath();
				context.moveTo(show[xp][yp][0], show[xp][yp][1]);
			}
			if (zp == show[xp].length - 1) {
				context.lineTo(show[xp][yp][0], show[xp][yp][1]);
				context.stroke();
			}
			zp++;
		}
	}
}

function randomString(string_length) {

	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	string = '';
	for (var i = 0; i < string_length; i++) {
		var num = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(num, num + 1);
	}
	return string;
	
}

function formatTitle(title) {

	array = title.split(' ');
	title = '';
	for (var array_count = 0; array_count < array.length; array_count++) {
		word = array[array_count];
		if (word.length > 11) {
			title += word.substr(0, 11)+'-'+word.substr(8, word.length - 11);
		}
		else title += word;
		if (array_count != array.length) title += ' ';
	}
	return title;

}

function changePencil(event) {

	context.strokeStyle = getPencilColor();
	context.lineWidth = getPencilSize();
	$('#canvas').toggleClass('eraser');
	$('label').toggleClass('selected');
	if ($('label.left img').attr('src') == 'images/pencil-black.png') {
		$('label.left img').attr('src', 'images/pencil-white.png');
		$('label.right img').attr('src', 'images/eraser-black.png');
	}
	else {
		$('label.left img').attr('src', 'images/pencil-black.png');
		$('label.right img').attr('src', 'images/eraser-white.png');
	}

}

function getPencilColor() {

	return '#'+$('input[name=color]:checked').val();

}

function getPencilSize() {

	if ($('input[name=color]:checked').val() == 'FFFFFF') return 10;
	else return 3;

}

function install(event) {

	modifyDatabase(event);
	localStorage['settings'] = '1,png';

}
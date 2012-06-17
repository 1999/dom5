document.addEventListener("DOMContentLoaded", function() {
	var header = document.create("h1").addClass(["first", "head"]).plaintext("Header text");
	var paraElem = document.create("p").attr({"id" : "para", "align" : "center"}).data("id", "smth").css("marginTop", "12px");

	document.body.append([header, paraElem]);
}, false);

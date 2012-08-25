var kb = {
	cursor: "▁",

	calcDelay: function(c) {
		var ret;
		if(c == "backspace")
			ret = 100;
		else if("؟?!.".indexOf(c) != -1)
			ret = 400;
		else if(",،".indexOf(c) != -1)
			ret = 300;
		else if(";؛".indexOf(c) != -1)
			ret = 200;
		else
			ret = 60;
		return ret;
	},

	simulateType: function (txt, el, cb) {
		var rec = function(i) {
			if(i == txt.length) {
				el.data = txt;
				cb();
				return ;
			}
			el.data = el.data.substr(0, i) + txt[i] + el.data.substr(-1, 1);
			setTimeout(_.bind(rec, this, i + 1), kb.calcDelay(txt[i]));
		};
		setTimeout(_.bind(rec, this, 0), 0);
	}
};

var untype = function(node, cb) {
	if(node.nodeType == 3) {
		node.data = node.data + kb.cursor;
		var rec = function() {
			if(node.data.length == 1) {
				$(node).remove();
				cb();
				return ;
			}
			node.data = node.data.substr(0, node.data.length - 2) + node.data.substr(-1, 1);
			setTimeout(rec, kb.calcDelay("backspace"));
		}
		setTimeout(rec, 0);
	} else if(node.nodeType == 1) {
		var cnt = $(node).contents();
		var rec = function(i) {
			if(i == cnt.length) {
				$(node).remove();
				cb();
				return ;
			}
			untype(cnt[i], _.bind(rec, this, i + 1));
		};
		setTimeout(_.bind(rec, this, 0), 0);
	}
};

var postproc = function(el, cb) {
	if($(el).attr('data-wait')) {
		setTimeout(cb, $(el).attr('data-wait'));
	}
	else if($(el).hasClass('rm')) {
		setTimeout(_.bind(untype, this, el, cb), 600);
	} else {
		cb();
	}
};

var type = function(node, cb) {
	$(node).remove();

	if(node.nodeType == 3) {
		var ret = document.createTextNode(kb.cursor);
		kb.simulateType(node.data, ret, cb);
		return ret;
	} else if(node.nodeType == 1) {
		if(node.tagName == "IMG") {
			var ret = node;
			$(ret).css("display", "none");
			setTimeout(function() {
				$(ret).show(1000, cb); // FIXME: no const
			}, 0);
			return ret;
		} else {
			var ret = node;
			var cnt = $(node).contents().remove();
			var rec = function(i) {
				if(i == cnt.length) {
					postproc(ret, cb);
					return ;
				}
				var obj = type(cnt[i], _.bind(rec, this, i + 1));
				$(ret).append(obj);
			};
			setTimeout(_.bind(rec, this, 0), 0);
			return ret;
		}
	}
};

var typeWrite = function(el, cb) {
	var p = $("<p></p>");
	el.after(p);
	p.append(type(el.get(0), cb));
};


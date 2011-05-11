function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}

/*
 This tests fix an Firefox Issus as pointed out here https://github.com/janl/mustache.js/issues/85
 Firefox escapes URLs, but this kann break the mustache template.
*/

module("ICanHaz-Firefox");
QUnit.reset();

test("replaces the url escape characters with curly braces", function () {
    var expected="<img src=\"http://google.com/\">";
    var data = { url: "http://google.com/" };
    equal(ich.ffurl(data, true), expected);
});

module("ICanHaz");

test("creates function for template", function() {
	expect(1);
	ok(ich.test1 != null, "test1 template exists");
});

test("creates function for div templates", function () {
    ok(ich.divtest1 != null, "divtest1 template exists");
});

test("renders non-parameterized templates", function() {
	expect(3);
	equal(ich.test1({}, true), "<p>This is a test of the emergency broadcast system.</p>"); // raw text
	var nodes = ich.test1({});
	equal(typeof nodes, "object"); 
	equal(nodes.text(), "This is a test of the emergency broadcast system."); 
});

test("renders parameterized templates", function() {
	expect(1);
	equal(ich.test2({prey:'wabbits'}, true), "<span>Be vewwy vewwy quiet, we're hunting wabbits.</span>"); 
});

test("renders parameterized div templates", function () {
   expect(1);
    var data = {
      slimshady: "Chuck Norris"  
    };
    equal(ich.divtest1(data, true), "<p>Hi my name is Chuck Norris</p>");
});

test("renders ad hoc templates", function() {
	ich.addTemplate('favoriteColor', 'Red. No, Blue. Aieee!');
	expect(1);
	equal(ich.favoriteColor({}, true), 'Red. No, Blue. Aieee!');
});

test("renders ad hoc div templates", function () {
    expect(1);
    var text =  "My cat is my lawyer";
    ich.addTemplate("lolz", text);
    equal(ich.lolz({}, true), text);
});

// Newly added support for partials
test("renders partials from &lt;script&gt; tags with class=\"partial\"", function() {
	// partials example from the Mustache README
	expect(1);
	var view = {
  		name: "Joe",
  		winnings: {
    		value: 1000,
    		taxed_value: function() {
        		return this.value - (this.value * 0.4);
    		}
  		}
	}
	equal(ich.welcome(view, true), "<p>Welcome, Joe! You just won $1000 (which is $600 after tax)</p>");
});

test("renders partials from div templates with class='partial'", function () {
   expect(1);
   var data = {
        name: "Chuck Norris",
        kicks: {
            today: 12,
            tomorrow: function() {
                return this.today * 42;
            }   
        }
   };

   equal(ich.kick(data, true), "<p>Hi, I'm Chuck Norris and I roundhouse-kicked 12 people today. By tomorrow it will be 504</p>")
});

test("renders partials added at runtime", function() {
	// partials example from the Mustache README
	ich.addPartial('winnings2', "You just won ${{value}} (which is ${{taxed_value}} after tax)");
	ich.addTemplate('welcome2', "Welcome, {{name}}! {{>winnings2}}");
	expect(1);
	var view = {
  		name: "Joe",
  		winnings2: {
    		value: 1000,
    		taxed_value: function() {
        		return this.value - (this.value * 0.4);
    		}
  		}
	}
	equal(ich.welcome2(view, true), 'Welcome, Joe! You just won $1000 (which is $600 after tax)');
});

test("renders div partials added at runtime", function () {
    ich.addPartial("kicks2", "and I roundhouse-kicked {{today}} people today. By tomorrow it will be {{tomorrow}}");
    ich.addTemplate("kick2", "<p>Hi, I'm {{name}} {{>kicks2}}</p>");

    var data = {
        name: "Chuck Norris",
        kicks2: {
            today: 12,
            tomorrow: function() {
                return this.today * 42;
            }
        }  
    };

    equal(ich.kick2(data, true), "<p>Hi, I'm Chuck Norris and I roundhouse-kicked 12 people today. By tomorrow it will be 504</p>");
});

test("showAll shouldn't let you edit actual templates", function () {
    var welcome = ich.templates.welcome;
    
    ich.templates.welcome = "something new";
    notEqual(ich.welcome(), "something new", "the template should not have changed");
});

test("clearAll should wipe 'em out", function () {
    ich.clearAll();
    
    ok(isEmptyObject(ich.templates));
    ok(isEmptyObject(ich.partials));
    
    equal(ich['welcome2'], undefined, "welcome2 template gone?");
});

test("grabTemplates that are loaded in later", function () {
    // not recommended use, but should work nonetheless
    $('head').append('<script id="flint" type="text/html">yabba {{ something }} doo!</script>');
    
    ich.grabTemplates();
    equal(ich.flint({something: 'dabba'}, true), "yabba dabba doo!", "should have new template");
});

test("refresh should empty then grab new", function () {
    // not recommended use, but should work nonetheless
    $('head').append('<script id="mother" type="text/html">your mother was a {{ something }}...</script>');
    
    ich.refresh();
    
    equal(ich.mother({something: 'hampster'}, true), "your mother was a hampster...", "should have new template");
    equal(ich.hasOwnProperty('flint'), false, "flint template should be gone");
});


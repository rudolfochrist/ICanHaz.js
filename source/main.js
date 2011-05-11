/*!
  ICanHaz.js -- by @HenrikJoreteg
*/
/*global jQuery  */
function ICanHaz() {
    var self = this;
    self.VERSION = "@VERSION@";
    self.templates = {};
    self.partials = {};
    
    // public function for adding templates
    // We're enforcing uniqueness to avoid accidental template overwrites.
    // If you want a different template, it should have a different name.
    self.addTemplate = function (name, templateString) {
        if (self[name]) throw "Invalid name: " + name + ".";
        if (self.templates[name]) throw "Template \" + name + \" exists";
        
        self.templates[name] = templateString;
        self[name] = function (data, raw) {
            data = data || {};
            var result = Mustache.to_html(self.templates[name], data, self.partials);
            return raw ? result : $(result);
        };       
    };
    
    // public function for adding partials
    self.addPartial = function (name, templateString) {
        if (self.partials[name]) {
            throw "Partial \" + name + \" exists";
        } else {
            self.partials[name] = templateString;
        }
    };
    
    // grabs templates from the DOM and caches them.
    // Loop through and add templates.
    // Whitespace at beginning and end of all templates inside <script> tags will 
    // be trimmed. If you want whitespace around a partial, add it in the parent, 
    // not the partial. Or do it explicitly using <br/> or &nbsp;
    self.grabTemplates = function () {        
        $('script[type="text/html"]').add("div.template").each(function (a, b) {
            var script = $((typeof a === 'number') ? b : a), // Zepto doesn't bind this
                text = (''.trim) ? script.html().trim() : $.trim(script.html());

            text = text.replace(/&gt;/, ">"); // musatche partials {{> partial}} get escaped when in div
            text = self._firefoxUrlCleanup(text);

            self[script.hasClass('partial') ? 'addPartial' : 'addTemplate'](script.attr('id'), text);
            script.remove();
        });
    };
    
    // clears all retrieval functions and empties caches
    self.clearAll = function () {
        for (var key in self.templates) {
            delete self[key];
        }
        self.templates = {};
        self.partials = {};
    };
    
    self.refresh = function () {
        self.clearAll();
        self.grabTemplates();
    };

    /*
        Firefox escapes URL (e.g. src attribute of the img tag). This can break the template 
        (e.g. <img src="{{ulr}}">). So the template must be unescaped.
        Refer: https://github.com/janl/mustache.js/issues/85
    */
    self._firefoxUrlCleanup = function (text) {
        return text.replace(/%7B%7B/, "{{").replace(/%7D%7D/, "}}");
    };
}

window.ich = new ICanHaz();

// init itself on document ready
$(function () {
    ich.grabTemplates();
});

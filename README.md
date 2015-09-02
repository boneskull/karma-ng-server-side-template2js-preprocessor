# karma-ng-server-side-template2js-preprocessor

Karma preprocessor to scan HTML-based server side templates for embedded AngularJS templates, and convert the AngularJS templates to JS for use in unit tests.

This is useful for *[testing directives](https://github.com/vojtajina/ng-directive-testing).*

Based on [karma-ng-html2js-preprocessor](https://github.com/karma-runner/karma-ng-html2js-preprocessor).

Module name left long intentionally.

## Installation

`npm install karma-ng-server-side-template2js-preprocessor`

## What This Module Does Not Do

* **It does not compile your server-side templates.**  Thus, if you have template code within any of your AngularJS
templates, it will be rendered raw.  Try [Protractor](https://github.com/angular/protractor)?
* It does not understand anything that doesn't at least vaguely look like HTML.  Karma runs in browsers and browsers need HTML.  Templating languages like Jade do not run in browsers unless compiled.  If you want to use a Jade template, compile it, and hand the resulting HTML to Karma.

## What This Module Actually Does

* It takes some sort of HTML-like server-side template and extracts the [AngularJS templates](http://docs.angularjs.org/guide/templates) from it.  Given an EJS template (for example), `foo.ejs`:

```html
<script type="text/ng-template" id="bar">
  <div ng-repeat="herp in derp">
    <!-- ... -->
  </div>
</script>

<script type="text/ng-template" id="baz">
  <ul>
    <li ng-repeat="apples in oranges">
    <!-- ... -->
    </li>
  </ul>
</script>

<%- // EJS garbage in here, but we ignore it %>
```

and a Karma configuration containing:

```js
preprocessors: {
  '**/*.ejs': ['ng-sst2js']
},

ngSst2JsPreprocessor: {
  moduleName: 'myTemplates'
}
```

It will produce a module named `myTemplates` which can then be loaded by your unit tests.  Templates `bar` and `baz` will live in your [`$templateCache`](http://docs.angularjs.org/api/ng/service/$templateCache) service.

They can then be used like so:

```js
'use strict';

describe('myDirective', function () {

    beforeEach(module(
        'myTemplates',
        'myModuleContainingDirective'));

    it('has templates', inject(function ($compile, $rootScope) {
        // myDirective leverages the "bar" template
        var markup = '<my-directive></my-directive>',
            compiled,
            scope = $rootScope.$new();
        compiled = $compile(markup)(scope);
        scope.$apply();
        expect(compiled.find('div').attr('ng-repeat')).to.equal('herp in derp');
    }));
});
```

*(Note: example has not been tested; something similar has, so something similar should work, at least.)*

## TODO

See [issues](https://github.com/boneksull/karma-ng-server-side-template2js-preprocessor).

## Author

[Christopher Hiller](https://boneskull.com) <boneskull@boneskull.com>


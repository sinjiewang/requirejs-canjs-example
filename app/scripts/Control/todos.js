define(['can', 'can/view/ejs'], function (can) {

    return can.Control.extend({
        //defaults are merged into the options arg provided to the constructor
        defaults : { view: 'views/todos.ejs' }
    }, {
        init: function( element , options ) {
            var self = this;

            can.view(
                this.options.view,
                {todos: ['hello', '!', '!!', '!!!']},
                function (view) {
                    self.element.html(view);
                }
            )
        }
    });
});

/* global describe, it */

(function () {
    'use strict';

    describe('Give it some context', function () {
        var todos;

        beforeEach(function () {
            // console.log('beforeEach');
            todos = new Todos('#todos', {});
        });

        afterEach(function (done) {
            // console.log('afterEach');
            todos.destroy();
            done();
        });

        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function (done) {
                setTimeout(function () {
                    expect($('#todos').length, '#todos\'s count').to.equal(1);
                    expect($('h3').length, 'h3\'s count').to.equal(4);
                    done();
                }, 1000);
            });
        });
    });
})();

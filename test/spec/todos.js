/* global describe, it */
define(['Control/todos'], function (Todos) {

    describe('Give it some context', function () {
        var todos;

        beforeEach(function () {
            // console.log('beforeEach');
            todos = new Todos('#mocha', {});
        });

        afterEach(function (done) {
            // console.log('afterEach');
            todos.destroy();
            done();
        });

        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function (done) {
                setTimeout(function () {
                    expect($('#mocha').length, '#mocha\'s count').to.equal(1);
                    expect($('h3').length, 'h3\'s count').to.equal(4);
                    done();
                }, 1000);
            });
        });
    });
});

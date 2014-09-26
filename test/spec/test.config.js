require.config({
    baseUrl: 'scripts',
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        can: '../bower_components/canjs/amd/can',
        views: '../views',
        spce: '../spec'
    }
});

require([
    'spce/todos'
], function () {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});

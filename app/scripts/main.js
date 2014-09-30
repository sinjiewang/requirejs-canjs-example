'use strict';

$(document).foundation();

define('jquery', [], function() {
    return jQuery;
});

require.config({
    baseUrl: 'scripts',
    paths: {
        can: '../bower_components/canjs/amd/can',
        views: '../views'
    }
});

require(['Control/todos'], function (Todos) {
    new Todos('#todos', {});
});

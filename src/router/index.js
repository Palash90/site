import Vue from 'vue'
import Router from 'vue-router'
import ComponentFactory from '@/components/ComponentFactory'
import { GetRouteData } from '../data/RouteData'

Vue.use(Router)

var routes = GetRouteData();

var routers = [];

for (let route in routes) {
    var router = {
        path: routes[route].path,
        name: routes[route].name,
        props: routes[route].data,
        component: ComponentFactory
    };
    routers.push(router);
}

export default new Router({
    routes: routers
})

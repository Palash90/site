export function GetRouteData() {
    var routes = [
        {
            path: '/',
            name: 'HelloWorld',
            title: 'Home Page',
            exact:true,
            data: {
                str: "Object Data passed for Home Page Component",
                componentName: 'HelloWorld'
            }

        }, {
            path: "/app",
            name: "Avatar",
            title: 'Avatar',
            exact: false,
            data: {
                str: "Object Data passed for Avatar Component",
                componentName: 'Avatar'
            }
        }
    ];
    return routes;
}